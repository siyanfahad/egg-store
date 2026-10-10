package com.eggstore.controller;

import com.eggstore.dto.order.AssignOrderRequest;
import com.eggstore.dto.order.OrderResponse;
import com.eggstore.dto.order.OrderStatusUpdateRequest;
import com.eggstore.entity.enums.OrderStatus;
import com.eggstore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> list(@RequestParam(required = false) OrderStatus status, Pageable pageable) {
        return ResponseEntity.ok(orderService.adminListOrders(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.adminGetOrder(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.adminUpdateStatus(id, request));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<OrderResponse> assign(@PathVariable Long id, @Valid @RequestBody AssignOrderRequest request) {
        return ResponseEntity.ok(orderService.adminAssignStaff(id, request));
    }
}
