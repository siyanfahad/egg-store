package com.eggstore.dto.order;

import jakarta.validation.constraints.NotNull;

public record AssignOrderRequest(@NotNull Long staffUserId) {}
