package com.eggstore.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StockAdjustRequest(
        @NotNull Integer changeQuantity, // positive to add stock, negative to reduce
        @NotBlank String reason          // RESTOCK, ADJUSTMENT
) {}
