package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.*;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestService {
    LeaveRequestDto createLeaveRequest(Long employeeId, LeaveRequestFormDto requestDto);
    LeaveRequestDto updateLeaveRequest(Long employeeId, LeaveRequestFormDto requestDto);
    LeaveRequestDto getLeaveRequestById(Long id);
    List<LeaveRequestDto> getEmployeeLeaveRequests(Long employeeId);
    List<LeaveRequestDto> getPendingLeaveRequests();
    List<LeaveRequestDto> getAllLeaveRequests();

    LeaveRequestDto approveLeaveRequest(Long requestId, Long approverId, LeaveApprovalDto approvalDto);
    LeaveRequestDto rejectLeaveRequest(Long requestId, Long approverId, LeaveApprovalDto approvalDto);
    LeaveRequestDto cancelLeaveRequest(Long requestId, Long employeeId);

    List<LeaveRequestDto> getOverlappingLeaves(LocalDate startDate, LocalDate endDate, Long excludeEmployeeId);
    List<LeaveRequestDto> getUpcomingLeaves(Long employeeId);

    void deleteLeaveRequest(Long id);

    // Calendar integration
    List<LeaveRequestDto> getLeavesByDateRange(LocalDate startDate, LocalDate endDate);
    List<LeaveRequestDto> getApprovedLeavesByMonth(int year, int month);
    List<LeaveRequestDto> getEmployeeApprovedLeavesByMonth(Long employeeId, int year, int month);
}
