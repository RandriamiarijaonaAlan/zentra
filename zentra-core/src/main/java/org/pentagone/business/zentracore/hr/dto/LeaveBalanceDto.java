package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LeaveBalanceDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private Integer year;
    private Double annualTotal;
    private Double annualTaken;
    private Double annualRemaining;
    private Double sickTotal;
    private Double sickTaken;
    private Double sickRemaining;
    private Double exceptionalTotal;
    private Double exceptionalTaken;
    private Double exceptionalRemaining;
    private BigDecimal allocatedDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;
    private BigDecimal carriedOverDays;
    private BigDecimal remainingDays;
    private LocalDate expiresOn;
}
