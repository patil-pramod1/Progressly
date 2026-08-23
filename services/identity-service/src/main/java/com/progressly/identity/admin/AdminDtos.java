package com.progressly.identity.admin;

import com.progressly.identity.auth.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AdminDtos {
    private AdminDtos() { }
    public record CreateUserRequest(@NotBlank @Email String email, @NotBlank @Size(min = 2, max = 100) String displayName,
                                    @NotBlank @Size(min = 8, max = 72) String password, Role role) { }
    public record ChangeRoleRequest(Role role) { }
    public record UserSummary(UUID id, String email, String displayName, Role role, boolean active, Instant createdAt) { }
    public record AuditSummary(UUID id, UUID actorUserId, UUID targetUserId, AuditAction action, String metadata, Instant createdAt) { }
}
