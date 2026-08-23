package com.progressly.goal.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="goal_milestones")
public class Milestone {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false) private UUID goalId;
    @Column(nullable=false) private UUID userId;
    @Column(nullable=false,length=180) private String title;
    @Column(length=2000) private String description;
    @Column(nullable=false) private int sortOrder;
    @Column(nullable=false) private boolean completed;
    @Column(nullable=false,updatable=false) private Instant createdAt;
    protected Milestone(){}
    public Milestone(UUID goalId,UUID userId,String title,String description,int sortOrder){this.goalId=goalId;this.userId=userId;this.title=title;this.description=description;this.sortOrder=sortOrder;}
    @PrePersist void create(){createdAt=Instant.now();}
    public UUID getId(){return id;} public UUID getGoalId(){return goalId;} public UUID getUserId(){return userId;} public String getTitle(){return title;} public String getDescription(){return description;} public int getSortOrder(){return sortOrder;} public boolean isCompleted(){return completed;}
    public void update(String title,String description,int sortOrder){this.title=title;this.description=description;this.sortOrder=sortOrder;} public void completed(boolean value){completed=value;}
}
