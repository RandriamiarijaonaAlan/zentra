package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.hr.dto.DepartmentDto;
import org.pentagone.business.zentracore.hr.entity.Department;
import org.pentagone.business.zentracore.hr.repository.DepartmentRepository;
import org.pentagone.business.zentracore.hr.service.DepartmentService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<DepartmentDto> getDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private DepartmentDto toDto(Department entity) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        if (entity.getAnnualBudget() != null) {
            dto.setAnnualBudget(BigDecimal.valueOf(entity.getAnnualBudget()));
        }
        return dto;
    }
}
