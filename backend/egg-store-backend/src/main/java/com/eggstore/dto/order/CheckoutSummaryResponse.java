package com.eggstore.dto.order;

import java.math.BigDecimal;
import java.util.List;

public record CheckoutSummaryResponse(
        List<OrderItemResponse> items,
        String appliedDiscountCode,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal total
) {}
