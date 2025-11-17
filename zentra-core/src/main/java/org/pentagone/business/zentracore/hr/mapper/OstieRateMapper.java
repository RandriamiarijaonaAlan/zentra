package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.pentagone.business.zentracore.hr.dto.OstieRateDto;
import org.pentagone.business.zentracore.hr.entity.OstieRate;

@Mapper(componentModel = "spring")
public interface OstieRateMapper {
    OstieRateDto toDto(OstieRate entity);

    OstieRate toEntity(OstieRateDto dto);
}

