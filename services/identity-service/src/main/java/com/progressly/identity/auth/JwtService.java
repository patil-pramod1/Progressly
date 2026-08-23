package com.progressly.identity.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long accessTokenMinutes;
    public JwtService(@Value("${progressly.security.jwt-secret}") String secret,
                      @Value("${progressly.security.access-token-minutes:15}") long accessTokenMinutes) {
        if (secret.length() < 32) throw new IllegalArgumentException("JWT secret must be at least 32 characters");
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenMinutes = accessTokenMinutes;
    }
    public IssuedToken issue(UserAccount user) {
        Instant expiresAt = Instant.now().plusSeconds(accessTokenMinutes * 60);
        String token = Jwts.builder().subject(user.getId().toString()).claim("email", user.getEmail())
                .claim("role", user.getRole().name()).issuedAt(new Date()).expiration(Date.from(expiresAt))
                .signWith(signingKey).compact();
        return new IssuedToken(token, expiresAt);
    }
    public UUID userId(String token) {
        Claims claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
        return UUID.fromString(claims.getSubject());
    }
    public record IssuedToken(String value, Instant expiresAt) { }
}
