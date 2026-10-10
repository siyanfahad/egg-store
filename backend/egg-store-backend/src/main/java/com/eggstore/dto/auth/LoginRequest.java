package com.eggstore.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String emailOrPhone,
        @NotBlank String password,
        String guestSessionId // optional — triggers guest cart merge on successful login
) {}
