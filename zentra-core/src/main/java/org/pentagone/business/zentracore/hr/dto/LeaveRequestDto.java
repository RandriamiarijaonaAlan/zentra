package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    private BigDecimal daysRequested;
    private String reason;
    private LeaveRequestStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDate approvedDate;
    private String approvalComment;
    private Boolean isHalfDayStart;
    private Boolean isHalfDayEnd;
    private String emergencyContact;
}
