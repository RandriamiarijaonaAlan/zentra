package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pentagone.business.zentracore.hr.dto.JobDto;
import org.pentagone.business.zentracore.hr.entity.Job;

@Mapper(componentModel = "spring")
public interface JobMapper {
    @Mapping(target = "departmentId", source = "department.id")
    JobDto toDto(Job entity);
}

