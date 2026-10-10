package com.eggstore.dto.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Long cartId,
        List<CartItemResponse> items,
        String appliedDiscountCode,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal estimatedTotal
) {}
