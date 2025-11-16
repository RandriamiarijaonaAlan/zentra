package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.TrainingDto;
import org.pentagone.business.zentracore.hr.entity.EmployeeSkill;
import org.pentagone.business.zentracore.hr.entity.Skill;
import org.pentagone.business.zentracore.hr.entity.Training;
import org.pentagone.business.zentracore.hr.repository.EmployeeSkillRepository;
import org.pentagone.business.zentracore.hr.repository.SkillRepository;
import org.pentagone.business.zentracore.hr.repository.TrainingRepository;
import org.pentagone.business.zentracore.hr.service.TrainingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrainingServiceImpl implements TrainingService {

    private final TrainingRepository trainingRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public TrainingServiceImpl(TrainingRepository trainingRepository,
                               SkillRepository skillRepository,
                               EmployeeSkillRepository employeeSkillRepository) {
        this.trainingRepository = trainingRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    private void validate(Training training) {
        if (training.getTitle() == null || training.getTitle().isBlank())
            throw new IllegalArgumentException("Title is empty");
        if (training.getMaxLevelReached() == null || training.getMaxLevelReached() < 1 || training.getMaxLevelReached() > 4)
            throw new IllegalArgumentException("Invalid max level reached");
    }

    private TrainingDto toDto(Training training) {
        TrainingDto dto = new TrainingDto();
        dto.setId(training.getId());
        dto.setTitle(training.getTitle());
        dto.setDescription(training.getDescription());
        dto.setMaxLevelReached(training.getMaxLevelReached());
        if (training.getTargetSkills() != null) {
            dto.setTargetSkillIds(training.getTargetSkills().stream().map(Skill::getId).toList());
        }
        return dto;
    }

    private Training toEntity(TrainingDto dto) {
        Training training = new Training();
        training.setId(dto.getId());
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setMaxLevelReached(dto.getMaxLevelReached());
        if (dto.getTargetSkillIds() != null) {
            List<Skill> skills = skillRepository.findAllById(dto.getTargetSkillIds());
            training.setTargetSkills(skills);
        }
        return training;
    }

    @Override
    public TrainingDto create(TrainingDto dto) {
        Training training = toEntity(dto);
        if (training.getId() != null) throw new IllegalArgumentException("New Training cannot already have an ID");
        validate(training);
        return toDto(trainingRepository.save(training));
    }

    @Override
    public TrainingDto update(TrainingDto dto) {
        Training training = toEntity(dto);
        if (training.getId() == null || !trainingRepository.existsById(training.getId()))
            throw new EntityNotFoundException("Training not found");
        validate(training);
        return toDto(trainingRepository.save(training));
    }

    @Override
    public TrainingDto findById(Long id) {
        return trainingRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));
    }

    @Override
    public List<TrainingDto> findAll() {
        return trainingRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public void deleteById(Long id) {
        Training training = trainingRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Training not found"));
        trainingRepository.delete(training);
    }

    @Override
    public List<TrainingDto> suggestTrainingsForEmployee(Long employeeId) {
        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployeeId(employeeId);
        if (employeeSkills.isEmpty()) return List.of();

        // Collect skills needing improvement (targetLevel > level)
        Set<Long> neededSkillIds = employeeSkills.stream()
                .filter(es -> es.getTargetLevel() != null && es.getTargetLevel() > (es.getLevel() == null ? 0 : es.getLevel()))
                .map(es -> es.getSkill().getId())
                .collect(Collectors.toSet());

        if (neededSkillIds.isEmpty()) return List.of();

        // Fetch trainings targeting these skills
        List<Training> trainings = trainingRepository.findByTargetSkillsIdIn(neededSkillIds.stream().toList());

        // Filter trainings whose maxLevelReached satisfies at least one needed target gap
        List<Training> filtered = trainings.stream().filter(t -> {
            if (t.getTargetSkills() == null) return false;
            return t.getTargetSkills().stream().anyMatch(ts -> neededSkillIds.contains(ts.getId()));
        }).toList();

        return filtered.stream().map(this::toDto).toList();
    }
}

