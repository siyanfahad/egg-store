package com.eggstore.service;

import com.eggstore.dto.order.VerifyPaymentRequest;
import com.eggstore.entity.Order;
import com.eggstore.entity.Payment;
import com.eggstore.entity.User;
import com.eggstore.entity.enums.OrderStatus;
import com.eggstore.entity.enums.PaymentStatus;
import com.eggstore.exception.BadRequestException;
import com.eggstore.repository.AddressRepository;
import com.eggstore.repository.CartItemRepository;
import com.eggstore.repository.CartRepository;
import com.eggstore.repository.InventoryLogRepository;
import com.eggstore.repository.OrderItemRepository;
import com.eggstore.repository.OrderRepository;
import com.eggstore.repository.PaymentRepository;
import com.eggstore.repository.ProductVariantRepository;
import com.eggstore.repository.UserRepository;
import com.eggstore.service.RazorpayService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private InventoryLogRepository inventoryLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CartService cartService;
    @Mock
    private RazorpayService razorpayService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void rejectsPaymentForDifferentRazorpayOrderWithoutChangingOrderState() {
        Order order = Order.builder()
                .id(42L)
                .user(User.builder().id(7L).build())
                .build();
        Payment payment = Payment.builder()
                .order(order)
                .razorpayOrderId("order_expected")
                .status(PaymentStatus.CREATED)
                .build();
        when(orderRepository.findById(42L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(42L)).thenReturn(Optional.of(payment));

        VerifyPaymentRequest request = new VerifyPaymentRequest(
                "order_other", "payment_other", "signature_other");

        assertThrows(BadRequestException.class,
                () -> orderService.verifyPayment(7L, 42L, request));

        assertEquals(PaymentStatus.CREATED, payment.getStatus());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        verifyNoInteractions(razorpayService);
    }
}