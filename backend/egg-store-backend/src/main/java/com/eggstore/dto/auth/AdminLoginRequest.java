package com.eggstore.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
        @NotBlank String email,
        @NotBlank String password
) {}
