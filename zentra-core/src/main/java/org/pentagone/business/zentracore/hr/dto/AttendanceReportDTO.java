package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceReportDTO {
    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalHours;
    private Double totalOvertime;
    private Integer totalLateMinutes;
    private Integer totalBreakMinutes;
    private List<TimeEntryDto> entries;
}
