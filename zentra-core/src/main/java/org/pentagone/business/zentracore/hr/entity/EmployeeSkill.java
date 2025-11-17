package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "employee_skill")
@Data
@EqualsAndHashCode(callSuper = true)
public class EmployeeSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "level")
    private Integer level; // Current level (1-4)

    // Optional target level for development plans
    @Column(name = "target_level")
    private Integer targetLevel; // (1-4)

    @Column(name = "evaluation_method", length = 30)
    private String evaluationMethod; // SELF, MANAGER, TEST

    @Column(name = "last_evaluation_date")
    private LocalDate lastEvaluationDate;

    @Column(name = "years_experience")
    private Double yearsExperience;
}
