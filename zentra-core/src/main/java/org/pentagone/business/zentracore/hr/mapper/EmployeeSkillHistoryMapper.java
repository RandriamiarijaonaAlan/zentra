package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pentagone.business.zentracore.hr.dto.EmployeeSkillHistoryDto;
import org.pentagone.business.zentracore.hr.entity.EmployeeSkillHistory;

@Mapper(componentModel = "spring")
public interface EmployeeSkillHistoryMapper {
    @Mapping(target = "employeeSkillId", source = "employeeSkill.id")
    EmployeeSkillHistoryDto toDto(EmployeeSkillHistory entity);
}

