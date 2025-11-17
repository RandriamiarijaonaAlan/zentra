package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.pentagone.business.zentracore.hr.dto.IrsaRateDto;
import org.pentagone.business.zentracore.hr.entity.IrsaRate;

@Mapper(componentModel = "spring")
public interface IrsaRateMapper {
    IrsaRateDto toDto(IrsaRate entity);

    IrsaRate toEntity(IrsaRateDto dto);
}

