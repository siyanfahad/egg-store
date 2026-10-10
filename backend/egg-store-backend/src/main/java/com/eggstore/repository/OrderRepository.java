package com.eggstore.repository;

import com.eggstore.entity.Order;
import com.eggstore.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    Page<Order> findByAssignedStaffIdAndStatus(Long staffId, OrderStatus status, Pageable pageable);
}
