package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class LeaveBalanceDto {
    private Long id;
    private Long employeeId;
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
}
