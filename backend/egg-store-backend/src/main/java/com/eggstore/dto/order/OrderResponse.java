package com.eggstore.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        List<OrderItemResponse> items,
        Instant createdAt,
        // Populated only immediately after creation, to drive the Razorpay Checkout widget on the frontend
        String razorpayOrderId,
        String razorpayKeyId
) {}
