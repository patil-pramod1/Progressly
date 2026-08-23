package com.progressly.identity.admin;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository auditLogs;
    public AuditService(AuditLogRepository auditLogs) { this.auditLogs = auditLogs; }
    public void record(UUID actor, UUID target, AuditAction action, String metadata) {
        auditLogs.save(new AuditLog(actor, target, action, metadata));
    }
    public Page<AuditLog> list(Pageable pageable) { return auditLogs.findAllByOrderByCreatedAtDesc(pageable); }
}
