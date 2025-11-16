package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "employee_skill_history")
@Data
@EqualsAndHashCode(callSuper = true)
public class EmployeeSkillHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_skill_id", nullable = false)
    private EmployeeSkill employeeSkill;

    @Column(name = "previous_level")
    private Integer previousLevel;

    @Column(name = "new_level")
    private Integer newLevel;

    @Column(name = "evaluation_method", length = 30)
    private String evaluationMethod;

    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;
}

