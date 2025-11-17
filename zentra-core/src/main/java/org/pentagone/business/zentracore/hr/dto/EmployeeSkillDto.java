package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeSkillDto {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String skillName;
    private String category;
    private Integer level;
    private Integer targetLevel;
    private String evaluationMethod;
    private LocalDate lastEvaluationDate;
    private Double yearsExperience;
}

