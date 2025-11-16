package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pentagone.business.zentracore.hr.dto.EmployeeSkillDto;
import org.pentagone.business.zentracore.hr.entity.EmployeeSkill;

@Mapper(componentModel = "spring")
public interface EmployeeSkillMapper {
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "skillId", source = "skill.id")
    @Mapping(target = "skillName", source = "skill.name")
    @Mapping(target = "category", source = "skill.category")
    EmployeeSkillDto toDto(EmployeeSkill entity);
}

