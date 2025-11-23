package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private String leaveTypeColor;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double days;
    private String type;
    private String status;
    private BigDecimal daysRequested;
    private String reason;
    private Long approverId;
    private String approverName;
    private LocalDateTime approvedAt;
    private LeaveRequestStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDate approvedDate;
    private String approvalComment;
    private Boolean isHalfDayStart;
    private Boolean isHalfDayEnd;
    private String emergencyContact;
}
