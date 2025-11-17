package org.pentagone.business.zentracore.hr.service.impl;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.pentagone.business.zentracore.hr.dto.*;
import org.pentagone.business.zentracore.hr.entity.*;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;
import org.pentagone.business.zentracore.hr.mapper.LeaveRequestMapper;
import org.pentagone.business.zentracore.hr.repository.*;
import org.pentagone.business.zentracore.hr.service.LeaveRequestService;
import org.pentagone.business.zentracore.hr.service.LeaveBalanceService;
import org.pentagone.business.zentracore.hr.service.LeaveNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestMapper leaveRequestMapper;
    private final LeaveBalanceService leaveBalanceService;
    private final LeaveNotificationService leaveNotificationService;

    @Override
    public LeaveRequestDto createLeaveRequest(Long employeeId, LeaveRequestFormDto requestDto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        LeaveType leaveType = leaveTypeRepository.findById(requestDto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + requestDto.getLeaveTypeId()));

        // Validate dates
        if (requestDto.getStartDate().isAfter(requestDto.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }

        if (requestDto.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot request leave for past dates");
        }

        // Check advance notice requirement
        if (leaveType.getAdvanceNoticeDays() != null) {
            LocalDate earliestRequestDate = LocalDate.now().plusDays(leaveType.getAdvanceNoticeDays());
            if (requestDto.getStartDate().isBefore(earliestRequestDate)) {
                throw new RuntimeException("Leave must be requested at least " + leaveType.getAdvanceNoticeDays() + " days in advance");
            }
        }

        // Calculate days requested
        java.math.BigDecimal daysRequested = calculateWorkingDays(requestDto.getStartDate(), requestDto.getEndDate(),
                requestDto.getIsHalfDayStart(), requestDto.getIsHalfDayEnd());

        // Check if employee has sufficient balance
        validateLeaveBalance(employeeId, requestDto.getLeaveTypeId(), daysRequested);

        // Check for overlapping leaves for the same employee only
        List<LeaveRequest> overlapping = leaveRequestRepository.findEmployeeOverlappingLeaves(
                employeeId, requestDto.getStartDate(), requestDto.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Leave request overlaps with your existing leave");
        }

        // Enforce concurrency cap for this leave type (global across employees)
        enforceConcurrencyCap(requestDto.getLeaveTypeId(), requestDto.getStartDate(), requestDto.getEndDate());

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(requestDto.getStartDate());
        leaveRequest.setEndDate(requestDto.getEndDate());
        leaveRequest.setDaysRequested(daysRequested);
        leaveRequest.setReason(requestDto.getReason());
        leaveRequest.setIsHalfDayStart(requestDto.getIsHalfDayStart());
        leaveRequest.setIsHalfDayEnd(requestDto.getIsHalfDayEnd());
        leaveRequest.setEmergencyContact(requestDto.getEmergencyContact());
        leaveRequest.setStatus(LeaveRequestStatus.PENDING);

        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update pending balance
        leaveBalanceService.updateBalanceAfterLeaveRequest(employeeId, requestDto.getLeaveTypeId(),
                requestDto.getStartDate().getYear(), daysRequested, false);

        // Send notifications
        leaveNotificationService.sendLeaveRequestNotifications(leaveRequest.getId());

        return leaveRequestMapper.toDto(leaveRequest);
    }

    @Override
    public LeaveRequestDto approveLeaveRequest(Long requestId, Long approverId, LeaveApprovalDto approvalDto) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + requestId));

        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found with id: " + approverId));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new RuntimeException("Only pending leave requests can be approved");
        }

        leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovedDate(LocalDate.now());
        leaveRequest.setApprovalComment(approvalDto.getApprovalComment());

        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update balances (move from pending to used)
        leaveBalanceService.updateBalanceAfterLeaveRequest(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getLeaveType().getId(),
                leaveRequest.getStartDate().getYear(),
                leaveRequest.getDaysRequested(),
                true);

        // Send notifications
        leaveNotificationService.sendApprovalNotifications(leaveRequest.getId());

        return leaveRequestMapper.toDto(leaveRequest);
    }

    @Override
    public LeaveRequestDto rejectLeaveRequest(Long requestId, Long approverId, LeaveApprovalDto approvalDto) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + requestId));

        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found with id: " + approverId));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new RuntimeException("Only pending leave requests can be rejected");
        }

        leaveRequest.setStatus(LeaveRequestStatus.REJECTED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovedDate(LocalDate.now());
        leaveRequest.setApprovalComment(approvalDto.getApprovalComment());

        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Restore pending balance
        leaveBalanceService.updateBalanceAfterLeaveRequest(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getLeaveType().getId(),
                leaveRequest.getStartDate().getYear(),
                leaveRequest.getDaysRequested().negate(),
                false);

        // Send notifications
        leaveNotificationService.sendRejectionNotifications(leaveRequest.getId());

        return leaveRequestMapper.toDto(leaveRequest);
    }

    @Override
    public LeaveRequestDto updateLeaveRequest(Long employeeId, LeaveRequestFormDto requestDto) {
        LeaveRequest existing = leaveRequestRepository.findById(requestDto.getId())
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!existing.getEmployee().getId().equals(employeeId)) {
            throw new RuntimeException("Unauthorized to update this leave request");
        }

        if (existing.getStatus() != LeaveRequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be modified");
        }

        // Restore previous pending balance
        leaveBalanceService.updateBalanceAfterLeaveRequest(
                employeeId, existing.getLeaveType().getId(),
                existing.getStartDate().getYear(),
                existing.getDaysRequested().negate(),
                false);

        // Update the request
        LeaveType leaveType = leaveTypeRepository.findById(requestDto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        java.math.BigDecimal daysRequested = calculateWorkingDays(requestDto.getStartDate(), requestDto.getEndDate(),
                requestDto.getIsHalfDayStart(), requestDto.getIsHalfDayEnd());

        // Check overlap excluding the current request id
        List<LeaveRequest> selfOverlaps = leaveRequestRepository.findEmployeeOverlappingLeavesExcluding(
                employeeId, existing.getId(), requestDto.getStartDate(), requestDto.getEndDate());
        if (!selfOverlaps.isEmpty()) {
            throw new RuntimeException("Leave request overlaps with your existing leave");
        }

        existing.setLeaveType(leaveType);
        existing.setStartDate(requestDto.getStartDate());
        existing.setEndDate(requestDto.getEndDate());
        existing.setDaysRequested(daysRequested);
        existing.setReason(requestDto.getReason());
        existing.setIsHalfDayStart(requestDto.getIsHalfDayStart());
        existing.setIsHalfDayEnd(requestDto.getIsHalfDayEnd());
        existing.setEmergencyContact(requestDto.getEmergencyContact());

        existing = leaveRequestRepository.save(existing);

        // Update new pending balance
        leaveBalanceService.updateBalanceAfterLeaveRequest(employeeId, requestDto.getLeaveTypeId(),
                requestDto.getStartDate().getYear(), daysRequested, false);

        return leaveRequestMapper.toDto(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveRequestDto getLeaveRequestById(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        return leaveRequestMapper.toDto(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getEmployeeLeaveRequests(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(employeeId).stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveRequestStatus.PENDING).stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestDto cancelLeaveRequest(Long requestId, Long employeeId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new RuntimeException("Unauthorized to cancel this leave request");
        }

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING && leaveRequest.getStatus() != LeaveRequestStatus.APPROVED) {
            throw new RuntimeException("Only pending or approved requests can be cancelled");
        }

        LeaveRequestStatus previousStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveRequestStatus.CANCELLED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Restore balance based on previous status
        if (previousStatus == LeaveRequestStatus.PENDING) {
            // Remove from pending
            leaveBalanceService.updateBalanceAfterLeaveRequest(
                    employeeId, leaveRequest.getLeaveType().getId(),
                    leaveRequest.getStartDate().getYear(),
                    leaveRequest.getDaysRequested().negate(),
                    false);
        } else if (previousStatus == LeaveRequestStatus.APPROVED) { // Approved branch restores used balance
            // Remove from used and pending (if any)
            leaveBalanceService.updateBalanceAfterLeaveRequest(
                    employeeId, leaveRequest.getLeaveType().getId(),
                    leaveRequest.getStartDate().getYear(),
                    leaveRequest.getDaysRequested().negate(),
                    true);
        }

        leaveNotificationService.sendCancellationNotifications(leaveRequest.getId());

        return leaveRequestMapper.toDto(leaveRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getOverlappingLeaves(LocalDate startDate, LocalDate endDate, Long excludeEmployeeId) {
        return leaveRequestRepository.findOverlappingLeaves(startDate, endDate, excludeEmployeeId).stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getUpcomingLeaves(Long employeeId) {
        return leaveRequestRepository.findUpcomingApprovedLeaves(employeeId, LocalDate.now()).stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteLeaveRequest(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (request.getStatus() == LeaveRequestStatus.APPROVED) {
            throw new RuntimeException("Cannot delete approved leave requests");
        }

        if (request.getStatus() == LeaveRequestStatus.PENDING) {
            // Restore pending balance
            leaveBalanceService.updateBalanceAfterLeaveRequest(
                    request.getEmployee().getId(),
                    request.getLeaveType().getId(),
                    request.getStartDate().getYear(),
                    request.getDaysRequested().negate(),
                    false);
        }

        leaveRequestRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getLeavesByDateRange(LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findOverlappingLeaves(startDate, endDate, 0L).stream()
                .filter(request -> request.getStatus() == LeaveRequestStatus.APPROVED)
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getApprovedLeavesByMonth(int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        return getLeavesByDateRange(startOfMonth, endOfMonth);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getEmployeeApprovedLeavesByMonth(Long employeeId, int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        return leaveRequestRepository.findOverlappingLeaves(startOfMonth, endOfMonth, 0L).stream()
                .filter(request -> request.getStatus() == LeaveRequestStatus.APPROVED)
                .filter(request -> request.getEmployee().getId().equals(employeeId))
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    private java.math.BigDecimal calculateWorkingDays(LocalDate startDate, LocalDate endDate,
                                   Boolean isHalfDayStart, Boolean isHalfDayEnd) {
        int workingDays = 0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek().getValue() <= 5) { // Monday to Friday
                workingDays++;
            }
            current = current.plusDays(1);
        }
        java.math.BigDecimal days = new java.math.BigDecimal(workingDays);
        if (Boolean.TRUE.equals(isHalfDayStart) && workingDays > 0) {
            days = days.subtract(new java.math.BigDecimal("0.5"));
        }
        if (Boolean.TRUE.equals(isHalfDayEnd) && workingDays > 0) {
            days = days.subtract(new java.math.BigDecimal("0.5"));
        }
        if (days.compareTo(java.math.BigDecimal.ZERO) < 0) days = java.math.BigDecimal.ZERO;
        return days.setScale(1, RoundingMode.HALF_UP);
    }

    private void validateLeaveBalance(Long employeeId, Long leaveTypeId, java.math.BigDecimal daysRequested) {
        int year = LocalDate.now().getYear();
        java.util.List<LeaveBalanceDto> balances = leaveBalanceService.getEmployeeLeaveBalances(employeeId, year);
        LeaveBalanceDto balance = balances.stream()
                .filter(b -> b.getLeaveTypeId().equals(leaveTypeId))
                .findFirst()
                .orElse(null);

        if (balance == null) {
            // Initialize for all active types
            leaveBalanceService.initializeEmployeeBalances(employeeId, year);
            balances = leaveBalanceService.getEmployeeLeaveBalances(employeeId, year);
            balance = balances.stream()
                    .filter(b -> b.getLeaveTypeId().equals(leaveTypeId))
                    .findFirst()
                    .orElse(null);
            // As ultimate fallback create a single balance if still null (leave type may have become inactive just after init)
            if (balance == null) {
                // Build a minimal temporary balance entity via service logic (reusing initialization)
                // We re-run initialization only for safety; if still missing throw detailed message.
                leaveBalanceService.initializeEmployeeBalances(employeeId, year);
                balances = leaveBalanceService.getEmployeeLeaveBalances(employeeId, year);
                balance = balances.stream()
                        .filter(b -> b.getLeaveTypeId().equals(leaveTypeId))
                        .findFirst()
                        .orElse(null);
                if (balance == null) {
                    throw new RuntimeException("Could not create leave balance for employee=" + employeeId + " leaveType=" + leaveTypeId);
                }
            }
        }

        if (balance.getRemainingDays().compareTo(daysRequested) < 0) {
            throw new RuntimeException("Insufficient leave balance. Available: " + balance.getRemainingDays() +
                    " days, Requested: " + daysRequested + " days");
        }
    }

    private void enforceConcurrencyCap(Long leaveTypeId, LocalDate start, LocalDate end) {
        LeaveType type = leaveTypeRepository.findById(leaveTypeId)
                .orElseThrow(() -> new RuntimeException("Leave type not found"));
        Integer cap = type.getMaxConcurrentRequests();
        if (cap == null || cap <= 0) return; // no limit
        long concurrent = leaveRequestRepository.countOverlappingByType(leaveTypeId, start, end);
        if (concurrent >= cap) {
            throw new RuntimeException("Maximum concurrent requests reached for this period for type '" + type.getName() + "'");
        }
    }
}
