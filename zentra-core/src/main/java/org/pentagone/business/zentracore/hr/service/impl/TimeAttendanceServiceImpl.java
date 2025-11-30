package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.config.AttendanceProperties;
import org.pentagone.business.zentracore.hr.dto.AttendanceReportDTO;
import org.pentagone.business.zentracore.hr.dto.TimeEntryDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.TimeEntry;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.TimeEntryRepository;
import org.pentagone.business.zentracore.hr.service.TimeAttendanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TimeAttendanceServiceImpl implements TimeAttendanceService {

    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceProperties attendanceProperties;

    public TimeAttendanceServiceImpl(TimeEntryRepository timeEntryRepository,
                                     EmployeeRepository employeeRepository,
                                     AttendanceProperties attendanceProperties) {
        this.timeEntryRepository = timeEntryRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceProperties = attendanceProperties;
    }

    @Override
    public TimeEntryDto checkIn(Long employeeId, String entryType, LocalDateTime when) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable: " + employeeId));

        LocalDate date = when.toLocalDate();
        // Empêcher double check-in sans check-out
        List<TimeEntry> existing = timeEntryRepository.findByEmployeeIdAndEntryDate(employeeId, date);
        boolean hasOpen = existing.stream().anyMatch(e -> e.getCheckIn() != null && e.getCheckOut() == null);
        if (hasOpen) {
            throw new IllegalStateException("Une session de travail est déjà ouverte pour cet employé.");
        }
        TimeEntry entry = new TimeEntry();
        entry.setEmployee(employee);
        entry.setEntryDate(date);
        entry.setCheckIn(when);
        entry.setEntryType(entryType);

        // Calcul retard basé sur l'heure configurée
        LocalTime standardStart = attendanceProperties.getWorkdayStart();
        if (when.toLocalTime().isAfter(standardStart)) {
            int late = (int) Duration.between(standardStart, when.toLocalTime()).toMinutes();
            entry.setLateMinutes(late);
        } else {
            entry.setLateMinutes(0);
        }

        TimeEntry saved = timeEntryRepository.save(entry);
        return toDto(saved);
    }

    @Override
    public TimeEntryDto checkOut(Long employeeId, LocalDateTime when) {
        LocalDate date = when.toLocalDate();
        List<TimeEntry> existing = timeEntryRepository.findByEmployeeIdAndEntryDate(employeeId, date);
        TimeEntry open = existing.stream()
                .filter(e -> e.getCheckIn() != null && e.getCheckOut() == null)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Aucune session ouverte à clôturer."));

        open.setCheckOut(when);
        long totalMinutes = Duration.between(open.getCheckIn(), open.getCheckOut()).toMinutes();

        // Pause automatique si journée dépasse le seuil configuré
        int breakThresholdMinutes = attendanceProperties.getBreakThresholdHours() * 60;
        int breakMinutes = totalMinutes > breakThresholdMinutes ? attendanceProperties.getBreakMinutes() : 0;
        open.setBreakMinutes(breakMinutes);

        int worked = (int) (totalMinutes - breakMinutes);
        double hoursWorked = worked / 60.0;
        open.setHoursWorked(hoursWorked);

        double standardDayHours = attendanceProperties.getWorkdayHours();
        double overtime = Math.max(0, hoursWorked - standardDayHours);
        open.setOvertimeHours(overtime);

        TimeEntry saved = timeEntryRepository.save(open);
        return toDto(saved);
    }

    @Override
    public List<TimeEntryDto> getDailyEntries(Long employeeId, LocalDate date) {
        return timeEntryRepository.findByEmployeeIdAndEntryDate(employeeId, date).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceReportDTO getReport(Long employeeId, LocalDate start, LocalDate end) {
        List<TimeEntry> entries = timeEntryRepository.findRange(employeeId, start, end);
        AttendanceReportDTO report = new AttendanceReportDTO();
        report.setStartDate(start);
        report.setEndDate(end);
        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new EntityNotFoundException("Employé introuvable: " + employeeId));
            report.setEmployeeId(employeeId);
            report.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        }
        double totalHours = entries.stream().mapToDouble(e -> e.getHoursWorked() == null ? 0.0 : e.getHoursWorked()).sum();
        double totalOvertime = entries.stream().mapToDouble(e -> e.getOvertimeHours() == null ? 0.0 : e.getOvertimeHours()).sum();
        int totalLate = entries.stream().mapToInt(e -> e.getLateMinutes() == null ? 0 : e.getLateMinutes()).sum();
        int totalBreak = entries.stream().mapToInt(e -> e.getBreakMinutes() == null ? 0 : e.getBreakMinutes()).sum();
        report.setTotalHours(totalHours);
        report.setTotalOvertime(totalOvertime);
        report.setTotalLateMinutes(totalLate);
        report.setTotalBreakMinutes(totalBreak);
        report.setEntries(entries.stream().map(this::toDto).toList());
        return report;
    }

    private TimeEntryDto toDto(TimeEntry e) {
        TimeEntryDto dto = new TimeEntryDto();
        dto.setId(e.getId());
        dto.setEmployeeId(e.getEmployee().getId());
        dto.setEmployeeName(e.getEmployee().getFirstName() + " " + e.getEmployee().getLastName());
        dto.setEntryDate(e.getEntryDate());
        dto.setCheckIn(e.getCheckIn());
        dto.setCheckOut(e.getCheckOut());
        dto.setHoursWorked(e.getHoursWorked());
        dto.setOvertimeHours(e.getOvertimeHours());
        dto.setLateMinutes(e.getLateMinutes());
        dto.setBreakMinutes(e.getBreakMinutes());
        dto.setEntryType(e.getEntryType());
        dto.setNote(e.getNote());
        return dto;
    }
}
