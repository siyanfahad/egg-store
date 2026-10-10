package com.eggstore.controller;

import com.eggstore.dto.order.CheckoutSummaryResponse;
import com.eggstore.dto.order.CreateOrderRequest;
import com.eggstore.dto.order.OrderResponse;
import com.eggstore.dto.order.VerifyPaymentRequest;
import com.eggstore.service.OrderService;
import com.eggstore.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/v1/checkout/summary")
    public ResponseEntity<CheckoutSummaryResponse> summary() {
        return ResponseEntity.ok(orderService.getSummary(SecurityUtils.currentUserId()));
    }

    @PostMapping("/api/v1/orders")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(SecurityUtils.currentUserId(), request));
    }

    @PostMapping("/api/v1/orders/{id}/verify-payment")
    public ResponseEntity<OrderResponse> verifyPayment(@PathVariable Long id, @Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(orderService.verifyPayment(SecurityUtils.currentUserId(), id, request));
    }

    @GetMapping("/api/v1/orders")
    public ResponseEntity<Page<OrderResponse>> myOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.listMyOrders(SecurityUtils.currentUserId(), pageable));
    }

    @GetMapping("/api/v1/orders/{id}")
    public ResponseEntity<OrderResponse> myOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getMyOrder(SecurityUtils.currentUserId(), id));
    }

    @PostMapping("/api/v1/orders/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelMyOrder(SecurityUtils.currentUserId(), id));
    }
}
