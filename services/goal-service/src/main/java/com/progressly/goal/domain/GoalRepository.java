package com.progressly.goal.domain;
import java.util.UUID;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable; import org.springframework.data.jpa.repository.JpaRepository;
public interface GoalRepository extends JpaRepository<Goal,UUID>{ Page<Goal> findByUserId(UUID userId,Pageable pageable); java.util.Optional<Goal> findByIdAndUserId(UUID id,UUID userId); }
