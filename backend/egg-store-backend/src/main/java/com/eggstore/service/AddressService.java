package com.eggstore.service;

import com.eggstore.dto.address.AddressRequest;
import com.eggstore.dto.address.AddressResponse;
import com.eggstore.entity.Address;
import com.eggstore.exception.ResourceNotFoundException;
import com.eggstore.repository.AddressRepository;
import com.eggstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> list(Long userId) {
        return addressRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AddressResponse add(Long userId, AddressRequest request) {
        Address address = Address.builder()
                .user(userRepository.getReferenceById(userId))
                .label(request.label())
                .line1(request.line1())
                .line2(request.line2())
                .city(request.city())
                .state(request.state())
                .pincode(request.pincode())
                .phone(request.phone())
                .isDefault(request.isDefault())
                .build();
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse update(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        address.setLabel(request.label());
        address.setLine1(request.line1());
        address.setLine2(request.line2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPincode(request.pincode());
        address.setPhone(request.phone());
        address.setDefault(request.isDefault());

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    private AddressResponse toResponse(Address a) {
        return new AddressResponse(a.getId(), a.getLabel(), a.getLine1(), a.getLine2(),
                a.getCity(), a.getState(), a.getPincode(), a.getPhone(), a.isDefault());
    }
}
