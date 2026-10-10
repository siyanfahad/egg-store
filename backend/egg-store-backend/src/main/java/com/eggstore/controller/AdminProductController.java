package com.eggstore.controller;

import com.eggstore.dto.admin.ProductRequest;
import com.eggstore.dto.admin.StockAdjustRequest;
import com.eggstore.dto.admin.VariantRequest;
import com.eggstore.dto.product.ProductResponse;
import com.eggstore.dto.product.ProductVariantResponse;
import com.eggstore.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> listProducts(Pageable pageable) {
        return ResponseEntity.ok(adminProductService.listAll(pageable));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminProductService.create(request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminProductService.update(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deactivateProduct(@PathVariable Long id) {
        adminProductService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/products/{id}/variants")
    public ResponseEntity<ProductVariantResponse> addVariant(@PathVariable Long id, @Valid @RequestBody VariantRequest request) {
        return ResponseEntity.ok(adminProductService.addVariant(id, request));
    }

    @PutMapping("/variants/{id}")
    public ResponseEntity<ProductVariantResponse> updateVariant(@PathVariable Long id, @Valid @RequestBody VariantRequest request) {
        return ResponseEntity.ok(adminProductService.updateVariant(id, request));
    }

    @PutMapping("/variants/{id}/stock")
    public ResponseEntity<ProductVariantResponse> adjustStock(@PathVariable Long id, @Valid @RequestBody StockAdjustRequest request) {
        return ResponseEntity.ok(adminProductService.adjustStock(id, request));
    }

    @GetMapping("/stock/low")
    public ResponseEntity<List<ProductVariantResponse>> lowStock(@RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(adminProductService.lowStock(threshold));
    }
}
