package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_request")
@Data
@EqualsAndHashCode(callSuper = true)
public class DocumentRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // WORK_CERTIFICATE, SALARY_CERTIFICATE, TAX_CERTIFICATE, EMPLOYMENT_CONTRACT

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, READY, DELIVERED, CANCELLED

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Employee processedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

}
