package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.SkillDto;

import java.util.List;

public interface SkillService {
    SkillDto createSkill(SkillDto dto);
    SkillDto updateSkill(SkillDto dto);
    SkillDto getSkillById(Long id);
    List<SkillDto> getAllSkills();
    void deleteSkill(Long id);
    List<SkillDto> searchByName(String name);
    List<SkillDto> findByCategory(String category);
}

