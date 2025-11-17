package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class SalaryComponentDto {
    private String designation;
    private String number;
    private Double rate;
    private Double amount;
}
