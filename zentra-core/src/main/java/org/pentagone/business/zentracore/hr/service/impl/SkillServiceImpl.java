package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.SkillDto;
import org.pentagone.business.zentracore.hr.entity.Skill;
import org.pentagone.business.zentracore.hr.mapper.SkillMapper;
import org.pentagone.business.zentracore.hr.repository.SkillRepository;
import org.pentagone.business.zentracore.hr.service.SkillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final SkillMapper skillMapper;

    public SkillServiceImpl(SkillRepository skillRepository, SkillMapper skillMapper) {
        this.skillRepository = skillRepository;
        this.skillMapper = skillMapper;
    }

    private void validate(Skill skill) {
        if (skill.getName() == null || skill.getName().isBlank())
            throw new IllegalArgumentException("Name is empty");
    }

    @Override
    public SkillDto createSkill(SkillDto dto) {
        Skill skill = skillMapper.toEntity(dto);
        if (skill.getId() != null) throw new IllegalArgumentException("New Skill cannot already have an ID");
        validate(skill);
        return skillMapper.toDto(skillRepository.save(skill));
    }

    @Override
    public SkillDto updateSkill(SkillDto dto) {
        Skill skill = skillMapper.toEntity(dto);
        if (skill.getId() == null || !skillRepository.existsById(skill.getId()))
            throw new EntityNotFoundException("Skill not found");
        validate(skill);
        return skillMapper.toDto(skillRepository.save(skill));
    }

    @Override
    public SkillDto getSkillById(Long id) {
        return skillMapper.toDto(skillRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Skill not found")));
    }

    @Override
    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll().stream().map(skillMapper::toDto).toList();
    }

    @Override
    public void deleteSkill(Long id) {
        Skill skill = skillRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Skill not found"));
        skillRepository.delete(skill);
    }

    @Override
    public List<SkillDto> searchByName(String name) {
        return skillRepository.findByNameContainingIgnoreCase(name).stream().map(skillMapper::toDto).toList();
    }

    @Override
    public List<SkillDto> findByCategory(String category) {
        return skillRepository.findByCategoryIgnoreCase(category).stream().map(skillMapper::toDto).toList();
    }
}

