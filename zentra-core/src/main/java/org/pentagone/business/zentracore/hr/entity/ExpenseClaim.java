package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_claim")
@Data
@EqualsAndHashCode(callSuper = true)
public class ExpenseClaim extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "claim_date", nullable = false)
    private LocalDate claimDate;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "currency", length = 3)
    private String currency = "EUR";

    @Column(name = "category", length = 100)
    private String category; // TRAVEL, MEAL, ACCOMMODATION, OFFICE_SUPPLIES, CLIENT_ENTERTAINMENT, OTHER

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, PAID, CANCELLED

    @Column(name = "receipt_files", columnDefinition = "TEXT")
    private String receiptFiles; // JSON array or comma-separated paths

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Employee reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

}
