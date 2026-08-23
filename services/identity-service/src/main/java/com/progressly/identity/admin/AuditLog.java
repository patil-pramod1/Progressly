package com.progressly.identity.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "identity_audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID actorUserId;
    private UUID targetUserId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40)
    private AuditAction action;
    @Column(length = 1000)
    private String metadata;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditLog() { }
    public AuditLog(UUID actorUserId, UUID targetUserId, AuditAction action, String metadata) {
        this.actorUserId = actorUserId;
        this.targetUserId = targetUserId;
        this.action = action;
        this.metadata = metadata;
        this.createdAt = Instant.now();
    }
    public UUID getId() { return id; }
    public UUID getActorUserId() { return actorUserId; }
    public UUID getTargetUserId() { return targetUserId; }
    public AuditAction getAction() { return action; }
    public String getMetadata() { return metadata; }
    public Instant getCreatedAt() { return createdAt; }
}
