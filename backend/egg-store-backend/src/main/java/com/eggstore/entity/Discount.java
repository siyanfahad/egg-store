package com.eggstore.entity;

import com.eggstore.entity.enums.DiscountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "discounts", uniqueConstraints = @UniqueConstraint(name = "uk_discounts_code", columnNames = "code"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "usage_limit_per_customer")
    private Integer usageLimitPerCustomer;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Server-side check — call this rather than duplicating the logic at call sites. */
    public boolean isCurrentlyValid(BigDecimal orderSubtotal) {
        if (!active) return false;
        if (expiresAt != null && Instant.now().isAfter(expiresAt)) return false;
        return minOrderValue == null || orderSubtotal.compareTo(minOrderValue) >= 0;
    }
}
