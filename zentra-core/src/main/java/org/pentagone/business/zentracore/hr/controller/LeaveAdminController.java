package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.LeaveRequestDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.LeaveBalance;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.LeaveBalanceRepository;
import org.pentagone.business.zentracore.hr.repository.LeaveRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/leave")
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
        List<LeaveRequest> reqs = (status == null || status.isBlank())
                ? leaveRequestRepository.findAll()
                : leaveRequestRepository.findByStatus(status);
        return ResponseEntity.ok(reqs.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<LeaveRequestDto> approve(@PathVariable Long id,
                                                   @RequestParam Long approverId) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Demande de congé introuvable"));
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être approuvées");
        }
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Approbateur introuvable"));

        req.setStatus("APPROVED");
        req.setApprover(approver);
        req.setApprovedAt(LocalDateTime.now());
        leaveRequestRepository.save(req);

        // Update leave balance for annual leave
        if ("ANNUAL".equalsIgnoreCase(req.getType())) {
            int year = req.getStartDate().getYear();
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndYear(req.getEmployee().getId(), year)
                    .orElseGet(() -> createDefaultLeaveBalance(req.getEmployee(), year));
            balance.setAnnualTaken(balance.getAnnualTaken() + req.getDays());
            leaveBalanceRepository.save(balance);
        }

        return ResponseEntity.ok(toDto(req));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<LeaveRequestDto> reject(@PathVariable Long id,
                                                  @RequestParam Long approverId,
                                                  @RequestParam(required = false) String reason) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Demande de congé introuvable"));
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être rejetées");
        }
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Approbateur introuvable"));

        req.setStatus("REJECTED");
        req.setApprover(approver);
        req.setApprovedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            req.setReason(reason);
        }
        leaveRequestRepository.save(req);
        return ResponseEntity.ok(toDto(req));
    }

    private LeaveBalance createDefaultLeaveBalance(Employee employee, int year) {
        LeaveBalance balance = new LeaveBalance();
        balance.setEmployee(employee);
        balance.setYear(year);
        balance.setAnnualTotal(25.0);
        balance.setAnnualTaken(0.0);
        balance.setSickTotal(0.0);
        balance.setSickTaken(0.0);
        balance.setExceptionalTotal(0.0);
        balance.setExceptionalTaken(0.0);
        return balance;
    }

    private LeaveRequestDto toDto(LeaveRequest r) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(r.getId());
        dto.setEmployeeId(r.getEmployee().getId());
        dto.setEmployeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName());
        dto.setStartDate(r.getStartDate());
        dto.setEndDate(r.getEndDate());
        dto.setDays(r.getDays());
        dto.setType(r.getType());
        dto.setStatus(r.getStatus());
        dto.setReason(r.getReason());
        if (r.getApprover() != null) {
            dto.setApproverId(r.getApprover().getId());
            dto.setApproverName(r.getApprover().getFirstName() + " " + r.getApprover().getLastName());
        }
        dto.setApprovedAt(r.getApprovedAt());
        return dto;
    }
}
