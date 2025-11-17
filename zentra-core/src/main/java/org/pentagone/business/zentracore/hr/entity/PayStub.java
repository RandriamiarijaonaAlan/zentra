package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class PayStub extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private LocalDate date;

    private String employeeName;
    private String employeeNumber;
    private String jobTitle;
    private Long cnapsNumber;
    private LocalDate hireDate;
    private String seniority;

    private String classification;
    private Double baseSalary;
    private Double dayRate;
    private Double hourRate;
    private Double salaryIndex;

    @OneToMany(mappedBy = "payStub", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<SalaryComponent> salaryComponents;
    private Double grossSalary;

    @OneToMany(mappedBy = "payStub", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<SalaryDeduction> salaryDeductions;
    private Double sumDeductions;

    private Double netSalary;

    private Double irsaDeduction;
    private Double taxableIncome;

    private String payingMethod;

    private String filepath;
}
