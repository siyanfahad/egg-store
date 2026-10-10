package com.eggstore.dto.admin;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String name,
        String email,
        String phone,
        boolean active,
        Instant createdAt
) {}
