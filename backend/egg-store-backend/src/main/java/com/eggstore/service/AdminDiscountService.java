package com.eggstore.service;

import com.eggstore.dto.admin.DiscountRequest;
import com.eggstore.entity.Discount;
import com.eggstore.exception.BadRequestException;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDiscountService {

    private final DiscountRepository discountRepository;

    @Transactional(readOnly = true)
    public List<Discount> list() {
        return discountRepository.findAll();
    }

    @Transactional
    public Discount create(DiscountRequest request) {
        discountRepository.findByCodeIgnoreCase(request.code()).ifPresent(d -> {
            throw new BadRequestException("A discount with this code already exists");
        });

        Discount discount = Discount.builder()
                .code(request.code().toUpperCase())
                .type(request.type())
                .value(request.value())
                .minOrderValue(request.minOrderValue())
                .usageLimitPerCustomer(request.usageLimitPerCustomer())
                .expiresAt(request.expiresAt())
                .active(true)
                .build();
        return discountRepository.save(discount);
    }

    @Transactional
    public Discount update(Long id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));

        discount.setType(request.type());
        discount.setValue(request.value());
        discount.setMinOrderValue(request.minOrderValue());
        discount.setUsageLimitPerCustomer(request.usageLimitPerCustomer());
        discount.setExpiresAt(request.expiresAt());

        return discountRepository.save(discount);
    }

    @Transactional
    public Discount setActive(Long id, boolean active) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        discount.setActive(active);
        return discountRepository.save(discount);
    }

    @Transactional
    public void delete(Long id) {
        if (!discountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Discount not found");
        }
        discountRepository.deleteById(id);
    }
}
