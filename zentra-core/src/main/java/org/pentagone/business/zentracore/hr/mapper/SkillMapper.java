package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.pentagone.business.zentracore.hr.dto.SkillDto;
import org.pentagone.business.zentracore.hr.entity.Skill;

@Mapper(componentModel = "spring")
public interface SkillMapper {
    Skill toEntity(SkillDto dto);
    SkillDto toDto(Skill entity);
}

