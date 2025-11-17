package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.AttendanceReportDTO;
import org.pentagone.business.zentracore.hr.dto.TimeEntryDto;
import org.pentagone.business.zentracore.hr.service.TimeAttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/attendance")
public class TimeAttendanceController {

    private final TimeAttendanceService service;

    public TimeAttendanceController(TimeAttendanceService service) {
        this.service = service;
    }

    @PostMapping("/check-in")
    public ResponseEntity<TimeEntryDto> checkIn(@RequestParam Long employeeId,
                                                @RequestParam(required = false, defaultValue = "MANUAL") String type) {
        TimeEntryDto dto = service.checkIn(employeeId, type, LocalDateTime.now());
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PostMapping("/check-out")
    public ResponseEntity<TimeEntryDto> checkOut(@RequestParam Long employeeId) {
        TimeEntryDto dto = service.checkOut(employeeId, LocalDateTime.now());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/daily")
    public ResponseEntity<List<TimeEntryDto>> daily(@RequestParam Long employeeId,
                                                    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getDailyEntries(employeeId, date));
    }

    @GetMapping("/report")
    public ResponseEntity<AttendanceReportDTO> report(@RequestParam(required = false) Long employeeId,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(service.getReport(employeeId, start, end));
    }

    @GetMapping(value = "/report/export", produces = "text/csv")
    public ResponseEntity<String> exportReport(@RequestParam(required = false) Long employeeId,
                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        AttendanceReportDTO report = service.getReport(employeeId, start, end);
        StringBuilder sb = new StringBuilder();
        sb.append("employeeId,employeeName,startDate,endDate,totalHours,totalOvertime,totalLateMinutes,totalBreakMinutes\n");
        sb.append(report.getEmployeeId() == null ? "" : report.getEmployeeId())
                .append(',').append(report.getEmployeeName() == null ? "" : report.getEmployeeName())
                .append(',').append(report.getStartDate())
                .append(',').append(report.getEndDate())
                .append(',').append(report.getTotalHours())
                .append(',').append(report.getTotalOvertime())
                .append(',').append(report.getTotalLateMinutes())
                .append(',').append(report.getTotalBreakMinutes())
                .append('\n');
        sb.append("id,date,checkIn,checkOut,hoursWorked,overtime,lateMinutes,breakMinutes,type,note\n");
        report.getEntries().forEach(e -> sb.append(e.getId())
                .append(',').append(e.getEntryDate())
                .append(',').append(e.getCheckIn())
                .append(',').append(e.getCheckOut())
                .append(',').append(e.getHoursWorked())
                .append(',').append(e.getOvertimeHours())
                .append(',').append(e.getLateMinutes())
                .append(',').append(e.getBreakMinutes())
                .append(',').append(e.getEntryType())
                .append(',').append(e.getNote() == null ? "" : e.getNote().replace(',', ';'))
                .append('\n'));
        return ResponseEntity.ok(sb.toString());
    }
}
