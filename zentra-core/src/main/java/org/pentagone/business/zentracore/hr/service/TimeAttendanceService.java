package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.AttendanceReportDTO;
import org.pentagone.business.zentracore.hr.dto.TimeEntryDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TimeAttendanceService {
    TimeEntryDto checkIn(Long employeeId, String entryType, LocalDateTime when);
    TimeEntryDto checkOut(Long employeeId, LocalDateTime when);
    List<TimeEntryDto> getDailyEntries(Long employeeId, LocalDate date);
    AttendanceReportDTO getReport(Long employeeId, LocalDate start, LocalDate end);
}
