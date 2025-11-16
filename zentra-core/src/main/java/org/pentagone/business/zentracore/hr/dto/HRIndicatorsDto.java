package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class HRIndicatorsDto {
    private long totalEmployees;
    private Map<String, Long> employeesByGender;
    private long employeesByDepartmentCount; // placeholder if needed
    private double averageAge;
    private double averageSeniority;
    private double turnoverRate;
    private double absenteeismRate;
    private List<EmployeeDto> contractEndingSoon;
    private List<EmployeeDto> unclaimedLeaves;
}
