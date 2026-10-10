package com.eggstore.service;

import com.eggstore.dto.auth.AuthResponse;
import com.eggstore.dto.auth.LoginRequest;
import com.eggstore.dto.auth.SignupRequest;
import com.eggstore.entity.User;
import com.eggstore.entity.enums.Role;
import com.eggstore.exception.BadRequestException;
import com.eggstore.exception.UnauthorizedException;
import com.eggstore.repository.UserRepository;
import com.eggstore.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CartService cartService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (request.email() == null && request.phone() == null) {
            throw new BadRequestException("Either email or phone is required");
        }
        if (request.email() != null && userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (request.phone() != null && userRepository.existsByPhone(request.phone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .active(true)
                .build();
        user = userRepository.save(user);

        if (request.guestSessionId() != null) {
            cartService.mergeGuestCartIntoUser(request.guestSessionId(), user.getId());
        }

        String token = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getRole().name());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.emailOrPhone())
                .or(() -> userRepository.findByPhone(request.emailOrPhone()))
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (request.guestSessionId() != null) {
            cartService.mergeGuestCartIntoUser(request.guestSessionId(), user.getId());
        }

        String token = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getRole().name());
    }

    /** Shared by admin and delivery-staff login — same mechanism, restricted to non-customer roles. */
    public AuthResponse adminLogin(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (user.getRole() == Role.CUSTOMER) {
            throw new UnauthorizedException("Invalid credentials");
        }
        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getRole().name());
    }
}
