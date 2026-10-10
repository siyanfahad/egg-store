package com.eggstore.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank String name,
        String email,
        String phone,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
        String guestSessionId // optional — if present, guest cart is merged after signup
) {}
