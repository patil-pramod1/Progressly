package com.progressly.identity.admin;

import com.progressly.identity.auth.Role;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) { this.adminService = adminService; }
    @GetMapping("/users")
    public Page<AdminDtos.UserSummary> users(@RequestParam(required = false) String search, Pageable pageable) { return adminService.list(search, pageable); }
    @PostMapping("/users")
    public AdminDtos.UserSummary create(Authentication auth, @Valid @RequestBody AdminDtos.CreateUserRequest request) { return adminService.create(actor(auth), request); }
    @PatchMapping("/users/{id}/activate")
    public AdminDtos.UserSummary activate(Authentication auth, @PathVariable UUID id) { return adminService.setActive(actor(auth), id, true); }
    @PatchMapping("/users/{id}/deactivate")
    public AdminDtos.UserSummary deactivate(Authentication auth, @PathVariable UUID id) { return adminService.setActive(actor(auth), id, false); }
    @PatchMapping("/users/{id}/role")
    public AdminDtos.UserSummary role(Authentication auth, @PathVariable UUID id, @Valid @RequestBody AdminDtos.ChangeRoleRequest request) { return adminService.changeRole(actor(auth), id, request.role()); }
    @GetMapping("/audit-logs")
    public Page<AdminDtos.AuditSummary> audit(Pageable pageable) { return adminService.audit(pageable); }
    private UUID actor(Authentication authentication) { return UUID.fromString(authentication.getName()); }
}
