package com.eggstore.controller;

import com.eggstore.dto.admin.DiscountRequest;
import com.eggstore.entity.Discount;
import com.eggstore.service.AdminDiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/discounts")
@RequiredArgsConstructor
public class AdminDiscountController {

    private final AdminDiscountService discountService;

    @GetMapping
    public ResponseEntity<List<Discount>> list() {
        return ResponseEntity.ok(discountService.list());
    }

    @PostMapping
    public ResponseEntity<Discount> create(@Valid @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(discountService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Discount> update(@PathVariable Long id, @Valid @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(discountService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Discount> setStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        return ResponseEntity.ok(discountService.setActive(id, active));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
