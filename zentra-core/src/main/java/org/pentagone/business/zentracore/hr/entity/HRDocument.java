package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "hr_document")
@Data
@EqualsAndHashCode(callSuper = true)
public class HRDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "doc_type", length = 100)
    private String docType; // CIN, DIPLOMA, ATTENDANCE_CERT, etc.

    @Column(name = "file_path", length = 512)
    private String filePath;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "visible_to_employee")
    private Boolean visibleToEmployee = true;

}

