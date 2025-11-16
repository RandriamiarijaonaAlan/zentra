package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;


import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractDto {
    private Long id;
    private Long employeeId;
    private String contractNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal grossSalary;
    private BigDecimal annualBonus;
    private String benefits;
    private Double weeklyHours;
    private Integer annualLeaveDays;
    private LocalDate signatureDate;
    private String contractFile;
    private String contractType;
    private Integer durationMonths;
    private Integer trialPeriodMonths;
    private Boolean renewable;
}
