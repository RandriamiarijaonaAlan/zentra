package org.pentagone.business.zentracore.hr.service.impl;

import jakarta.persistence.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.*;
import org.pentagone.business.zentracore.hr.entity.*;
import org.pentagone.business.zentracore.hr.repository.*;
import org.pentagone.business.zentracore.hr.service.SelfServiceEmployeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SelfServiceEmployeeServiceImpl implements SelfServiceEmployeeService {

    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final PayslipRepository payslipRepository;
    private final DocumentRequestRepository documentRequestRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final HrMessageRepository hrMessageRepository;

    public SelfServiceEmployeeServiceImpl(
            EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            LeaveTypeRepository leaveTypeRepository,
            PayslipRepository payslipRepository,
            DocumentRequestRepository documentRequestRepository,
            ExpenseClaimRepository expenseClaimRepository,
            HrMessageRepository hrMessageRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.payslipRepository = payslipRepository;
        this.documentRequestRepository = documentRequestRepository;
        this.expenseClaimRepository = expenseClaimRepository;
        this.hrMessageRepository = hrMessageRepository;
    }

    // Profile management
    @Override
    public EmployeeDto getMyProfile(Long employeeId) {
        Employee employee = getEmployeeOrThrow(employeeId);
        return toEmployeeDto(employee);
    }

    @Override
    public EmployeeDto updateMyProfile(Long employeeId, EmployeeProfileUpdateDto updateDto) {
        Employee employee = getEmployeeOrThrow(employeeId);
        
        if (updateDto.getWorkPhone() != null) {
            employee.setWorkPhone(updateDto.getWorkPhone());
        }
        if (updateDto.getAddress() != null) {
            employee.setAddress(updateDto.getAddress());
        }
        if (updateDto.getCity() != null) {
            employee.setCity(updateDto.getCity());
        }
        if (updateDto.getCountry() != null) {
            employee.setCountry(updateDto.getCountry());
        }
        if (updateDto.getGender() != null) {
            employee.setGender(updateDto.getGender());
        }
        
        Employee updated = employeeRepository.save(employee);
        return toEmployeeDto(updated);
    }

    // Leave management
    @Override
    public LeaveBalanceDto getMyLeaveBalance(Long employeeId, Integer year) {
        final Integer finalYear = (year != null) ? year : LocalDate.now().getYear();
        
        // For now, return empty list since we need to aggregate by leave types
        LeaveBalanceDto emptyDto = new LeaveBalanceDto();
        emptyDto.setEmployeeId(employeeId);
        emptyDto.setYear(finalYear);
        emptyDto.setAnnualTotal(0.0);
        emptyDto.setAnnualTaken(0.0);
        emptyDto.setAnnualRemaining(0.0);
        emptyDto.setSickTotal(0.0);
        emptyDto.setSickTaken(0.0);
        emptyDto.setSickRemaining(0.0);
        emptyDto.setExceptionalTotal(0.0);
        emptyDto.setExceptionalTaken(0.0);
        emptyDto.setExceptionalRemaining(0.0);
        
        return emptyDto;
    }

    @Override
    public List<LeaveRequestDto> getMyLeaveRequests(Long employeeId, Integer year, String status) {
        List<LeaveRequest> requests;
        
        if (status != null && !status.isEmpty()) {
            requests = leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, status);
        } else {
            requests = leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(employeeId);
        }
        
        // Filter by year if provided
        if (year != null) {
            requests = requests.stream()
                    .filter(r -> r.getStartDate().getYear() == year)
                    .collect(Collectors.toList());
        }
        
        return requests.stream()
                .map(this::toLeaveRequestDto)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestDto createLeaveRequest(Long employeeId, LeaveRequestDto requestDto) {
        Employee employee = getEmployeeOrThrow(employeeId);
        
        // For now, skip leave type lookup - will be implemented later
        // TODO: Implement proper leave type lookup via repository
        
        // Calculate business days
        BigDecimal days = BigDecimal.valueOf(calculateBusinessDays(requestDto.getStartDate(), requestDto.getEndDate()));
        
        // Skip balance check for now - will be implemented later
        // TODO: implement proper balance check
        
        LeaveRequest request = new LeaveRequest();
        request.setEmployee(employee);
        // leaveType will be null for now - needs proper implementation
        request.setStartDate(requestDto.getStartDate());
        request.setEndDate(requestDto.getEndDate());
        request.setDaysRequested(days);
        request.setReason(requestDto.getReason());
        request.setStatus(LeaveRequest.LeaveRequestStatus.PENDING);
        
        LeaveRequest saved = leaveRequestRepository.save(request);
        return toLeaveRequestDto(saved);
    }

    @Override
    public LeaveRequestDto cancelLeaveRequest(Long employeeId, Long requestId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Demande de congé introuvable"));
        
        if (!request.getEmployee().getId().equals(employeeId)) {
            throw new SecurityException("Accès non autorisé");
        }
        
        if (request.getStatus() != LeaveRequest.LeaveRequestStatus.PENDING) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être annulées");
        }
        
        request.setStatus(LeaveRequest.LeaveRequestStatus.CANCELLED);
        LeaveRequest updated = leaveRequestRepository.save(request);
        return toLeaveRequestDto(updated);
    }

    // Payslips
    @Override
    public List<PayslipDto> getMyPayslips(Long employeeId, Integer year) {
        List<Payslip> payslips = payslipRepository.findByEmployeeIdOrderByPayPeriodDesc(employeeId);
        
        // Filter by year if provided (using payPeriod field)
        if (year != null) {
            payslips = payslips.stream()
                    .filter(p -> {
                        if (p.getPayPeriod() == null) return false;
                        try {
                            String[] parts = p.getPayPeriod().split("-");
                            return parts.length > 0 && Integer.parseInt(parts[0]) == year;
                        } catch (Exception e) {
                            return p.getPayDate() != null && p.getPayDate().getYear() == year;
                        }
                    })
                    .collect(Collectors.toList());
        }
        
        return payslips.stream()
                .map(this::toPayslipDto)
                .collect(Collectors.toList());
    }

    @Override
    public PayslipDto getPayslipById(Long employeeId, Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Bulletin de paie introuvable"));
        
        if (!payslip.getEmployeeId().equals(employeeId)) {
            throw new SecurityException("Accès non autorisé");
        }
        
        return toPayslipDto(payslip);
    }

    // Document requests
    @Override
    public List<DocumentRequestDto> getMyDocumentRequests(Long employeeId) {
        return documentRequestRepository.findByEmployeeIdOrderByRequestedAtDesc(employeeId)
                .stream()
                .map(this::toDocumentRequestDto)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentRequestDto createDocumentRequest(Long employeeId, DocumentRequestDto requestDto) {
        Employee employee = getEmployeeOrThrow(employeeId);
        
        DocumentRequest request = new DocumentRequest();
        request.setEmployee(employee);
        request.setType(requestDto.getType());
        request.setReason(requestDto.getReason());
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());
        
        DocumentRequest saved = documentRequestRepository.save(request);
        return toDocumentRequestDto(saved);
    }

    // Expense claims
    @Override
    public List<ExpenseClaimDto> getMyExpenseClaims(Long employeeId) {
        return expenseClaimRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId)
                .stream()
                .map(this::toExpenseClaimDto)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseClaimDto createExpenseClaim(Long employeeId, ExpenseClaimDto claimDto) {
        Employee employee = getEmployeeOrThrow(employeeId);
        
        ExpenseClaim claim = new ExpenseClaim();
        claim.setEmployee(employee);
        claim.setClaimDate(claimDto.getClaimDate() != null ? claimDto.getClaimDate() : LocalDate.now());
        claim.setAmount(claimDto.getAmount());
        claim.setCurrency(claimDto.getCurrency() != null ? claimDto.getCurrency() : "EUR");
        claim.setCategory(claimDto.getCategory());
        claim.setDescription(claimDto.getDescription());
        claim.setStatus("PENDING");
        claim.setReceiptFiles(claimDto.getReceiptFiles());
        claim.setSubmittedAt(LocalDateTime.now());
        
        ExpenseClaim saved = expenseClaimRepository.save(claim);
        return toExpenseClaimDto(saved);
    }

    @Override
    public ExpenseClaimDto cancelExpenseClaim(Long employeeId, Long claimId) {
        ExpenseClaim claim = expenseClaimRepository.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Note de frais introuvable"));
        
        if (!claim.getEmployee().getId().equals(employeeId)) {
            throw new SecurityException("Accès non autorisé");
        }
        
        if (!"PENDING".equals(claim.getStatus())) {
            throw new IllegalStateException("Seules les notes de frais en attente peuvent être annulées");
        }
        
        claim.setStatus("CANCELLED");
        ExpenseClaim updated = expenseClaimRepository.save(claim);
        return toExpenseClaimDto(updated);
    }

    // HR Messages
    @Override
    public List<String> getMyMessageThreads(Long employeeId) {
        return hrMessageRepository.findDistinctThreadIdsByEmployeeId(employeeId);
    }

    @Override
    public List<HrMessageDto> getThreadMessages(Long employeeId, String threadId) {
        List<HrMessage> messages = hrMessageRepository.findByThreadIdOrderBySentAt(threadId);
        
        // Verify ownership
        if (!messages.isEmpty() && !messages.get(0).getEmployee().getId().equals(employeeId)) {
            throw new SecurityException("Accès non autorisé");
        }
        
        return messages.stream()
                .map(this::toHrMessageDto)
                .collect(Collectors.toList());
    }

    @Override
    public HrMessageDto sendMessage(Long employeeId, HrMessageDto messageDto) {
        Employee employee = getEmployeeOrThrow(employeeId);
        
        HrMessage message = new HrMessage();
        message.setEmployee(employee);
        message.setSenderRole("EMPLOYEE");
        message.setSubject(messageDto.getSubject());
        message.setBody(messageDto.getBody());
        message.setSentAt(LocalDateTime.now());
        
        // Generate or use existing threadId
        String threadId = messageDto.getThreadId();
        if (threadId == null || threadId.isEmpty()) {
            threadId = "THREAD-" + UUID.randomUUID().toString();
        }
        message.setThreadId(threadId);
        
        HrMessage saved = hrMessageRepository.save(message);
        return toHrMessageDto(saved);
    }

    @Override
    public List<EmployeeOptionDTO> listEmployees(String q, Integer page, Integer size) {
        int p = (page == null || page < 0) ? 0 : page;
        int s = (size == null || size <= 0 || size > 100) ? 20 : size;
        var pageable = PageRequest.of(p, s);
        var pageRes = employeeRepository.findAll(pageable);
        return pageRes.stream().map(e -> {
            var dto = new EmployeeOptionDTO();
            dto.setId(e.getId());
            dto.setEmployeeNumber(e.getEmployeeNumber());
            dto.setFullName((e.getFirstName() != null ? e.getFirstName() : "") + " " + (e.getLastName() != null ? e.getLastName() : "").trim());
            return dto;
        }).toList();
    }

    // Helper methods
    private Employee getEmployeeOrThrow(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable: " + employeeId));
    }

    private double calculateBusinessDays(LocalDate start, LocalDate end) {
        // Simple calculation (excluding weekends)
        long businessDays = 0;
        
        LocalDate current = start;
        while (!current.isAfter(end)) {
            if (current.getDayOfWeek().getValue() < 6) { // Monday=1, Friday=5
                businessDays++;
            }
            current = current.plusDays(1);
        }
        
        return businessDays;
    }

    private LeaveBalanceDto aggregateLeaveBalances(List<LeaveBalance> balances, Long employeeId, Integer year) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setEmployeeId(employeeId);
        dto.setYear(year);
        
        // Initialize totals
        double annualTotal = 0, annualTaken = 0;
        double sickTotal = 0, sickTaken = 0;
        double exceptionalTotal = 0, exceptionalTaken = 0;
        
        for (LeaveBalance balance : balances) {
            String leaveTypeName = balance.getLeaveType().getName();
            double allocated = balance.getAllocatedDays().doubleValue();
            double used = balance.getUsedDays().doubleValue();
            
            if ("ANNUAL".equalsIgnoreCase(leaveTypeName)) {
                annualTotal += allocated;
                annualTaken += used;
            } else if ("SICK".equalsIgnoreCase(leaveTypeName)) {
                sickTotal += allocated;
                sickTaken += used;
            } else if ("EXCEPTIONAL".equalsIgnoreCase(leaveTypeName)) {
                exceptionalTotal += allocated;
                exceptionalTaken += used;
            }
        }
        
        dto.setAnnualTotal(annualTotal);
        dto.setAnnualTaken(annualTaken);
        dto.setAnnualRemaining(annualTotal - annualTaken);
        dto.setSickTotal(sickTotal);
        dto.setSickTaken(sickTaken);
        dto.setSickRemaining(sickTotal - sickTaken);
        dto.setExceptionalTotal(exceptionalTotal);
        dto.setExceptionalTaken(exceptionalTaken);
        dto.setExceptionalRemaining(exceptionalTotal - exceptionalTaken);
        
        return dto;
    }

    // DTO mappers
    private EmployeeDto toEmployeeDto(Employee e) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(e.getId());
        dto.setEmployeeNumber(e.getEmployeeNumber());
        dto.setLastName(e.getLastName());
        dto.setFirstName(e.getFirstName());
        dto.setWorkEmail(e.getWorkEmail());
        dto.setWorkPhone(e.getWorkPhone());
        dto.setBirthDate(e.getBirthDate());
        dto.setGender(e.getGender());
        dto.setAddress(e.getAddress());
        dto.setCity(e.getCity());
        dto.setCountry(e.getCountry());
        dto.setHireDate(e.getHireDate());
        dto.setBaseSalary(e.getBaseSalary() != null ? BigDecimal.valueOf(e.getBaseSalary()) : null);
        dto.setContractEndDate(e.getContractEndDate());
        if (e.getJob() != null) {
            dto.setJobId(e.getJob().getId());
        }
        return dto;
    }

    private LeaveRequestDto toLeaveRequestDto(LeaveRequest r) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(r.getId());
        dto.setEmployeeId(r.getEmployee().getId());
        dto.setEmployeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName());
        dto.setStartDate(r.getStartDate());
        dto.setEndDate(r.getEndDate());
        dto.setDaysRequested(r.getDaysRequested());
        dto.setType(r.getLeaveType() != null ? r.getLeaveType().getName() : "ANNUAL");
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

    private PayslipDto toPayslipDto(Payslip p) {
        PayslipDto dto = new PayslipDto();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployeeId());
        
        // Get employee name
        employeeRepository.findById(p.getEmployeeId()).ifPresent(emp -> {
            dto.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
        });
        
        // Parse period (assuming format "YYYY-MM" or "Month YYYY")
        if (p.getPayPeriod() != null) {
            try {
                String[] parts = p.getPayPeriod().split("-");
                if (parts.length == 2) {
                    dto.setPeriodYear(Integer.parseInt(parts[0]));
                    dto.setPeriodMonth(Integer.parseInt(parts[1]));
                } else {
                    dto.setPeriodYear(p.getPayDate().getYear());
                    dto.setPeriodMonth(p.getPayDate().getMonthValue());
                }
            } catch (Exception e) {
                dto.setPeriodYear(p.getPayDate().getYear());
                dto.setPeriodMonth(p.getPayDate().getMonthValue());
            }
        }
        
        dto.setGrossAmount(p.getGrossSalary() != null ? p.getGrossSalary().doubleValue() : 0.0);
        dto.setNetAmount(p.getNetSalary() != null ? p.getNetSalary().doubleValue() : 0.0);
        dto.setDeductions(p.getDeductions() != null ? p.getDeductions().doubleValue() : 0.0);
        dto.setBonuses(p.getBonuses() != null ? p.getBonuses().doubleValue() : 0.0);
        dto.setFilePath(p.getFilePath());
        if (p.getCreatedAt() != null) {
            dto.setGeneratedAt(p.getCreatedAt().atStartOfDay());
        }
        dto.setStatus("GENERATED");
        return dto;
    }

    private DocumentRequestDto toDocumentRequestDto(DocumentRequest d) {
        DocumentRequestDto dto = new DocumentRequestDto();
        dto.setId(d.getId());
        dto.setEmployeeId(d.getEmployee().getId());
        dto.setEmployeeName(d.getEmployee().getFirstName() + " " + d.getEmployee().getLastName());
        dto.setType(d.getType());
        dto.setStatus(d.getStatus());
        dto.setReason(d.getReason());
        dto.setRequestedAt(d.getRequestedAt());
        dto.setProcessedAt(d.getProcessedAt());
        dto.setDeliveredAt(d.getDeliveredAt());
        dto.setFilePath(d.getFilePath());
        if (d.getProcessedBy() != null) {
            dto.setProcessedById(d.getProcessedBy().getId());
            dto.setProcessedByName(d.getProcessedBy().getFirstName() + " " + d.getProcessedBy().getLastName());
        }
        dto.setNotes(d.getNotes());
        return dto;
    }

    private ExpenseClaimDto toExpenseClaimDto(ExpenseClaim c) {
        ExpenseClaimDto dto = new ExpenseClaimDto();
        dto.setId(c.getId());
        dto.setEmployeeId(c.getEmployee().getId());
        dto.setEmployeeName(c.getEmployee().getFirstName() + " " + c.getEmployee().getLastName());
        dto.setClaimDate(c.getClaimDate());
        dto.setAmount(c.getAmount());
        dto.setCurrency(c.getCurrency());
        dto.setCategory(c.getCategory());
        dto.setDescription(c.getDescription());
        dto.setStatus(c.getStatus());
        dto.setReceiptFiles(c.getReceiptFiles());
        dto.setSubmittedAt(c.getSubmittedAt());
        if (c.getReviewedBy() != null) {
            dto.setReviewedById(c.getReviewedBy().getId());
            dto.setReviewedByName(c.getReviewedBy().getFirstName() + " " + c.getReviewedBy().getLastName());
        }
        dto.setReviewedAt(c.getReviewedAt());
        dto.setReviewNotes(c.getReviewNotes());
        dto.setPaidAt(c.getPaidAt());
        return dto;
    }

    private HrMessageDto toHrMessageDto(HrMessage m) {
        HrMessageDto dto = new HrMessageDto();
        dto.setId(m.getId());
        dto.setEmployeeId(m.getEmployee().getId());
        dto.setEmployeeName(m.getEmployee().getFirstName() + " " + m.getEmployee().getLastName());
        dto.setSenderRole(m.getSenderRole());
        dto.setSubject(m.getSubject());
        dto.setBody(m.getBody());
        dto.setSentAt(m.getSentAt());
        dto.setReadAt(m.getReadAt());
        dto.setThreadId(m.getThreadId());
        dto.setIsArchived(m.getIsArchived());
        if (m.getHrUser() != null) {
            dto.setHrUserId(m.getHrUser().getId());
            dto.setHrUserName(m.getHrUser().getFirstName() + " " + m.getHrUser().getLastName());
        }
        return dto;
    }
}
