package com.eggstore.util;

import com.eggstore.exception.UnauthorizedException;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    /** Returns the authenticated user's id (set as the principal by JwtAuthenticationFilter). */
    public static Long currentUserId() {
        Long userId = currentUserIdOrNull();
        if (userId == null) {
            throw new UnauthorizedException("No authenticated user in context");
        }
        return userId;
    }

    /** Same as currentUserId(), but returns null instead of throwing — for endpoints that support both guest and logged-in access. */
    public static Long currentUserIdOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long userId) {
            return userId;
        }
        return null;
    }
}
