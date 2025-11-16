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

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TrainingServiceImpl implements TrainingService {

    private static class Score {
        final Training t;
        final int strong;
        final int partial;
        Score(Training t, int strong, int partial) {
            this.t = t;
            this.strong = strong;
            this.partial = partial;
        }
    }

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

        // Build maps for current and target levels per skill
        Map<Long, Integer> currentLevel = new HashMap<>();
        Map<Long, Integer> targetLevel = new HashMap<>();
        for (EmployeeSkill es : employeeSkills) {
            Long sid = es.getSkill().getId();
            currentLevel.put(sid, es.getLevel() == null ? 0 : es.getLevel());
            if (es.getTargetLevel() != null && es.getTargetLevel() > (es.getLevel() == null ? 0 : es.getLevel())) {
                targetLevel.put(sid, es.getTargetLevel());
            }
        }

        if (targetLevel.isEmpty()) return List.of();

        // Fetch trainings targeting at least one gap skill
        List<Long> gapSkillIds = targetLevel.keySet().stream().toList();
        List<Training> trainings = trainingRepository.findByTargetSkillsIdIn(gapSkillIds);

        // Score trainings: strong = can reach target; partial = improves but doesn't reach target
        List<Score> scored = trainings.stream()
                .map(t -> {
                    if (t.getTargetSkills() == null || t.getTargetSkills().isEmpty()) return new Score(t, 0, 0);
                    int strong = 0;
                    int partial = 0;
                    for (Skill s : t.getTargetSkills()) {
                        Long sid = s.getId();
                        if (!targetLevel.containsKey(sid)) continue; // not a gap skill
                        int cur = currentLevel.getOrDefault(sid, 0);
                        int tgt = targetLevel.get(sid);
                        int max = t.getMaxLevelReached() == null ? 0 : t.getMaxLevelReached();
                        if (max >= tgt) strong++;
                        else if (max > cur) partial++;
                    }
                    return new Score(t, strong, partial);
                })
                .filter(s -> s.strong > 0 || s.partial > 0)
                .sorted(Comparator
                        .comparingInt((Score s) -> s.strong).reversed()
                        .thenComparingInt(s -> s.partial).reversed()
                        .thenComparingInt(s -> s.t.getMaxLevelReached() == null ? 0 : s.t.getMaxLevelReached()).reversed()
                        .thenComparing(s -> s.t.getTitle(), String.CASE_INSENSITIVE_ORDER))
                .toList();

        return scored.stream().map(s -> toDto(s.t)).toList();
    }
}
