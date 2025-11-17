package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.ContractDto;
import org.pentagone.business.zentracore.hr.entity.Contract;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.repository.ContractRepository;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.service.ContractService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final EmployeeRepository employeeRepository;

    public ContractServiceImpl(ContractRepository contractRepository, EmployeeRepository employeeRepository) {
        this.contractRepository = contractRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public ContractDto create(ContractDto dto) {
        if (dto.getId() != null) throw new IllegalArgumentException("Nouveau contrat sans ID explicite");
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable"));
        Contract contract = toEntity(dto, employee);
        Contract saved = contractRepository.save(contract);
        return toDto(saved);
    }

    @Override
    public ContractDto update(ContractDto dto) {
        if (dto.getId() == null) throw new IllegalArgumentException("ID requis pour update");
        Contract existing = contractRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contrat introuvable"));
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable"));
        existing.setContractNumber(dto.getContractNumber());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setGrossSalary(dto.getGrossSalary() != null ? dto.getGrossSalary().doubleValue() : null);
        existing.setAnnualBonus(dto.getAnnualBonus() != null ? dto.getAnnualBonus().doubleValue() : null);
        existing.setBenefits(dto.getBenefits());
        existing.setWeeklyHours(dto.getWeeklyHours());
        existing.setAnnualLeaveDays(dto.getAnnualLeaveDays());
        existing.setSignatureDate(dto.getSignatureDate());
        existing.setContractFile(dto.getContractFile());
        existing.setContractType(dto.getContractType());
        existing.setDurationMonths(dto.getDurationMonths());
        existing.setTrialPeriodMonths(dto.getTrialPeriodMonths());
        existing.setRenewable(dto.getRenewable());
        existing.setEmployee(employee);
        return toDto(contractRepository.save(existing));
    }

    @Override
    public ContractDto getById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contrat introuvable"));
        return toDto(contract);
    }

    @Override
    public List<ContractDto> listByEmployee(Long employeeId) {
        return contractRepository.findByEmployeeId(employeeId).stream().map(this::toDto).toList();
    }

    @Override
    public void delete(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contrat introuvable"));
        contractRepository.delete(contract);
    }

    private ContractDto toDto(Contract c) {
        ContractDto dto = new ContractDto();
        dto.setId(c.getId());
        dto.setEmployeeId(c.getEmployee() != null ? c.getEmployee().getId() : null);
        dto.setContractNumber(c.getContractNumber());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());
        dto.setContractType(c.getContractType());
        dto.setDurationMonths(c.getDurationMonths());
        dto.setTrialPeriodMonths(c.getTrialPeriodMonths());
        dto.setRenewable(c.getRenewable());
        // mapping BigDecimal simple
        // On garde double -> BigDecimal minimaliste (pas de conversion précise exigée)
        return dto;
    }

    private Contract toEntity(ContractDto dto, Employee employee) {
        Contract c = new Contract();
        c.setId(dto.getId());
        c.setEmployee(employee);
        c.setContractNumber(dto.getContractNumber());
        c.setStartDate(dto.getStartDate());
        c.setEndDate(dto.getEndDate());
        c.setGrossSalary(dto.getGrossSalary() != null ? dto.getGrossSalary().doubleValue() : null);
        c.setAnnualBonus(dto.getAnnualBonus() != null ? dto.getAnnualBonus().doubleValue() : null);
        c.setBenefits(dto.getBenefits());
        c.setWeeklyHours(dto.getWeeklyHours());
        c.setAnnualLeaveDays(dto.getAnnualLeaveDays());
        c.setSignatureDate(dto.getSignatureDate());
        c.setContractFile(dto.getContractFile());
        c.setContractType(dto.getContractType());
        c.setDurationMonths(dto.getDurationMonths());
        c.setTrialPeriodMonths(dto.getTrialPeriodMonths());
        c.setRenewable(dto.getRenewable());
        return c;
    }
}
