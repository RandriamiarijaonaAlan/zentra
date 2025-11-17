package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_entry")
@Data
@EqualsAndHashCode(callSuper = true)
public class TimeEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "check_in")
    private LocalDateTime checkIn;

    @Column(name = "check_out")
    private LocalDateTime checkOut;

    @Column(name = "hours_worked")
    private Double hoursWorked;

    @Column(name = "overtime_hours")
    private Double overtimeHours; // Heures supplémentaires calculées

    @Column(name = "late_minutes")
    private Integer lateMinutes; // Minutes de retard (arrivée après heure standard)

    @Column(name = "break_minutes")
    private Integer breakMinutes; // Minutes de pause déduites

    @Column(name = "entry_type", length = 50)
    private String entryType; // MANUAL, BADGE, MOBILE

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

}

