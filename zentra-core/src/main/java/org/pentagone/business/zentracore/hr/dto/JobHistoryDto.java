package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class JobHistoryDto {
    private Long id;
    private Long employeeId;
    private Long jobId;
    private Long departmentId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}

