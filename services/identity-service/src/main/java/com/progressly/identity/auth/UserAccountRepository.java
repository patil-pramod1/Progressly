package com.progressly.identity.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    org.springframework.data.domain.Page<UserAccount> findByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(String email, String displayName, org.springframework.data.domain.Pageable pageable);
}
