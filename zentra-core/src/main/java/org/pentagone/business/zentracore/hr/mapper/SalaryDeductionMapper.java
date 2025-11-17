package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.pentagone.business.zentracore.hr.dto.SalaryDeductionDto;
import org.pentagone.business.zentracore.hr.entity.SalaryDeduction;

@Mapper(componentModel = "spring")
public interface SalaryDeductionMapper {
    SalaryDeductionDto toDto(SalaryDeduction entity);
    SalaryDeduction toEntity(SalaryDeductionDto dto);
}

