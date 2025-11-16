package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.LeaveBalanceDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeLeaveOverviewDto;

import java.math.BigDecimal;
import java.util.List;

public interface LeaveBalanceService {
    LeaveBalanceDto createLeaveBalance(LeaveBalanceDto balanceDto);
    LeaveBalanceDto updateLeaveBalance(LeaveBalanceDto balanceDto);
    LeaveBalanceDto getLeaveBalanceById(Long id);
    List<LeaveBalanceDto> getEmployeeLeaveBalances(Long employeeId, Integer year);
    List<LeaveBalanceDto> getAllLeaveBalances(Integer year);

    EmployeeLeaveOverviewDto getEmployeeLeaveOverview(Long employeeId);

    void initializeEmployeeBalances(Long employeeId, Integer year);
    void updateBalanceAfterLeaveRequest(Long employeeId, Long leaveTypeId, Integer year, BigDecimal days, boolean isApproved);

    List<LeaveBalanceDto> getExpiringBalances(int daysBeforeExpiry);

    void carryOverBalances(Integer fromYear, Integer toYear);
}
