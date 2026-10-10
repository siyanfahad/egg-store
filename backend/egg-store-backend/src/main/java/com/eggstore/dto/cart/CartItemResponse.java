package com.eggstore.dto.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productVariantId,
        String productName,
        Integer packSize,
        BigDecimal currentPrice,
        int quantity,
        BigDecimal lineTotal
) {}
