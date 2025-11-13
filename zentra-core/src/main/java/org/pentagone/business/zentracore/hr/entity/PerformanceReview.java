package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_review")
@Data
@EqualsAndHashCode(callSuper = true)
public class PerformanceReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private Employee reviewer;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "score")
    private Integer score;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "status", length = 50)
    private String status; // DRAFT, COMPLETED

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}

