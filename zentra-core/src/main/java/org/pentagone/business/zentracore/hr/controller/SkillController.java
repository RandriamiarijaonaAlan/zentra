package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.SkillDto;
import org.pentagone.business.zentracore.hr.service.SkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @PostMapping
    public ResponseEntity<SkillDto> create(@RequestBody SkillDto dto) {
        return new ResponseEntity<>(skillService.createSkill(dto), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<SkillDto> update(@RequestBody SkillDto dto) {
        return ResponseEntity.ok(skillService.updateSkill(dto));
    }

    @GetMapping
    public ResponseEntity<List<SkillDto>> findAll(@RequestParam(value = "name", required = false) String name,
                                                  @RequestParam(value = "category", required = false) String category) {
        if (name != null && !name.isBlank()) return ResponseEntity.ok(skillService.searchByName(name));
        if (category != null && !category.isBlank()) return ResponseEntity.ok(skillService.findByCategory(category));
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SkillDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }
}

