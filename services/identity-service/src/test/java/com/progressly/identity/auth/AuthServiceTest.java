package com.progressly.identity.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserAccountRepository users;
    @Mock RefreshTokenRepository refreshTokens;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(users, refreshTokens, new BCryptPasswordEncoder(),
                new JwtService("local-development-secret-that-is-at-least-32-characters", 15), 30);
    }

    @Test
    void registersUserAsUserAndReturnsTokens() {
        when(users.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(users.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount user = invocation.getArgument(0);
            user.onCreate();
            return user;
        });

        AuthDtos.TokenResponse response = authService.register(
                new AuthDtos.RegisterRequest("USER@EXAMPLE.COM", "Test User", "password123"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.user().role()).isEqualTo(Role.USER);
        verify(refreshTokens).save(any(RefreshToken.class));
    }

    @Test
    void rejectsWrongPassword() {
        UserAccount user = new UserAccount("user@example.com", "Test User",
                new BCryptPasswordEncoder().encode("password123"), Role.USER);
        user.onCreate();
        when(users.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> authService.login(
                new AuthDtos.LoginRequest("user@example.com", "wrong-password")))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
    }
}
