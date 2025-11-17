package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pentagone.business.zentracore.hr.dto.DepartmentDto;
import org.pentagone.business.zentracore.hr.entity.Department;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    @Mapping(target = "annualBudget", expression = "java(entity.getAnnualBudget() != null ? java.math.BigDecimal.valueOf(entity.getAnnualBudget()) : null)")
    DepartmentDto toDto(Department entity);
}

