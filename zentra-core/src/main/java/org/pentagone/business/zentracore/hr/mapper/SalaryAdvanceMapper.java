package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.pentagone.business.zentracore.hr.dto.SalaryAdvanceDto;
import org.pentagone.business.zentracore.hr.entity.SalaryAdvance;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;

@SuppressWarnings("unused")
@Mapper(componentModel = "spring")
public abstract class SalaryAdvanceMapper {
    @Autowired
    private EmployeeRepository employeeRepository;

    public abstract SalaryAdvance toEntity(SalaryAdvanceDto dto);

    @Mapping(target = "employeeId", source = "employee.id")
    public abstract SalaryAdvanceDto toDto(SalaryAdvance entity);

    @AfterMapping
    protected void mapRelations(@MappingTarget SalaryAdvance salaryAdvance, SalaryAdvanceDto dto) {
        if (dto == null) return;
        if (dto.getEmployeeId() != null) salaryAdvance.setEmployee(employeeRepository.findById(dto.getEmployeeId()).orElse(null));
    }
}
