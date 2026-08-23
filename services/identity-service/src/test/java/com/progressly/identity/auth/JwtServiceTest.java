package com.progressly.identity.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService(
            "local-development-secret-that-is-at-least-32-characters", 15);

    @Test
    void issuesTokenContainingUserIdentity() {
        UserAccount user = new UserAccount("user@example.com", "Test User", "hash", Role.USER);
        user.onCreate();
        JwtService.IssuedToken issued = jwtService.issue(user);
        assertThat(issued.value()).isNotBlank();
        assertThat(jwtService.userId(issued.value())).isEqualTo(user.getId());
        assertThat(issued.expiresAt()).isAfter(java.time.Instant.now());
    }
}
