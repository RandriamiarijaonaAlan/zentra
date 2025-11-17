package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TimeEntryDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate entryDate;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Double hoursWorked;
    private Double overtimeHours;
    private Integer lateMinutes;
    private Integer breakMinutes;
    private String entryType;
    private String note;
}
