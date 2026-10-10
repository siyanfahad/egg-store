package com.eggstore.dto.address;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        String label,
        @NotBlank String line1,
        String line2,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String pincode,
        @NotBlank String phone,
        boolean isDefault
) {}
