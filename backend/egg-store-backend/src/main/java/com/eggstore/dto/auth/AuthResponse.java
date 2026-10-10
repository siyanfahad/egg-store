package com.eggstore.dto.auth;

public record AuthResponse(
        String accessToken,
        Long userId,
        String name,
        String role
        // refresh token is NOT returned in the body — it's set as an HttpOnly Secure cookie by the controller
) {}
