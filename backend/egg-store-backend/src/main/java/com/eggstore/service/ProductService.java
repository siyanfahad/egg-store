package com.eggstore.service;

import com.eggstore.dto.product.CategoryResponse;
import com.eggstore.dto.product.ProductResponse;
import com.eggstore.dto.product.ProductVariantResponse;
import com.eggstore.entity.Category;
import com.eggstore.entity.Product;
import com.eggstore.entity.ProductVariant;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.CategoryRepository;
import com.eggstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductResponse> search(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                         Integer packSize, boolean inStockOnly, Pageable pageable) {
        return productRepository.search(search, categoryId, minPrice, maxPrice, packSize, inStockOnly, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return toResponse(product);
    }

    public List<CategoryResponse> listCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription()))
                .toList();
    }

    private ProductResponse toResponse(Product p) {
        List<ProductVariantResponse> variants = p.getVariants().stream()
                .filter(ProductVariant::isActive)
                .map(v -> new ProductVariantResponse(v.getId(), v.getPackSize(), v.getImageUrl(), v.getPrice(),
                        v.getStockQuantity(), v.getStockQuantity() > 0))
                .toList();

        Category c = p.getCategory();
        CategoryResponse categoryResponse = new CategoryResponse(c.getId(), c.getName(), c.getDescription());

        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getImageUrl(), categoryResponse, variants);
    }
}
