package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.*;

import java.util.List;

public interface SelfServiceEmployeeService {
    
    // Profile management
    EmployeeDto getMyProfile(Long employeeId);
    EmployeeDto updateMyProfile(Long employeeId, EmployeeProfileUpdateDto updateDto);
    
    // Leave management
    LeaveBalanceDto getMyLeaveBalance(Long employeeId, Integer year);
    List<LeaveRequestDto> getMyLeaveRequests(Long employeeId, Integer year, String status);
    LeaveRequestDto createLeaveRequest(Long employeeId, LeaveRequestDto requestDto);
    LeaveRequestDto cancelLeaveRequest(Long employeeId, Long requestId);
    
    // Payslips
    List<PayslipDto> getMyPayslips(Long employeeId, Integer year);
    PayslipDto getPayslipById(Long employeeId, Long payslipId);
    
    // Document requests
    List<DocumentRequestDto> getMyDocumentRequests(Long employeeId);
    DocumentRequestDto createDocumentRequest(Long employeeId, DocumentRequestDto requestDto);
    
    // Expense claims
    List<ExpenseClaimDto> getMyExpenseClaims(Long employeeId);
    ExpenseClaimDto createExpenseClaim(Long employeeId, ExpenseClaimDto claimDto);
    ExpenseClaimDto cancelExpenseClaim(Long employeeId, Long claimId);
    
    // HR Messages
    List<String> getMyMessageThreads(Long employeeId);
    List<HrMessageDto> getThreadMessages(Long employeeId, String threadId);
    HrMessageDto sendMessage(Long employeeId, HrMessageDto messageDto);

        // Employee options for selection
        java.util.List<org.pentagone.business.zentracore.hr.dto.EmployeeOptionDTO> listEmployees(String q, Integer page, Integer size);
    
}
