package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double days;
    private String type;
    private String status;
    private String reason;
    private Long approverId;
    private String approverName;
    private LocalDateTime approvedAt;
}
