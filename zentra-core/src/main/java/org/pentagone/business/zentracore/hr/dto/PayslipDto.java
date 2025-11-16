package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PayslipDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer periodYear;
    private Integer periodMonth;
    private Double grossAmount;
    private Double netAmount;
    private Double deductions;
    private Double bonuses;
    private String filePath;
    private LocalDateTime generatedAt;
    private String status;
}
