package com.eggstore.dto.order;

import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(@NotNull Long addressId) {}
