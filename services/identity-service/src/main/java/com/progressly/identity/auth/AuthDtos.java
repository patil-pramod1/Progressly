package com.progressly.identity.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() { }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 320) String email,
            @NotBlank @Size(min = 2, max = 100) String displayName,
            @NotBlank @Size(min = 8, max = 72) String password) { }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) { }
    public record RefreshRequest(@NotBlank String refreshToken) { }
    public record LogoutRequest(@NotBlank String refreshToken) { }
    public record UserResponse(UUID id, String email, String displayName, Role role) { }
    public record TokenResponse(String tokenType, String accessToken, String refreshToken,
                                Instant accessTokenExpiresAt, UserResponse user) { }
}
