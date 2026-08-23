package com.progressly.goal.api;
import com.progressly.goal.domain.Goal; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.time.*; import java.util.UUID;
public final class GoalDtos { private GoalDtos(){}
 public record GoalRequest(@NotBlank @Size(max=180) String title,@Size(max=4000) String description,@Size(max=100) String category,@NotNull Goal.TrackingType trackingType,@DecimalMin("0") BigDecimal targetValue,LocalDate startDate,LocalDate targetDate,String priority,Goal.Status status){}
 public record ProgressRequest(@NotNull @DecimalMin("0") BigDecimal currentValue){}
 public record GoalResponse(UUID id,String title,String description,String category,Goal.TrackingType trackingType,BigDecimal targetValue,BigDecimal currentValue,LocalDate startDate,LocalDate targetDate,String priority,Goal.Status status,Instant createdAt,Instant updatedAt){}
 public record MilestoneRequest(@NotBlank @Size(max=180) String title,@Size(max=2000) String description,Integer sortOrder){}
 public record MilestoneResponse(UUID id,UUID goalId,String title,String description,int sortOrder,boolean completed){}
}
