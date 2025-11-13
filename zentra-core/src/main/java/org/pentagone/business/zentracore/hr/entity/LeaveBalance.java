package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Table(name = "leave_balance")
@Data
@EqualsAndHashCode(callSuper = true)
public class LeaveBalance extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "annual_total")
    private Double annualTotal = 25.0;

    @Column(name = "annual_taken")
    private Double annualTaken = 0.0;

    @Column(name = "sick_total")
    private Double sickTotal = 0.0;

    @Column(name = "sick_taken")
    private Double sickTaken = 0.0;

    @Column(name = "exceptional_total")
    private Double exceptionalTotal = 0.0;

    @Column(name = "exceptional_taken")
    private Double exceptionalTaken = 0.0;

}

