package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PayStubDto {
    private Long id;
    private Long employeeId;
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

    private List<SalaryComponentDto> salaryComponents;
    private Double grossSalary;

    private List<SalaryDeductionDto> salaryDeductions;
    private Double sumDeductions;

    private Double netSalary;

    private Double irsaDeduction;
    private Double taxableIncome;

    private String payingMethod;
    private String filepath;
}

