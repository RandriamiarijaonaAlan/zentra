package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.hr.entity.SkillLevel;
import org.pentagone.business.zentracore.hr.repository.SkillLevelRepository;
import org.pentagone.business.zentracore.hr.service.SkillLevelService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SkillLevelServiceImpl implements SkillLevelService {

    private final SkillLevelRepository skillLevelRepository;

    public SkillLevelServiceImpl(SkillLevelRepository skillLevelRepository) {
        this.skillLevelRepository = skillLevelRepository;
    }

    @Override
    public List<SkillLevel> findAll() {
        return skillLevelRepository.findAll();
    }
}

