package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class SalaryDeductionDto {
    private String designation;
    private Double rate;
    private Double amount;
}
