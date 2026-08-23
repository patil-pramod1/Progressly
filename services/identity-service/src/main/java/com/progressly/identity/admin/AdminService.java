package com.progressly.identity.admin;

import com.progressly.identity.auth.Role;
import com.progressly.identity.auth.UserAccount;
import com.progressly.identity.auth.UserAccountRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminService {
    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    public AdminService(UserAccountRepository users, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.users = users; this.passwordEncoder = passwordEncoder; this.auditService = auditService;
    }

    @Transactional
    public AdminDtos.UserSummary create(UUID actor, AdminDtos.CreateUserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        UserAccount user = users.save(new UserAccount(email, request.displayName().trim(), passwordEncoder.encode(request.password()),
                request.role() == null ? Role.USER : request.role()));
        auditService.record(actor, user.getId(), AuditAction.USER_CREATED, "role=" + user.getRole());
        return summary(user);
    }

    @Transactional
    public AdminDtos.UserSummary setActive(UUID actor, UUID target, boolean active) {
        UserAccount user = find(target);
        if (active) user.activate(); else user.deactivate();
        users.save(user);
        auditService.record(actor, target, active ? AuditAction.USER_ACTIVATED : AuditAction.USER_DEACTIVATED, null);
        return summary(user);
    }

    @Transactional
    public AdminDtos.UserSummary changeRole(UUID actor, UUID target, Role role) {
        if (role == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        UserAccount user = find(target); user.changeRole(role); users.save(user);
        auditService.record(actor, target, AuditAction.ROLE_CHANGED, "role=" + role);
        return summary(user);
    }

    @Transactional(readOnly = true)
    public Page<AdminDtos.UserSummary> list(String search, Pageable pageable) {
        Page<UserAccount> page = (search == null || search.isBlank()) ? users.findAll(pageable) :
                users.findByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(search.trim(), search.trim(), pageable);
        return page.map(this::summary);
    }

    @Transactional(readOnly = true)
    public Page<AdminDtos.AuditSummary> audit(Pageable pageable) {
        return auditService.list(pageable).map(log -> new AdminDtos.AuditSummary(log.getId(), log.getActorUserId(), log.getTargetUserId(), log.getAction(), log.getMetadata(), log.getCreatedAt()));
    }

    private UserAccount find(UUID id) { return users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }
    private AdminDtos.UserSummary summary(UserAccount user) { return new AdminDtos.UserSummary(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole(), user.isActive(), user.getCreatedAt()); }
}
