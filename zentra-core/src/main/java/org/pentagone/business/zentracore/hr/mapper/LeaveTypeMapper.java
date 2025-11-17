package org.pentagone.business.zentracore.hr.mapper;

import org.pentagone.business.zentracore.hr.dto.LeaveTypeDto;
import org.pentagone.business.zentracore.hr.entity.LeaveType;
import org.springframework.stereotype.Component;

@Component
public class LeaveTypeMapper {

    public LeaveTypeDto toDto(LeaveType entity) {
        if (entity == null) return null;

        LeaveTypeDto dto = new LeaveTypeDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIsPaid(entity.getIsPaid());
        dto.setMaxDaysPerYear(entity.getMaxDaysPerYear());
        dto.setRequiresApproval(entity.getRequiresApproval());
        dto.setAdvanceNoticeDays(entity.getAdvanceNoticeDays());
        dto.setIsActive(entity.getIsActive());
        dto.setColor(entity.getColor());
        dto.setMaxConcurrentRequests(entity.getMaxConcurrentRequests());

        return dto;
    }

    public LeaveType toEntity(LeaveTypeDto dto) {
        if (dto == null) return null;

        LeaveType entity = new LeaveType();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setIsPaid(dto.getIsPaid());
        entity.setMaxDaysPerYear(dto.getMaxDaysPerYear());
        entity.setRequiresApproval(dto.getRequiresApproval());
        entity.setAdvanceNoticeDays(dto.getAdvanceNoticeDays());
        entity.setIsActive(dto.getIsActive());
        entity.setColor(dto.getColor());
        entity.setMaxConcurrentRequests(dto.getMaxConcurrentRequests());

        return entity;
    }
}
