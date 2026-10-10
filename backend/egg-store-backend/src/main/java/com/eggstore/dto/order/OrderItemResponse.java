package com.eggstore.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productVariantId,
        String productName,
        Integer packSize,
        int quantity,
        BigDecimal priceAtPurchase
) {}
