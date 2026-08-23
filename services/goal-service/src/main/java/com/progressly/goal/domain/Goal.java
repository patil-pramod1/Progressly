package com.progressly.goal.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name = "goals")
public class Goal {
    public enum TrackingType { TASK, PERCENTAGE, NUMERIC, MILESTONE, HABIT, CUSTOM }
    public enum Status { NOT_STARTED, IN_PROGRESS, COMPLETED, PAUSED, CANCELLED }
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable=false) private UUID userId;
    @Column(nullable=false,length=180) private String title;
    @Column(length=4000) private String description;
    @Column(length=100) private String category;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TrackingType trackingType;
    @Column(precision=19,scale=4) private BigDecimal targetValue;
    @Column(precision=19,scale=4) private BigDecimal currentValue;
    private LocalDate startDate;
    private LocalDate targetDate;
    @Column(length=20) private String priority;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    @Column(nullable=false,updatable=false) private Instant createdAt;
    @Column(nullable=false) private Instant updatedAt;
    protected Goal() { }
    public Goal(UUID userId,String title,String description,String category,TrackingType trackingType,BigDecimal targetValue,LocalDate startDate,LocalDate targetDate,String priority) {
        this.userId=userId; this.title=title; this.description=description; this.category=category; this.trackingType=trackingType; this.targetValue=targetValue; this.currentValue=BigDecimal.ZERO; this.startDate=startDate; this.targetDate=targetDate; this.priority=priority; this.status=Status.NOT_STARTED;
    }
    @PrePersist void create(){createdAt=Instant.now();updatedAt=createdAt;} @PreUpdate void update(){updatedAt=Instant.now();}
    public UUID getId(){return id;} public UUID getUserId(){return userId;} public String getTitle(){return title;} public String getDescription(){return description;} public String getCategory(){return category;} public TrackingType getTrackingType(){return trackingType;} public BigDecimal getTargetValue(){return targetValue;} public BigDecimal getCurrentValue(){return currentValue;} public LocalDate getStartDate(){return startDate;} public LocalDate getTargetDate(){return targetDate;} public String getPriority(){return priority;} public Status getStatus(){return status;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
    public void update(String title,String description,String category,TrackingType trackingType,BigDecimal targetValue,LocalDate startDate,LocalDate targetDate,String priority,Status status){this.title=title;this.description=description;this.category=category;this.trackingType=trackingType;this.targetValue=targetValue;this.startDate=startDate;this.targetDate=targetDate;this.priority=priority;this.status=status;}
    public void progress(BigDecimal value){currentValue=value; if(targetValue!=null && value!=null && value.compareTo(targetValue)>=0) status=Status.COMPLETED; else if(value!=null && value.compareTo(BigDecimal.ZERO)>0) status=Status.IN_PROGRESS;}
}
