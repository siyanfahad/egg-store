package com.eggstore.dto.product;

import java.math.BigDecimal;

public record ProductVariantResponse(
        Long id,
        Integer packSize,
        String imageUrl,
        BigDecimal price,
        Integer stockQuantity,
        boolean inStock
) {}
