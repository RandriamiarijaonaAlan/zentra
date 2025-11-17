package org.pentagone.business.zentracore.hr.mapper;

import org.pentagone.business.zentracore.hr.dto.LeaveBalanceDto;
import org.pentagone.business.zentracore.hr.entity.LeaveBalance;
import org.springframework.stereotype.Component;

@Component
public class LeaveBalanceMapper {

    public LeaveBalanceDto toDto(LeaveBalance entity) {
        if (entity == null) return null;

        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployee().getId());
        dto.setEmployeeName(entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName());
        dto.setLeaveTypeId(entity.getLeaveType().getId());
        dto.setLeaveTypeName(entity.getLeaveType().getName());
        dto.setYear(entity.getYear());
        dto.setAllocatedDays(entity.getAllocatedDays());
        dto.setUsedDays(entity.getUsedDays());
        dto.setPendingDays(entity.getPendingDays());
        dto.setCarriedOverDays(entity.getCarriedOverDays());
        dto.setRemainingDays(entity.getRemainingDays());
        dto.setExpiresOn(entity.getExpiresOn());

        return dto;
    }
}
