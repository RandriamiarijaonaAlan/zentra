package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.entity.SkillLevel;
import org.pentagone.business.zentracore.hr.service.SkillLevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/skill-levels")
public class SkillLevelController {

    private final SkillLevelService skillLevelService;

    public SkillLevelController(SkillLevelService skillLevelService) {
        this.skillLevelService = skillLevelService;
    }

    @GetMapping
    public ResponseEntity<List<SkillLevel>> findAll() {
        return ResponseEntity.ok(skillLevelService.findAll());
    }
}

