package com.eggstore.service;

import com.eggstore.dto.cart.*;
import com.eggstore.entity.Cart;
import com.eggstore.entity.CartItem;
import com.eggstore.entity.Discount;
import com.eggstore.entity.ProductVariant;
import com.eggstore.exception.BadRequestException;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.CartItemRepository;
import com.eggstore.repository.CartRepository;
import com.eggstore.repository.DiscountRepository;
import com.eggstore.repository.ProductVariantRepository;
import com.eggstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final DiscountRepository discountRepository;
    private final UserRepository userRepository;

    // ---- Cart resolution (guest vs account) ----

    @Transactional
    public Cart resolveOrCreateCart(Long userId, String guestSessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId).orElseGet(() -> {
                Cart cart = Cart.builder().user(userRepository.getReferenceById(userId)).build();
                return cartRepository.save(cart);
            });
        }
        if (guestSessionId == null || guestSessionId.isBlank()) {
            throw new BadRequestException("guestSessionId is required for unauthenticated cart access");
        }
        return cartRepository.findByGuestSessionId(guestSessionId).orElseGet(() -> {
            Cart cart = Cart.builder()
                    .guestSessionId(guestSessionId)
                    .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                    .build();
            return cartRepository.save(cart);
        });
    }

    @Transactional
    public void mergeGuestCartIntoUser(String guestSessionId, Long userId) {
        Optional<Cart> guestCartOpt = cartRepository.findByGuestSessionId(guestSessionId);
        if (guestCartOpt.isEmpty()) return;

        Cart guestCart = guestCartOpt.get();
        Cart userCart = resolveOrCreateCart(userId, null);

        for (CartItem guestItem : guestCart.getItems()) {
            cartItemRepository.findByCartIdAndProductVariantId(userCart.getId(), guestItem.getProductVariant().getId())
                    .ifPresentOrElse(
                            existing -> {
                                existing.setQuantity(existing.getQuantity() + guestItem.getQuantity());
                                cartItemRepository.save(existing);
                            },
                            () -> {
                                CartItem moved = CartItem.builder()
                                        .cart(userCart)
                                        .productVariant(guestItem.getProductVariant())
                                        .quantity(guestItem.getQuantity())
                                        .priceSnapshot(guestItem.getProductVariant().getPrice())
                                        .build();
                                cartItemRepository.save(moved);
                            }
                    );
        }
        cartRepository.delete(guestCart);
    }

    // ---- Item operations ----

    @Transactional
    public CartResponse addItem(Long userId, String guestSessionId, AddCartItemRequest request) {
        Cart cart = resolveOrCreateCart(userId, guestSessionId);
        ProductVariant variant = variantRepository.findById(request.productVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        if (!variant.isActive()) {
            throw new BadRequestException("This product is currently unavailable");
        }

        cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId())
                .ifPresentOrElse(
                        existing -> {
                            existing.setQuantity(existing.getQuantity() + request.quantity());
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .productVariant(variant)
                                    .quantity(request.quantity())
                                    .priceSnapshot(variant.getPrice())
                                    .build();
                            cartItemRepository.save(item);
                        }
                );

        return buildCartResponse(reload(cart.getId()));
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, String guestSessionId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = resolveOrCreateCart(userId, guestSessionId);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return buildCartResponse(reload(cart.getId()));
    }

    @Transactional
    public CartResponse removeItem(Long userId, String guestSessionId, Long itemId) {
        Cart cart = resolveOrCreateCart(userId, guestSessionId);

        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cart.getItems().remove(item);

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse getCart(Long userId, String guestSessionId) {
        Cart cart = resolveOrCreateCart(userId, guestSessionId);
        return buildCartResponse(cart);
    }

    // ---- Discount ----

    @Transactional
    public CartResponse applyDiscount(Long userId, String guestSessionId, ApplyDiscountRequest request) {
        Cart cart = resolveOrCreateCart(userId, guestSessionId);
        Discount discount = discountRepository.findByCodeIgnoreCase(request.code())
                .orElseThrow(() -> new BadRequestException("Invalid discount code"));

        BigDecimal subtotal = calculateSubtotal(cart);
        if (!discount.isCurrentlyValid(subtotal)) {
            throw new BadRequestException("This discount code is not applicable to your order");
        }

        cart.setAppliedDiscount(discount);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeDiscount(Long userId, String guestSessionId) {
        Cart cart = resolveOrCreateCart(userId, guestSessionId);
        cart.setAppliedDiscount(null);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ---- Calculations (server-authoritative — never trust client totals) ----

    BigDecimal calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getProductVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    BigDecimal calculateDiscountAmount(Cart cart, BigDecimal subtotal) {
        Discount discount = cart.getAppliedDiscount();
        if (discount == null || !discount.isCurrentlyValid(subtotal)) {
            return BigDecimal.ZERO;
        }
        BigDecimal amount = switch (discount.getType()) {
            case PERCENTAGE -> subtotal.multiply(discount.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            case FIXED -> discount.getValue();
        };
        return amount.min(subtotal); // never discount below zero
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(i -> new CartItemResponse(
                        i.getId(),
                        i.getProductVariant().getId(),
                        i.getProductVariant().getProduct().getName(),
                        i.getProductVariant().getPackSize(),
                        i.getProductVariant().getPrice(),
                        i.getQuantity(),
                        i.getProductVariant().getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                ))
                .toList();

        BigDecimal subtotal = calculateSubtotal(cart);
        BigDecimal discountAmount = calculateDiscountAmount(cart, subtotal);
        BigDecimal total = subtotal.subtract(discountAmount);

        String discountCode = cart.getAppliedDiscount() != null ? cart.getAppliedDiscount().getCode() : null;

        return new CartResponse(cart.getId(), itemResponses, discountCode, subtotal, discountAmount, total);
    }

    private Cart reload(Long cartId) {
        return cartRepository.findById(cartId).orElseThrow();
    }
}
