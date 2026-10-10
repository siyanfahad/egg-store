package com.eggstore.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotNull Long productVariantId,
        @Min(value = 1, message = "Quantity must be at least 1") int quantity
) {}
