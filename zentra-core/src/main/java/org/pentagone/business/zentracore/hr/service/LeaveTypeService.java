package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.LeaveTypeDto;

import java.util.List;

public interface LeaveTypeService {
    LeaveTypeDto createLeaveType(LeaveTypeDto leaveTypeDto);
    LeaveTypeDto updateLeaveType(LeaveTypeDto leaveTypeDto);
    LeaveTypeDto getLeaveTypeById(Long id);
    List<LeaveTypeDto> getAllLeaveTypes();
    List<LeaveTypeDto> getActiveLeaveTypes();
    void deleteLeaveType(Long id);
    void activateLeaveType(Long id);
    void deactivateLeaveType(Long id);
}
