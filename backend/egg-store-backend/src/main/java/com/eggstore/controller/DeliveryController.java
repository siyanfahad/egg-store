package com.eggstore.controller;

import com.eggstore.dto.order.OrderResponse;
import com.eggstore.dto.order.OrderStatusUpdateRequest;
import com.eggstore.service.OrderService;
import com.eggstore.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> myAssignedOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.deliveryListAssigned(SecurityUtils.currentUserId(), pageable));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        // Reuses admin lookup for now — in a fuller build, return a delivery-scoped DTO
        // that excludes payment details and full customer PII per SRS Section 8.8.
        return ResponseEntity.ok(orderService.adminGetOrder(id));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.deliveryUpdateStatus(SecurityUtils.currentUserId(), id, request));
    }
}
