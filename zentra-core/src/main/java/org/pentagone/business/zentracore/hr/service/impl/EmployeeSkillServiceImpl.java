package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.EmployeeSkillDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeSkillHistoryDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.EmployeeSkill;
import org.pentagone.business.zentracore.hr.entity.EmployeeSkillHistory;
import org.pentagone.business.zentracore.hr.entity.Skill;
import org.pentagone.business.zentracore.hr.mapper.EmployeeSkillHistoryMapper;
import org.pentagone.business.zentracore.hr.mapper.EmployeeSkillMapper;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.EmployeeSkillHistoryRepository;
import org.pentagone.business.zentracore.hr.repository.EmployeeSkillRepository;
import org.pentagone.business.zentracore.hr.repository.SkillRepository;
import org.pentagone.business.zentracore.hr.service.EmployeeSkillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class EmployeeSkillServiceImpl implements EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillHistoryRepository historyRepository;
    private final EmployeeSkillMapper employeeSkillMapper;
    private final EmployeeSkillHistoryMapper historyMapper;

    public EmployeeSkillServiceImpl(EmployeeSkillRepository employeeSkillRepository,
                                    SkillRepository skillRepository,
                                    EmployeeRepository employeeRepository,
                                    EmployeeSkillHistoryRepository historyRepository,
                                    EmployeeSkillMapper employeeSkillMapper,
                                    EmployeeSkillHistoryMapper historyMapper) {
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.employeeRepository = employeeRepository;
        this.historyRepository = historyRepository;
        this.employeeSkillMapper = employeeSkillMapper;
        this.historyMapper = historyMapper;
    }

    private void validateLevel(Integer level) {
        if (level == null || level < 1 || level > 4) throw new IllegalArgumentException("Invalid level");
    }

    @Override
    public EmployeeSkillDto assignSkill(Long employeeId, Long skillId, Integer level, Integer targetLevel, String evaluationMethod) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        Skill skill = skillRepository.findById(skillId).orElseThrow(() -> new EntityNotFoundException("Skill not found"));
        validateLevel(level);
        if (targetLevel != null) validateLevel(targetLevel);
        if (employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId).isPresent())
            throw new IllegalArgumentException("Employee already has this skill");

        EmployeeSkill es = new EmployeeSkill();
        es.setEmployee(employee);
        es.setSkill(skill);
        es.setLevel(level);
        es.setTargetLevel(targetLevel);
        es.setEvaluationMethod(evaluationMethod);
        es.setLastEvaluationDate(LocalDate.now());
        EmployeeSkill saved = employeeSkillRepository.save(es);

        EmployeeSkillHistory hist = new EmployeeSkillHistory();
        hist.setEmployeeSkill(saved);
        hist.setPreviousLevel(null);
        hist.setNewLevel(level);
        hist.setEvaluationMethod(evaluationMethod);
        hist.setEvaluationDate(LocalDate.now());
        historyRepository.save(hist);

        return employeeSkillMapper.toDto(saved);
    }

    @Override
    public EmployeeSkillDto updateLevel(Long employeeSkillId, Integer newLevel, String evaluationMethod) {
        EmployeeSkill es = employeeSkillRepository.findById(employeeSkillId).orElseThrow(() -> new EntityNotFoundException("EmployeeSkill not found"));
        validateLevel(newLevel);
        Integer previous = es.getLevel();
        es.setLevel(newLevel);
        es.setEvaluationMethod(evaluationMethod);
        es.setLastEvaluationDate(LocalDate.now());
        EmployeeSkill saved = employeeSkillRepository.save(es);

        EmployeeSkillHistory hist = new EmployeeSkillHistory();
        hist.setEmployeeSkill(saved);
        hist.setPreviousLevel(previous);
        hist.setNewLevel(newLevel);
        hist.setEvaluationMethod(evaluationMethod);
        hist.setEvaluationDate(LocalDate.now());
        historyRepository.save(hist);

        return employeeSkillMapper.toDto(saved);
    }

    @Override
    public List<EmployeeSkillDto> getSkillsByEmployee(Long employeeId) {
        return employeeSkillRepository.findByEmployeeId(employeeId).stream().map(employeeSkillMapper::toDto).toList();
    }

    @Override
    public List<EmployeeSkillDto> getEmployeesBySkill(Long skillId) {
        return employeeSkillRepository.findBySkillId(skillId).stream().map(employeeSkillMapper::toDto).toList();
    }

    @Override
    public EmployeeSkillDto getByEmployeeAndSkill(Long employeeId, Long skillId) {
        EmployeeSkill es = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId).orElseThrow(() -> new EntityNotFoundException("EmployeeSkill not found"));
        return employeeSkillMapper.toDto(es);
    }

    @Override
    public List<EmployeeSkillHistoryDto> getHistory(Long employeeSkillId) {
        return historyRepository.findByEmployeeSkillIdOrderByEvaluationDateDesc(employeeSkillId).stream().map(historyMapper::toDto).toList();
    }

    @Override
    public void deleteEmployeeSkill(Long employeeSkillId) {
        EmployeeSkill es = employeeSkillRepository.findById(employeeSkillId).orElseThrow(() -> new EntityNotFoundException("EmployeeSkill not found"));
        employeeSkillRepository.delete(es);
    }
}

