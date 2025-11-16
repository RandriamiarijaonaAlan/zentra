package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class DepartmentAlertDto {
    private Long departmentId;
    private String departmentName;
    private Double annualBudget;
    private Double trainingSpent;
    private Double exceededBy;
}
