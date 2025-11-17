package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.EmployeeDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.Job;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.JobRepository;
import org.pentagone.business.zentracore.hr.service.EmployeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final JobRepository jobRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository, JobRepository jobRepository) {
        this.employeeRepository = employeeRepository;
        this.jobRepository = jobRepository;
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        // Considérer id==0 comme null (certains fronts envoient 0 pour création)
        if (employeeDto.getId() != null && employeeDto.getId() != 0) {
            throw new IllegalArgumentException("Un nouveau employé ne peut pas avoir d'ID");
        }
        Employee employee = toEntity(employeeDto);
        // Valeur par défaut si hireDate non envoyée
        if (employee.getHireDate() == null) {
            employee.setHireDate(java.time.LocalDate.now());
        }
        validateEmployee(employee);
        Employee saved = employeeRepository.save(employee);
        return toDto(saved);
    }

    @Override
    public EmployeeDto updateEmployee(EmployeeDto employeeDto) {
        if (employeeDto.getId() == null) {
            throw new IllegalArgumentException("L'ID de l'employé est obligatoire pour la mise à jour");
        }
        if (!employeeRepository.existsById(employeeDto.getId())) {
            throw new EntityNotFoundException("Employé non trouvé avec l'ID: " + employeeDto.getId());
        }
        Employee employee = toEntity(employeeDto);
        validateEmployee(employee);
        Employee updated = employeeRepository.save(employee);
        return toDto(updated);
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé avec l'ID: " + id));
        return toDto(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé non trouvé avec l'ID: " + id));
        employeeRepository.delete(employee);
    }

    private void validateEmployee(Employee employee) {
        if (employee.getEmployeeNumber() == null || employee.getEmployeeNumber().isBlank())
            throw new IllegalArgumentException("Le matricule (employeeNumber) est obligatoire");
        if (employee.getFirstName() == null || employee.getFirstName().isBlank())
            throw new IllegalArgumentException("Le prénom est obligatoire");
        if (employee.getLastName() == null || employee.getLastName().isBlank())
            throw new IllegalArgumentException("Le nom est obligatoire");
        if (employee.getWorkEmail() == null || employee.getWorkEmail().isBlank())
            throw new IllegalArgumentException("L'email professionnel est obligatoire");
        if (employee.getBirthDate() == null)
            throw new IllegalArgumentException("La date de naissance est obligatoire");
        if (employee.getHireDate() == null)
            throw new IllegalArgumentException("La date d'embauche est obligatoire");
        if (employee.getBaseSalary() == null)
            throw new IllegalArgumentException("Le salaire de base est obligatoire");
        if (employee.getJob() == null)
            throw new IllegalArgumentException("Le poste (job) est obligatoire");
    }

    // Mapping manuel DTO -> Entity et inversement
    private EmployeeDto toDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setWorkEmail(employee.getWorkEmail());
        dto.setWorkPhone(employee.getWorkPhone());
        dto.setEmployeeNumber(employee.getEmployeeNumber());
        dto.setBirthDate(employee.getBirthDate());
        dto.setGender(employee.getGender());
        dto.setAddress(employee.getAddress());
        dto.setCity(employee.getCity());
        dto.setCountry(employee.getCountry());
        dto.setHireDate(employee.getHireDate());
        dto.setContractEndDate(employee.getContractEndDate());
        // baseSalary: Double -> BigDecimal
        if (employee.getBaseSalary() != null) {
            dto.setBaseSalary(BigDecimal.valueOf(employee.getBaseSalary()));
        }
        dto.setJobId(employee.getJob() != null ? employee.getJob().getId() : null);
        dto.setContractId(employee.getContract() != null ? employee.getContract().getId() : null);
        return dto;
    }

    private Employee toEntity(EmployeeDto dto) {
        Employee employee = new Employee();
        // Si id==0, ignorer (considérer comme null)
        if (dto.getId() != null && dto.getId() == 0) {
            employee.setId(null);
        } else {
            employee.setId(dto.getId());
        }
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setWorkEmail(dto.getWorkEmail());
        employee.setWorkPhone(dto.getWorkPhone());
        employee.setEmployeeNumber(dto.getEmployeeNumber());
        employee.setBirthDate(dto.getBirthDate());
        employee.setGender(dto.getGender());
        employee.setAddress(dto.getAddress());
        employee.setCity(dto.getCity());
        // country: défaut "France" si vide
        String country = dto.getCountry();
        if (country == null || country.isBlank()) {
            country = "France";
        }
        employee.setCountry(country);
        employee.setHireDate(dto.getHireDate());
        employee.setContractEndDate(dto.getContractEndDate());
        // baseSalary: BigDecimal -> Double
        if (dto.getBaseSalary() != null) {
            employee.setBaseSalary(dto.getBaseSalary().doubleValue());
        }
        // Résolution du job via jobId
        if (dto.getJobId() != null) {
            Job job = jobRepository.findById(dto.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Poste (job) non trouvé avec l'ID: " + dto.getJobId()));
            employee.setJob(job);
        }
        return employee;
    }
}
