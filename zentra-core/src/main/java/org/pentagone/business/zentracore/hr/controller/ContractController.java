package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.ContractDto;
import org.pentagone.business.zentracore.hr.service.ContractService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    public ResponseEntity<ContractDto> create(@RequestBody ContractDto dto) {
        return new ResponseEntity<>(contractService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<ContractDto> update(@RequestBody ContractDto dto) {
        return ResponseEntity.ok(contractService.update(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ContractDto>> listByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(contractService.listByEmployee(employeeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

