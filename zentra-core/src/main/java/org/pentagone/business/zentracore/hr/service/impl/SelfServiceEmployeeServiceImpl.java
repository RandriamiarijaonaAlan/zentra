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
    private final PayslipRepository payslipRepository;
    private final DocumentRequestRepository documentRequestRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final HrMessageRepository hrMessageRepository;

    public SelfServiceEmployeeServiceImpl(
            EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            PayslipRepository payslipRepository,
            DocumentRequestRepository documentRequestRepository,
            ExpenseClaimRepository expenseClaimRepository,
            HrMessageRepository hrMessageRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
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
        
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, finalYear)
                .orElseGet(() -> createDefaultLeaveBalance(employeeId, finalYear));
        
        return toLeaveBalanceDto(balance);
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
        
        // Calculate business days
        double days = calculateBusinessDays(requestDto.getStartDate(), requestDto.getEndDate());
        
        // Check balance
        Integer year = requestDto.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year)
                .orElseGet(() -> createDefaultLeaveBalance(employeeId, year));
        
        String leaveType = requestDto.getType() != null ? requestDto.getType() : "ANNUAL";
        double remaining = balance.getAnnualTotal() - balance.getAnnualTaken();
        
        if (leaveType.equals("ANNUAL") && days > remaining) {
            throw new IllegalArgumentException("Solde de congés insuffisant. Disponible: " + remaining + " jours");
        }
        
        LeaveRequest request = new LeaveRequest();
        request.setEmployee(employee);
        request.setStartDate(requestDto.getStartDate());
        request.setEndDate(requestDto.getEndDate());
        request.setDays(days);
        request.setType(leaveType);
        request.setStatus("PENDING");
        request.setReason(requestDto.getReason());
        
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
        
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être annulées");
        }
        
        request.setStatus("CANCELLED");
        LeaveRequest updated = leaveRequestRepository.save(request);
        return toLeaveRequestDto(updated);
    }

    // Payslips
    @Override
    public List<PayslipDto> getMyPayslips(Long employeeId, Integer year) {
        List<Payslip> payslips = payslipRepository.findByEmployeeIdOrderByPeriodEndDesc(employeeId);
        
        // Filter by year if provided
        if (year != null) {
            payslips = payslips.stream()
                    .filter(p -> p.getPeriodEnd() != null && p.getPeriodEnd().getYear() == year)
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
        
        if (!payslip.getEmployee().getId().equals(employeeId)) {
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

    // Helper methods
    private Employee getEmployeeOrThrow(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable: " + employeeId));
    }

    private LeaveBalance createDefaultLeaveBalance(Long employeeId, Integer year) {
        Employee employee = getEmployeeOrThrow(employeeId);
        
        LeaveBalance balance = new LeaveBalance();
        balance.setEmployee(employee);
        balance.setYear(year);
        balance.setAnnualTotal(25.0);
        balance.setAnnualTaken(0.0);
        balance.setSickTotal(0.0);
        balance.setSickTaken(0.0);
        balance.setExceptionalTotal(0.0);
        balance.setExceptionalTaken(0.0);
        
        return leaveBalanceRepository.save(balance);
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

    @Override
    public java.util.List<org.pentagone.business.zentracore.hr.dto.EmployeeOptionDTO> listEmployees(String q, Integer page, Integer size) {
        int p = (page == null || page < 0) ? 0 : page;
        int s = (size == null || size <= 0 || size > 100) ? 20 : size;
        var pageable = PageRequest.of(p, s);
        var pageRes = employeeRepository.findAll(pageable);
        return pageRes.stream().map(e -> {
            var dto = new org.pentagone.business.zentracore.hr.dto.EmployeeOptionDTO();
            dto.setId(e.getId());
            dto.setEmployeeNumber(e.getEmployeeNumber());
            dto.setFullName((e.getFirstName() != null ? e.getFirstName() : "") + " " + (e.getLastName() != null ? e.getLastName() : "").trim());
            return dto;
        }).toList();
    }
    
    private int extractYear(LocalDate date) {
        return date != null ? date.getYear() : LocalDate.now().getYear();
    }
    
    private int extractMonth(LocalDate date) {
        return date != null ? date.getMonthValue() : LocalDate.now().getMonthValue();
    }

    private LeaveBalanceDto toLeaveBalanceDto(LeaveBalance b) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setId(b.getId());
        dto.setEmployeeId(b.getEmployee().getId());
        dto.setYear(b.getYear());
        dto.setAnnualTotal(b.getAnnualTotal());
        dto.setAnnualTaken(b.getAnnualTaken());
        dto.setAnnualRemaining(b.getAnnualTotal() - b.getAnnualTaken());
        dto.setSickTotal(b.getSickTotal());
        dto.setSickTaken(b.getSickTaken());
        dto.setSickRemaining(b.getSickTotal() - b.getSickTaken());
        dto.setExceptionalTotal(b.getExceptionalTotal());
        dto.setExceptionalTaken(b.getExceptionalTaken());
        dto.setExceptionalRemaining(b.getExceptionalTotal() - b.getExceptionalTaken());
        return dto;
    }

    private LeaveRequestDto toLeaveRequestDto(LeaveRequest r) {
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

    private PayslipDto toPayslipDto(Payslip p) {
        PayslipDto dto = new PayslipDto();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployee().getId());
        dto.setEmployeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName());
        dto.setPeriodYear(extractYear(p.getPeriodEnd()));
        dto.setPeriodMonth(extractMonth(p.getPeriodEnd()));
        dto.setGrossAmount(p.getGrossSalary());
        dto.setNetAmount(p.getNetSalary());
        dto.setDeductions(0.0); // Calculated if needed
        dto.setBonuses(0.0); // Not in current schema
        dto.setFilePath(p.getFilePath());
        dto.setGeneratedAt(p.getGeneratedAt());
        dto.setStatus("GENERATED"); // Default status
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
