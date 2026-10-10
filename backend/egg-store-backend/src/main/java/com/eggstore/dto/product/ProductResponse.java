package com.eggstore.dto.product;

import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        String imageUrl,
        CategoryResponse category,
        List<ProductVariantResponse> variants
) {}
