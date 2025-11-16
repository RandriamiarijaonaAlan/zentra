package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class EmployeeLeaveOverviewDto {
    private Long employeeId;
    private String employeeName;
    private Integer currentYear;
    private List<LeaveBalanceDto> leaveBalances;
    private List<LeaveRequestDto> recentRequests;
    private List<LeaveRequestDto> upcomingLeaves;
}
