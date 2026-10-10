package com.eggstore.service;

import com.eggstore.dto.order.*;
import com.eggstore.entity.*;
import com.eggstore.entity.enums.OrderStatus;
import com.eggstore.entity.enums.PaymentStatus;
import com.eggstore.entity.enums.Role;
import com.eggstore.exception.BadRequestException;
import com.eggstore.exception.InsufficientStockException;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final RazorpayService razorpayService;

    // ---- Checkout summary (pre-payment, read-only, server-recalculated) ----

    @Transactional(readOnly = true)
    public CheckoutSummaryResponse getSummary(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        List<OrderItemResponse> items = cart.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProductVariant().getId(),
                        i.getProductVariant().getProduct().getName(),
                        i.getProductVariant().getPackSize(),
                        i.getQuantity(),
                        i.getProductVariant().getPrice()))
                .toList();

        BigDecimal subtotal = cartService.calculateSubtotal(cart);
        BigDecimal discountAmount = cartService.calculateDiscountAmount(cart, subtotal);
        BigDecimal total = subtotal.subtract(discountAmount);
        String discountCode = cart.getAppliedDiscount() != null ? cart.getAppliedDiscount().getCode() : null;

        return new CheckoutSummaryResponse(items, discountCode, subtotal, discountAmount, total);
    }

    // ---- Order creation ----

    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Address address = addressRepository.findById(request.addressId())
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        // Recalculate everything server-side from current DB state — cart's price_snapshot is never trusted.
        BigDecimal subtotal = cartService.calculateSubtotal(cart);
        BigDecimal discountAmount = cartService.calculateDiscountAmount(cart, subtotal);
        BigDecimal total = subtotal.subtract(discountAmount);

        Order order = Order.builder()
                .user(userRepository.getReferenceById(userId))
                .address(address)
                .discount(cart.getAppliedDiscount())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .build();
        order = orderRepository.save(order);

        // Lock and decrement stock atomically per line item, within this same transaction.
        for (CartItem item : cart.getItems()) {
            ProductVariant variant = variantRepository.findByIdForUpdate(item.getProductVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for " + variant.getProduct().getName() + " (" + variant.getPackSize() + " pack)");
            }

            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            variantRepository.save(variant);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(item.getQuantity())
                    .priceAtPurchase(variant.getPrice())
                    .build();
            orderItemRepository.save(orderItem);

            inventoryLogRepository.save(InventoryLog.builder()
                    .productVariant(variant)
                    .changeQuantity(-item.getQuantity())
                    .reason("ORDER")
                    .referenceOrderId(order.getId())
                    .build());
        }

        // Create the Razorpay order for the frontend Checkout widget.
        String razorpayOrderId = razorpayService.createOrder(total, "order_" + order.getId());

        Payment payment = Payment.builder()
                .order(order)
                .razorpayOrderId(razorpayOrderId)
                .status(PaymentStatus.CREATED)
                .amount(total)
                .build();
        paymentRepository.save(payment);

        // Clear the cart now that stock is committed to this order.
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setAppliedDiscount(null);
        cartRepository.save(cart);

        return toResponse(order, razorpayOrderId, razorpayService.getPublicKeyId());
    }

    // ---- Payment verification (called by frontend after Checkout widget completes) ----

    @Transactional
    public OrderResponse verifyPayment(Long userId, Long orderId, VerifyPaymentRequest request) {
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

                if (!Objects.equals(payment.getRazorpayOrderId(), request.razorpayOrderId())) {
                        throw new BadRequestException("Payment order does not match this order");
                }

        // Idempotency: if already captured (e.g. via webhook beating this call), don't reprocess.
        if (payment.getStatus() == PaymentStatus.CAPTURED) {
            return toResponse(order, null, null);
        }

        boolean valid = razorpayService.verifyPaymentSignature(
                request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());

        if (!valid) {
            payment.setStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            paymentRepository.save(payment);
            orderRepository.save(order);
            throw new BadRequestException("Payment verification failed");
        }

        payment.setRazorpayPaymentId(request.razorpayPaymentId());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setVerifiedAt(Instant.now());
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return toResponse(order, null, null);
    }

    // ---- Customer order history ----

    @Transactional(readOnly = true)
    public Page<OrderResponse> listMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(o -> toResponse(o, null, null));
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order, null, null);
    }

    @Transactional
    public OrderResponse cancelMyOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order can no longer be cancelled");
        }

        restockOrderItems(order);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        // NOTE: trigger a Razorpay refund via the SDK's refund API here if payment was already captured.
        return toResponse(order, null, null);
    }

    private void restockOrderItems(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = variantRepository.findByIdForUpdate(item.getProductVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
            variantRepository.save(variant);

            inventoryLogRepository.save(InventoryLog.builder()
                    .productVariant(variant)
                    .changeQuantity(item.getQuantity())
                    .reason("ADJUSTMENT")
                    .referenceOrderId(order.getId())
                    .build());
        }
    }

    // ---- Admin ----

    @Transactional(readOnly = true)
    public Page<OrderResponse> adminListOrders(OrderStatus status, Pageable pageable) {
        Page<Order> page = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return page.map(o -> toResponse(o, null, null));
    }

    @Transactional(readOnly = true)
    public OrderResponse adminGetOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order, null, null);
    }

    @Transactional
    public OrderResponse adminUpdateStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(request.status());
        orderRepository.save(order);
        return toResponse(order, null, null);
    }

    @Transactional
    public OrderResponse adminAssignStaff(Long orderId, AssignOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User staff = userRepository.findById(request.staffUserId())
                .filter(u -> u.getRole() == Role.DELIVERY_STAFF)
                .orElseThrow(() -> new BadRequestException("Selected user is not a delivery staff member"));

        order.setAssignedStaff(staff);
        orderRepository.save(order);
        return toResponse(order, null, null);
    }

    // ---- Delivery staff ----

    @Transactional(readOnly = true)
    public Page<OrderResponse> deliveryListAssigned(Long staffId, Pageable pageable) {
        return orderRepository.findByAssignedStaffIdAndStatus(staffId, OrderStatus.OUT_FOR_DELIVERY, pageable)
                .map(o -> toResponse(o, null, null));
    }

    @Transactional
    public OrderResponse deliveryUpdateStatus(Long staffId, Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getAssignedStaff() == null || !order.getAssignedStaff().getId().equals(staffId)) {
            throw new BadRequestException("This order is not assigned to you");
        }
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY || request.status() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivery staff may only transition OUT_FOR_DELIVERY to DELIVERED");
        }

        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
        return toResponse(order, null, null);
    }

    // ---- Mapping ----

    private OrderResponse toResponse(Order order, String razorpayOrderId, String razorpayKeyId) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProductVariant().getId(),
                        i.getProductVariant().getProduct().getName(),
                        i.getProductVariant().getPackSize(),
                        i.getQuantity(),
                        i.getPriceAtPurchase()))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getTotalAmount(),
                items,
                order.getCreatedAt(),
                razorpayOrderId,
                razorpayKeyId
        );
    }
}
