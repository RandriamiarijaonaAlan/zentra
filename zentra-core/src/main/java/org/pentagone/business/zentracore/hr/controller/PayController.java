package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.BonusDto;
import org.pentagone.business.zentracore.hr.dto.PayStubDto;
import org.pentagone.business.zentracore.hr.dto.SalaryAdvanceDto;
import org.pentagone.business.zentracore.hr.service.PayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/pay")
public class PayController {

    private final PayService payService;

    public PayController(PayService payService) {
        this.payService = payService;
    }

    /**
     * Génère une fiche de paie pour un employé et un mois donné
     * Génère aussi le PDF automatiquement
     */
    @PostMapping("/paystub/generate")
    public ResponseEntity<PayStubDto> generatePayStub(
            @RequestParam Long employeeId,
            @RequestParam String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth);
        PayStubDto payStub = payService.generatePayStubByEmployeeIdAndYearMonth(employeeId, ym);
        return ResponseEntity.ok(payStub);
    }

    /**
     * Récupère une fiche de paie existante
     */
    @GetMapping("/paystub")
    public ResponseEntity<PayStubDto> getPayStub(
            @RequestParam Long employeeId,
            @RequestParam String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth);
        PayStubDto payStub = payService.getPayStubByEmployeeIdAndYearMonth(employeeId, ym);
        return ResponseEntity.ok(payStub);
    }

    /**
     * Récupère tous les bonus
     */
    @GetMapping("/bonus")
    public ResponseEntity<java.util.List<BonusDto>> getAllBonuses() {
        java.util.List<BonusDto> bonuses = payService.getAllBonuses();
        return ResponseEntity.ok(bonuses);
    }

    /**
     * Crée un bonus pour un employé
     */
    @PostMapping("/bonus")
    public ResponseEntity<BonusDto> createBonus(@RequestBody BonusDto bonusDto) {
        BonusDto created = payService.createBonus(bonusDto);
        return ResponseEntity.ok(created);
    }

    /**
     * Récupère toutes les avances sur salaire
     */
    @GetMapping("/salary-advance")
    public ResponseEntity<java.util.List<SalaryAdvanceDto>> getAllSalaryAdvances() {
        java.util.List<SalaryAdvanceDto> advances = payService.getAllSalaryAdvances();
        return ResponseEntity.ok(advances);
    }

    /**
     * Crée une demande d'avance sur salaire
     */
    @PostMapping("/salary-advance")
    public ResponseEntity<SalaryAdvanceDto> createSalaryAdvance(@RequestBody SalaryAdvanceDto salaryAdvanceDto) {
        SalaryAdvanceDto created = payService.createSalaryAdvance(salaryAdvanceDto);
        return ResponseEntity.ok(created);
    }

    /**
     * Valide/approuve une demande d'avance sur salaire
     */
    @PutMapping("/salary-advance/{id}/validate")
    public ResponseEntity<SalaryAdvanceDto> validateSalaryAdvance(@PathVariable Long id) {
        SalaryAdvanceDto validated = payService.validateSalaryAdvance(id);
        return ResponseEntity.ok(validated);
    }

    /**
     * Rejette une demande d'avance sur salaire
     */
    @PutMapping("/salary-advance/{id}/reject")
    public ResponseEntity<SalaryAdvanceDto> rejectSalaryAdvance(@PathVariable Long id) {
        SalaryAdvanceDto rejected = payService.rejectSalaryAdvance(id);
        return ResponseEntity.ok(rejected);
    }
}

