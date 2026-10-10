package com.eggstore.service;

import com.eggstore.dto.admin.CustomerResponse;
import com.eggstore.entity.User;
import com.eggstore.entity.enums.Role;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final UserRepository userRepository;

    public Page<CustomerResponse> list(Pageable pageable) {
        // NOTE: scope of fields returned here should match the client's confirmed privacy policy (see SRS Section 2.2).
        return userRepository.findAll(pageable)
                .map(this::toResponse); // consider filtering to role == CUSTOMER only, per business rule
    }

    public CustomerResponse getById(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return toResponse(user);
    }

    private CustomerResponse toResponse(User u) {
        return new CustomerResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.isActive(), u.getCreatedAt());
    }
}
