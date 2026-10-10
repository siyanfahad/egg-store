package com.eggstore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Append-only audit trail of every stock change: restock, order deduction, or manual adjustment. */
@Entity
@Table(name = "inventory_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    /** Positive for restock/adjustment-up, negative for order deduction/adjustment-down. */
    @Column(name = "change_quantity", nullable = false)
    private Integer changeQuantity;

    @Column(nullable = false)
    private String reason; // RESTOCK, ORDER, ADJUSTMENT

    @Column(name = "reference_order_id")
    private Long referenceOrderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
