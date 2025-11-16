package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.EmployeeSkillDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeSkillHistoryDto;
import org.pentagone.business.zentracore.hr.service.EmployeeSkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee-skills")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    public EmployeeSkillController(EmployeeSkillService employeeSkillService) {
        this.employeeSkillService = employeeSkillService;
    }

    @PostMapping
    public ResponseEntity<EmployeeSkillDto> assign(@RequestParam Long employeeId,
                                                   @RequestParam Long skillId,
                                                   @RequestParam Integer level,
                                                   @RequestParam(required = false) Integer targetLevel,
                                                   @RequestParam(required = false) String evaluationMethod) {
        return new ResponseEntity<>(employeeSkillService.assignSkill(employeeId, skillId, level, targetLevel, evaluationMethod), HttpStatus.CREATED);
    }

    @PatchMapping("/{employeeSkillId}/level")
    public ResponseEntity<EmployeeSkillDto> updateLevel(@PathVariable Long employeeSkillId,
                                                        @RequestParam Integer newLevel,
                                                        @RequestParam(required = false) String evaluationMethod) {
        return ResponseEntity.ok(employeeSkillService.updateLevel(employeeSkillId, newLevel, evaluationMethod));
    }

    @GetMapping("/by-employee/{employeeId}")
    public ResponseEntity<List<EmployeeSkillDto>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(employeeSkillService.getSkillsByEmployee(employeeId));
    }

    @GetMapping("/by-skill/{skillId}")
    public ResponseEntity<List<EmployeeSkillDto>> getBySkill(@PathVariable Long skillId) {
        return ResponseEntity.ok(employeeSkillService.getEmployeesBySkill(skillId));
    }

    @GetMapping("/search")
    public ResponseEntity<EmployeeSkillDto> getByEmployeeAndSkill(@RequestParam Long employeeId, @RequestParam Long skillId) {
        return ResponseEntity.ok(employeeSkillService.getByEmployeeAndSkill(employeeId, skillId));
    }

    @GetMapping("/{employeeSkillId}/history")
    public ResponseEntity<List<EmployeeSkillHistoryDto>> history(@PathVariable Long employeeSkillId) {
        return ResponseEntity.ok(employeeSkillService.getHistory(employeeSkillId));
    }

    @DeleteMapping("/{employeeSkillId}")
    public ResponseEntity<Void> delete(@PathVariable Long employeeSkillId) {
        employeeSkillService.deleteEmployeeSkill(employeeSkillId);
        return ResponseEntity.noContent().build();
    }
}
