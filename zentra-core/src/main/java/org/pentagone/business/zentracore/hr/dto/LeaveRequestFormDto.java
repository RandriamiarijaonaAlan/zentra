package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestFormDto {
    private Long id;
    private Long leaveTypeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private Boolean isHalfDayStart = false;
    private Boolean isHalfDayEnd = false;
    private String emergencyContact;
}
