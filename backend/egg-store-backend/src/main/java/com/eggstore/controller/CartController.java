package com.eggstore.controller;

import com.eggstore.dto.cart.*;
import com.eggstore.service.CartService;
import com.eggstore.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return ResponseEntity.ok(cartService.getCart(userId, guestSessionId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return ResponseEntity.ok(cartService.addItem(userId, guestSessionId, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, guestSessionId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId,
            @PathVariable Long itemId
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return ResponseEntity.ok(cartService.removeItem(userId, guestSessionId, itemId));
    }

    @PostMapping("/apply-discount")
    public ResponseEntity<CartResponse> applyDiscount(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId,
            @Valid @RequestBody ApplyDiscountRequest request
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return ResponseEntity.ok(cartService.applyDiscount(userId, guestSessionId, request));
    }

    @DeleteMapping("/discount")
    public ResponseEntity<CartResponse> removeDiscount(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String guestSessionId
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return ResponseEntity.ok(cartService.removeDiscount(userId, guestSessionId));
    }
}
