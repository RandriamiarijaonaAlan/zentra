package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.EmployeeDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.service.EmployeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        if (employeeDto.getId() != null) {
            throw new IllegalArgumentException("Un nouveau employé ne peut pas avoir d'ID");
        }
        Employee employee = toEntity(employeeDto);
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

    // Méthodes de mapping manuel (en attendant le mapper)
    private EmployeeDto toDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setWorkEmail(employee.getWorkEmail());
        return dto;
    }

    private Employee toEntity(EmployeeDto dto) {
        Employee employee = new Employee();
        employee.setId(dto.getId());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setWorkEmail(dto.getWorkEmail());
        return employee;
    }
}

