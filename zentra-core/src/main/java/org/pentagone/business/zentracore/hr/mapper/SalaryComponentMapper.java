package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.pentagone.business.zentracore.hr.dto.SalaryComponentDto;
import org.pentagone.business.zentracore.hr.entity.SalaryComponent;

@Mapper(componentModel = "spring")
public interface SalaryComponentMapper {
    SalaryComponentDto toDto(SalaryComponent entity);
    SalaryComponent toEntity(SalaryComponentDto dto);
}

