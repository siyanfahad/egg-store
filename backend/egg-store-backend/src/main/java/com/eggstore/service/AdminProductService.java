package com.eggstore.service;

import com.eggstore.dto.admin.ProductRequest;
import com.eggstore.dto.admin.StockAdjustRequest;
import com.eggstore.dto.admin.VariantRequest;
import com.eggstore.dto.product.ProductResponse;
import com.eggstore.dto.product.ProductVariantResponse;
import com.eggstore.entity.Category;
import com.eggstore.entity.InventoryLog;
import com.eggstore.entity.Product;
import com.eggstore.entity.ProductVariant;
import com.eggstore.exception.BadRequestException;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.CategoryRepository;
import com.eggstore.repository.InventoryLogRepository;
import com.eggstore.repository.ProductRepository;
import com.eggstore.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryLogRepository inventoryLogRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> listAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
                .category(category)
                .name(request.name())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .active(true)
                .build();
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setCategory(category);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setImageUrl(request.imageUrl());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deactivate(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductVariantResponse addVariant(Long productId, VariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .packSize(request.packSize())
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .active(true)
                .build();
        variant = variantRepository.save(variant);
        return toVariantResponse(variant);
    }

    @Transactional
    public ProductVariantResponse updateVariant(Long variantId, VariantRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        variant.setPackSize(request.packSize());
        variant.setPrice(request.price());
        variant.setStockQuantity(request.stockQuantity());

        return toVariantResponse(variantRepository.save(variant));
    }

    @Transactional
    public ProductVariantResponse adjustStock(Long variantId, StockAdjustRequest request) {
        ProductVariant variant = variantRepository.findByIdForUpdate(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        int newQuantity = variant.getStockQuantity() + request.changeQuantity();
        if (newQuantity < 0) {
            throw new BadRequestException("Resulting stock cannot be negative");
        }
        variant.setStockQuantity(newQuantity);
        variantRepository.save(variant);

        inventoryLogRepository.save(InventoryLog.builder()
                .productVariant(variant)
                .changeQuantity(request.changeQuantity())
                .reason(request.reason())
                .build());

        return toVariantResponse(variant);
    }

    @Transactional(readOnly = true)
    public List<ProductVariantResponse> lowStock(int threshold) {
        return variantRepository.findLowStock(threshold).stream().map(this::toVariantResponse).toList();
    }

    private ProductResponse toResponse(Product p) {
        List<ProductVariantResponse> variants = p.getVariants().stream().map(this::toVariantResponse).toList();
        var categoryResponse = new com.eggstore.dto.product.CategoryResponse(
                p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getDescription());
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getImageUrl(), categoryResponse, variants);
    }

    private ProductVariantResponse toVariantResponse(ProductVariant v) {
        return new ProductVariantResponse(v.getId(), v.getPackSize(), v.getImageUrl(), v.getPrice(),
                v.getStockQuantity(), v.getStockQuantity() > 0);
    }
}
