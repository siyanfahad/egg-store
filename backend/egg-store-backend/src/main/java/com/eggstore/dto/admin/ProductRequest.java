package com.eggstore.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(
        @NotNull Long categoryId,
        @NotBlank String name,
        String description,
        String imageUrl
) {}
