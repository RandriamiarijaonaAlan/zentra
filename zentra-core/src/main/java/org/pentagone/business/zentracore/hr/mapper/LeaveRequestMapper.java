package org.pentagone.business.zentracore.hr.mapper;

import org.pentagone.business.zentracore.hr.dto.LeaveRequestDto;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest;
import org.springframework.stereotype.Component;

@Component
public class LeaveRequestMapper {
    public LeaveRequestDto toDto(LeaveRequest entity) {
        if (entity == null) return null;
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployee().getId());
        dto.setEmployeeName(entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName());
        dto.setLeaveTypeId(entity.getLeaveType().getId());
        dto.setLeaveTypeName(entity.getLeaveType().getName());
        dto.setLeaveTypeColor(entity.getLeaveType().getColor());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setDaysRequested(entity.getDaysRequested());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        dto.setApprovedDate(entity.getApprovedDate());
        dto.setApprovalComment(entity.getApprovalComment());
        dto.setIsHalfDayStart(entity.getIsHalfDayStart());
        dto.setIsHalfDayEnd(entity.getIsHalfDayEnd());
        dto.setEmergencyContact(entity.getEmergencyContact());
        if (entity.getApprovedBy() != null) {
            dto.setApprovedById(entity.getApprovedBy().getId());
            dto.setApprovedByName(entity.getApprovedBy().getFirstName() + " " + entity.getApprovedBy().getLastName());
        }
        return dto;
    }
}
