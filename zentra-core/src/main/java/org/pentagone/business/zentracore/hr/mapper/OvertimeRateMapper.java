package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pentagone.business.zentracore.hr.dto.OvertimeRateDto;
import org.pentagone.business.zentracore.hr.entity.OvertimeRate;

@Mapper(componentModel = "spring")
public interface OvertimeRateMapper {
    OvertimeRateDto toDto(OvertimeRate entity);

    OvertimeRate toEntity(OvertimeRateDto dto);
}

