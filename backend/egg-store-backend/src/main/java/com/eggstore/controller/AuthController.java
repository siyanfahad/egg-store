package com.eggstore.controller;

import com.eggstore.dto.auth.AdminLoginRequest;
import com.eggstore.dto.auth.AuthResponse;
import com.eggstore.dto.auth.LoginRequest;
import com.eggstore.dto.auth.SignupRequest;
import com.eggstore.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // TODO: on success, also set the refresh token as an HttpOnly, Secure, SameSite=Strict cookie
    // via the response, per the SRS security requirements — omitted here for brevity.

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authService.adminLogin(request.email(), request.password()));
    }
}
