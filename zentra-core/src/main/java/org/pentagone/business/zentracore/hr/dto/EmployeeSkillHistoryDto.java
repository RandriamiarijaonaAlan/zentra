package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeSkillHistoryDto {
    private Long id;
    private Long employeeSkillId;
    private Integer previousLevel;
    private Integer newLevel;
    private String evaluationMethod;
    private LocalDate evaluationDate;
}

