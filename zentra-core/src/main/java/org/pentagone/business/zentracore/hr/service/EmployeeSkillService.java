package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.EmployeeSkillDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeSkillHistoryDto;

import java.util.List;

public interface EmployeeSkillService {
    EmployeeSkillDto assignSkill(Long employeeId, Long skillId, Integer level, Integer targetLevel, String evaluationMethod);
    EmployeeSkillDto updateLevel(Long employeeSkillId, Integer newLevel, String evaluationMethod);
    List<EmployeeSkillDto> getSkillsByEmployee(Long employeeId);
    List<EmployeeSkillDto> getEmployeesBySkill(Long skillId);
    EmployeeSkillDto getByEmployeeAndSkill(Long employeeId, Long skillId);
    List<EmployeeSkillHistoryDto> getHistory(Long employeeSkillId);
    void deleteEmployeeSkill(Long employeeSkillId);
}

