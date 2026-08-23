package com.progressly.goal.domain;
import java.util.List; import java.util.UUID; import org.springframework.data.jpa.repository.JpaRepository;
public interface MilestoneRepository extends JpaRepository<Milestone,UUID>{ List<Milestone> findByGoalIdAndUserIdOrderBySortOrderAsc(UUID goalId,UUID userId); java.util.Optional<Milestone> findByIdAndGoalIdAndUserId(UUID id,UUID goalId,UUID userId); }
