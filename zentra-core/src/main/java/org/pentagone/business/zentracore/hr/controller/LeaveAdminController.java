package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.LeaveRequestDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.LeaveBalance;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.LeaveBalanceRepository;
import org.pentagone.business.zentracore.hr.repository.LeaveRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/leave")
@CrossOrigin(origins = "*")
public class LeaveAdminController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveAdminController(LeaveRequestRepository leaveRequestRepository,
                                LeaveBalanceRepository leaveBalanceRepository,
                                EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<LeaveRequestDto>> list(@RequestParam(required = false) String status) {
        List<LeaveRequest> reqs;
        if (status == null || status.isBlank()) {
            reqs = leaveRequestRepository.findAll();
        } else {
            reqs = leaveRequestRepository.findByStatus(status);
        }
        return ResponseEntity.ok(reqs.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<LeaveRequestDto> approve(@PathVariable Long id,
                                                   @RequestParam Long approverId) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Demande de congé introuvable"));
        if (req.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être approuvées");
        }
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Approbateur introuvable"));

        req.setStatus(LeaveRequestStatus.APPROVED);
        req.setApprovedBy(approver);
        req.setApprovedDate(LocalDate.now());
        leaveRequestRepository.save(req);

        // Update leave balance - simplified for now
        // TODO: Properly update balance based on leave type
        
        return ResponseEntity.ok(toDto(req));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<LeaveRequestDto> reject(@PathVariable Long id,
                                                  @RequestParam Long approverId,
                                                  @RequestParam(required = false) String reason) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Demande de congé introuvable"));
        if (req.getStatus() != LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être rejetées");
        }
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Approbateur introuvable"));

        req.setStatus(LeaveRequestStatus.REJECTED);
        req.setApprovedBy(approver);
        req.setApprovedDate(LocalDate.now());
        if (reason != null && !reason.isBlank()) {
            req.setApprovalComment(reason);
        }
        leaveRequestRepository.save(req);
        return ResponseEntity.ok(toDto(req));
    }

    private LeaveRequestDto toDto(LeaveRequest r) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(r.getId());
        dto.setEmployeeId(r.getEmployee().getId());
        dto.setEmployeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName());
        dto.setStartDate(r.getStartDate());
        dto.setEndDate(r.getEndDate());
        dto.setDaysRequested(r.getDaysRequested());
        dto.setType(r.getLeaveType() != null ? r.getLeaveType().getName() : "UNKNOWN");
        dto.setStatus(r.getStatus());
        dto.setReason(r.getReason());
        if (r.getApprovedBy() != null) {
            dto.setApproverId(r.getApprovedBy().getId());
            dto.setApproverName(r.getApprovedBy().getFirstName() + " " + r.getApprovedBy().getLastName());
        }
        if (r.getApprovedDate() != null) {
            dto.setApprovedAt(r.getApprovedDate().atStartOfDay());
        }
        return dto;
    }
}
