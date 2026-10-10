package com.eggstore.repository;

import com.eggstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findFirstByName(String name);

    @Query("""
           SELECT DISTINCT p FROM Product p JOIN p.variants v
           WHERE p.active = true
             AND (COALESCE(:search, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))             AND (:categoryId IS NULL OR p.category.id = :categoryId)
             AND (:minPrice IS NULL OR v.price >= :minPrice)
             AND (:maxPrice IS NULL OR v.price <= :maxPrice)
             AND (:packSize IS NULL OR v.packSize = :packSize)
             AND (:inStockOnly = false OR v.stockQuantity > 0)
           """)
    Page<Product> search(@Param("search") String search,
                          @Param("categoryId") Long categoryId,
                          @Param("minPrice") java.math.BigDecimal minPrice,
                          @Param("maxPrice") java.math.BigDecimal maxPrice,
                          @Param("packSize") Integer packSize,
                          @Param("inStockOnly") boolean inStockOnly,
                          Pageable pageable);
}
