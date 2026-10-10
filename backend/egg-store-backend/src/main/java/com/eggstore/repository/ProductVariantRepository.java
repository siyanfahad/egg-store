package com.eggstore.repository;

import com.eggstore.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    @Query("SELECT v FROM ProductVariant v WHERE v.active = true AND v.stockQuantity <= :threshold")
    List<ProductVariant> findLowStock(@Param("threshold") int threshold);

    /** Row-level lock — use inside the order-creation transaction to prevent overselling under concurrency. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);

    /** Atomic conditional decrement as an alternative/complement to pessimistic locking. Returns rows affected (0 = insufficient stock). */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity - :qty " +
           "WHERE v.id = :id AND v.stockQuantity >= :qty")
    int decrementStockIfAvailable(@Param("id") Long id, @Param("qty") int qty);
}
