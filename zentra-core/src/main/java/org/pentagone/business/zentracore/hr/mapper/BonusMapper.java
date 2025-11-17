package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.pentagone.business.zentracore.hr.dto.BonusDto;
import org.pentagone.business.zentracore.hr.entity.Bonus;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;

@SuppressWarnings("unused")
@Mapper(componentModel = "spring")
public abstract class BonusMapper {
    @Autowired
    private EmployeeRepository employeeRepository;

    public abstract Bonus toEntity(BonusDto dto);

    @Mapping(target = "employeeId", source = "employee.id")
    public abstract BonusDto toDto(Bonus entity);

    @AfterMapping
    protected void mapRelations(@MappingTarget Bonus bonus, BonusDto dto) {
        if (dto == null) return;
        if (dto.getEmployeeId() != null) bonus.setEmployee(employeeRepository.findById(dto.getEmployeeId()).orElse(null));
    }
}
