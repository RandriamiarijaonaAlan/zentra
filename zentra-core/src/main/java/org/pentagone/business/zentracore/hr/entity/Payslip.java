package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "payslip")
@Data
@EqualsAndHashCode(callSuper = true)
public class Payslip extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "gross_salary")
    private Double grossSalary;

    @Column(name = "net_salary")
    private Double netSalary;

    @Column(name = "deductions", columnDefinition = "TEXT")
    private String deductions;

    @Column(name = "file_path", length = 512)
    private String filePath;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
}

