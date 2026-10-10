package com.eggstore.dto.cart;

import jakarta.validation.constraints.NotBlank;

public record ApplyDiscountRequest(@NotBlank String code) {}
