package com.eggstore.dto.address;

public record AddressResponse(
        Long id,
        String label,
        String line1,
        String line2,
        String city,
        String state,
        String pincode,
        String phone,
        boolean isDefault
) {}
