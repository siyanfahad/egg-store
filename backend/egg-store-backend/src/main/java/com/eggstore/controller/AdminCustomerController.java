package com.eggstore.controller;

import com.eggstore.dto.admin.CustomerResponse;
import com.eggstore.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService customerService;

    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(customerService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    // Customer order history for a given customer is exposed via AdminOrderController's
    // list endpoint using a customerId filter — add that filter to OrderRepository/OrderService
    // (findByUserId + status/date filters combined) if the client needs a dedicated view here.
}
