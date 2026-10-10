package com.eggstore.dto.admin;

import com.eggstore.entity.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public record DiscountRequest(
        @NotBlank String code,
        @NotNull DiscountType type,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal value,
        BigDecimal minOrderValue,
        Integer usageLimitPerCustomer,
        Instant expiresAt
) {}
