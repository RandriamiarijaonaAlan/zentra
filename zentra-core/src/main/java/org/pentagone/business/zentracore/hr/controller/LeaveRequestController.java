package org.pentagone.business.zentracore.hr.controller;

import lombok.RequiredArgsConstructor;
import org.pentagone.business.zentracore.hr.dto.*;
import org.pentagone.business.zentracore.hr.service.LeaveRequestService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<LeaveRequestDto> createLeaveRequest(
            @PathVariable Long employeeId,
            @RequestBody LeaveRequestFormDto requestDto) {
        LeaveRequestDto created = leaveRequestService.createLeaveRequest(employeeId, requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/employee/{employeeId}")
    public ResponseEntity<LeaveRequestDto> updateLeaveRequest(
            @PathVariable Long employeeId,
            @RequestBody LeaveRequestFormDto requestDto) {
        LeaveRequestDto updated = leaveRequestService.updateLeaveRequest(employeeId, requestDto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequestDto> getLeaveRequestById(@PathVariable Long id) {
        LeaveRequestDto leaveRequest = leaveRequestService.getLeaveRequestById(id);
        return new ResponseEntity<>(leaveRequest, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDto>> getEmployeeLeaveRequests(@PathVariable Long employeeId) {
        List<LeaveRequestDto> requests = leaveRequestService.getEmployeeLeaveRequests(employeeId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequestDto>> getPendingLeaveRequests() {
        List<LeaveRequestDto> pendingRequests = leaveRequestService.getPendingLeaveRequests();
        return new ResponseEntity<>(pendingRequests, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaveRequests() {
        List<LeaveRequestDto> allRequests = leaveRequestService.getAllLeaveRequests();
        return new ResponseEntity<>(allRequests, HttpStatus.OK);
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<LeaveRequestDto> approveLeaveRequest(
            @PathVariable Long requestId,
            @RequestParam Long approverId,
            @RequestBody LeaveApprovalDto approvalDto) {
        LeaveRequestDto approved = leaveRequestService.approveLeaveRequest(requestId, approverId, approvalDto);
        return new ResponseEntity<>(approved, HttpStatus.OK);
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<LeaveRequestDto> rejectLeaveRequest(
            @PathVariable Long requestId,
            @RequestParam Long approverId,
            @RequestBody LeaveApprovalDto approvalDto) {
        LeaveRequestDto rejected = leaveRequestService.rejectLeaveRequest(requestId, approverId, approvalDto);
        return new ResponseEntity<>(rejected, HttpStatus.OK);
    }

    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<LeaveRequestDto> cancelLeaveRequest(
            @PathVariable Long requestId,
            @RequestParam Long employeeId) {
        LeaveRequestDto cancelled = leaveRequestService.cancelLeaveRequest(requestId, employeeId);
        return new ResponseEntity<>(cancelled, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/upcoming")
    public ResponseEntity<List<LeaveRequestDto>> getUpcomingLeaves(@PathVariable Long employeeId) {
        List<LeaveRequestDto> upcomingLeaves = leaveRequestService.getUpcomingLeaves(employeeId);
        return new ResponseEntity<>(upcomingLeaves, HttpStatus.OK);
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<LeaveRequestDto>> getLeavesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<LeaveRequestDto> leaves = leaveRequestService.getLeavesByDateRange(startDate, endDate);
        return new ResponseEntity<>(leaves, HttpStatus.OK);
    }

    @GetMapping("/calendar/{year}/{month}")
    public ResponseEntity<List<LeaveRequestDto>> getApprovedLeavesByMonth(
            @PathVariable int year,
            @PathVariable int month) {
        List<LeaveRequestDto> leaves = leaveRequestService.getApprovedLeavesByMonth(year, month);
        return new ResponseEntity<>(leaves, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/calendar/{year}/{month}")
    public ResponseEntity<List<LeaveRequestDto>> getEmployeeApprovedLeavesByMonth(
            @PathVariable Long employeeId,
            @PathVariable int year,
            @PathVariable int month) {
        List<LeaveRequestDto> leaves = leaveRequestService.getEmployeeApprovedLeavesByMonth(employeeId, year, month);
        return new ResponseEntity<>(leaves, HttpStatus.OK);
    }

    @GetMapping("/overlapping")
    public ResponseEntity<List<LeaveRequestDto>> getOverlapping(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long excludeEmployeeId) {
        List<LeaveRequestDto> list = leaveRequestService.getOverlappingLeaves(startDate, endDate, excludeEmployeeId);
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable Long id) {
        leaveRequestService.deleteLeaveRequest(id);
        return ResponseEntity.noContent().build();
    }
}
