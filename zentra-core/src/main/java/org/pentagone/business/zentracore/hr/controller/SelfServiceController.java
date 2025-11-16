package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.*;
import org.pentagone.business.zentracore.hr.service.SelfServiceEmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/self")
@CrossOrigin(origins = "*")
public class SelfServiceController {

    private final SelfServiceEmployeeService selfServiceEmployeeService;

    public SelfServiceController(SelfServiceEmployeeService selfServiceEmployeeService) {
        this.selfServiceEmployeeService = selfServiceEmployeeService;
    }

    // Profile endpoints
    @GetMapping("/profile")
    public ResponseEntity<EmployeeDto> getMyProfile(@RequestParam Long employeeId) {
        // TODO: Get employeeId from security context instead of param
        EmployeeDto profile = selfServiceEmployeeService.getMyProfile(employeeId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployeeDto> updateMyProfile(
            @RequestParam Long employeeId,
            @RequestBody EmployeeProfileUpdateDto updateDto) {
        // TODO: Get employeeId from security context instead of param
        EmployeeDto updated = selfServiceEmployeeService.updateMyProfile(employeeId, updateDto);
        return ResponseEntity.ok(updated);
    }

    // Leave endpoints
    @GetMapping("/leave/balance")
    public ResponseEntity<LeaveBalanceDto> getLeaveBalance(
            @RequestParam Long employeeId,
            @RequestParam(required = false) Integer year) {
        LeaveBalanceDto balance = selfServiceEmployeeService.getMyLeaveBalance(employeeId, year);
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/leave/requests")
    public ResponseEntity<List<LeaveRequestDto>> getLeaveRequests(
            @RequestParam Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status) {
        List<LeaveRequestDto> requests = selfServiceEmployeeService.getMyLeaveRequests(employeeId, year, status);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/leave/requests")
    public ResponseEntity<LeaveRequestDto> createLeaveRequest(
            @RequestParam Long employeeId,
            @RequestBody LeaveRequestDto requestDto) {
        LeaveRequestDto created = selfServiceEmployeeService.createLeaveRequest(employeeId, requestDto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/leave/requests/{requestId}/cancel")
    public ResponseEntity<LeaveRequestDto> cancelLeaveRequest(
            @RequestParam Long employeeId,
            @PathVariable Long requestId) {
        LeaveRequestDto cancelled = selfServiceEmployeeService.cancelLeaveRequest(employeeId, requestId);
        return ResponseEntity.ok(cancelled);
    }

    // Payslip endpoints
    @GetMapping("/payslips")
    public ResponseEntity<List<PayslipDto>> getPayslips(
            @RequestParam Long employeeId,
            @RequestParam(required = false) Integer year) {
        List<PayslipDto> payslips = selfServiceEmployeeService.getMyPayslips(employeeId, year);
        return ResponseEntity.ok(payslips);
    }

    @GetMapping("/payslips/{payslipId}")
    public ResponseEntity<PayslipDto> getPayslip(
            @RequestParam Long employeeId,
            @PathVariable Long payslipId) {
        PayslipDto payslip = selfServiceEmployeeService.getPayslipById(employeeId, payslipId);
        return ResponseEntity.ok(payslip);
    }

    // Document request endpoints
    @GetMapping("/doc-requests")
    public ResponseEntity<List<DocumentRequestDto>> getDocumentRequests(
            @RequestParam Long employeeId) {
        List<DocumentRequestDto> requests = selfServiceEmployeeService.getMyDocumentRequests(employeeId);
        return ResponseEntity.ok(requests);
    }

    // Employee list for selection
    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeOptionDTO>> listEmployees(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(selfServiceEmployeeService.listEmployees(q, page, size));
    }
    
    @PostMapping("/doc-requests")
    public ResponseEntity<DocumentRequestDto> createDocumentRequest(
            @RequestParam Long employeeId,
            @RequestBody DocumentRequestDto requestDto) {
        DocumentRequestDto created = selfServiceEmployeeService.createDocumentRequest(employeeId, requestDto);
        return ResponseEntity.ok(created);
    }

    // Expense claim endpoints
    @GetMapping("/expense-claims")
    public ResponseEntity<List<ExpenseClaimDto>> getExpenseClaims(
            @RequestParam Long employeeId) {
        List<ExpenseClaimDto> claims = selfServiceEmployeeService.getMyExpenseClaims(employeeId);
        return ResponseEntity.ok(claims);
    }

    @PostMapping("/expense-claims")
    public ResponseEntity<ExpenseClaimDto> createExpenseClaim(
            @RequestParam Long employeeId,
            @RequestBody ExpenseClaimDto claimDto) {
        ExpenseClaimDto created = selfServiceEmployeeService.createExpenseClaim(employeeId, claimDto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/expense-claims/{claimId}/cancel")
    public ResponseEntity<ExpenseClaimDto> cancelExpenseClaim(
            @RequestParam Long employeeId,
            @PathVariable Long claimId) {
        ExpenseClaimDto cancelled = selfServiceEmployeeService.cancelExpenseClaim(employeeId, claimId);
        return ResponseEntity.ok(cancelled);
    }

    // HR Message endpoints
    @GetMapping("/messages/threads")
    public ResponseEntity<List<String>> getMessageThreads(
            @RequestParam Long employeeId) {
        List<String> threads = selfServiceEmployeeService.getMyMessageThreads(employeeId);
        return ResponseEntity.ok(threads);
    }

    @GetMapping("/messages/threads/{threadId}")
    public ResponseEntity<List<HrMessageDto>> getThreadMessages(
            @RequestParam Long employeeId,
            @PathVariable String threadId) {
        List<HrMessageDto> messages = selfServiceEmployeeService.getThreadMessages(employeeId, threadId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<HrMessageDto> sendMessage(
            @RequestParam Long employeeId,
            @RequestBody HrMessageDto messageDto) {
        HrMessageDto sent = selfServiceEmployeeService.sendMessage(employeeId, messageDto);
        return ResponseEntity.ok(sent);
    }

}
