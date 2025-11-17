package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.CnapsRateDto;
import org.pentagone.business.zentracore.hr.dto.IrsaRateDto;
import org.pentagone.business.zentracore.hr.dto.OstieRateDto;
import org.pentagone.business.zentracore.hr.service.ContributionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contributions")
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(ContributionService contributionService) {
        this.contributionService = contributionService;
    }

    @GetMapping("/irsa")
    public ResponseEntity<List<IrsaRateDto>> getIrsaRates() {
        return ResponseEntity.ok(contributionService.getIrsaRates());
    }

    @PostMapping("/irsa")
    public ResponseEntity<IrsaRateDto> createIrsaRate(@RequestBody IrsaRateDto dto) {
        IrsaRateDto created = contributionService.createIrsaRate(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/irsa")
    public ResponseEntity<IrsaRateDto> updateIrsaRate(@RequestBody IrsaRateDto dto) {
        IrsaRateDto updated = contributionService.updateIrsaRate(dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/irsa/{id}")
    public ResponseEntity<Void> deleteIrsaRate(@PathVariable Long id) {
        contributionService.deleteIrsaRate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cnaps")
    public ResponseEntity<CnapsRateDto> getFirstCnapsRate() {
        return ResponseEntity.ok(contributionService.getFirstCnapsRate());
    }

    @PutMapping("/cnaps")
    public ResponseEntity<CnapsRateDto> updateCnapsRate(@RequestBody CnapsRateDto dto) {
        CnapsRateDto updated = contributionService.updateCnapsRate(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/ostie")
    public ResponseEntity<OstieRateDto> getFirstOstieRate() {
        return ResponseEntity.ok(contributionService.getFirstOstieRate());
    }

    @PutMapping("/ostie")
    public ResponseEntity<OstieRateDto> updateOstieRate(@RequestBody OstieRateDto dto) {
        OstieRateDto updated = contributionService.updateOstieRate(dto);
        return ResponseEntity.ok(updated);
    }
}

