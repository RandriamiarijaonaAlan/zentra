package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pentagone.business.zentracore.hr.dto.CnapsRateDto;
import org.pentagone.business.zentracore.hr.entity.CnapsRate;

@Mapper(componentModel = "spring")
public interface CnapsRateMapper {
    @Mapping(target = "ceilingAmount", expression = "java(entity.getCeilingAmount())")
    CnapsRateDto toDto(CnapsRate entity);

    CnapsRate toEntity(CnapsRateDto dto);
}

