package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;

@Data
public class LeaveApprovalDto {
    private Long id;
    private LeaveRequestStatus status;
    private String approvalComment;
}
