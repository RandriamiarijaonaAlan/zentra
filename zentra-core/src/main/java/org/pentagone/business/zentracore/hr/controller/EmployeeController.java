package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.EmployeeDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeStatisticsDto;
import org.pentagone.business.zentracore.hr.service.EmployeeService;
import org.pentagone.business.zentracore.hr.service.EmployeeStatisticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeStatisticsService employeeStatisticsService;

    public EmployeeController(EmployeeService employeeService, EmployeeStatisticsService employeeStatisticsService) {
        this.employeeService = employeeService;
        this.employeeStatisticsService = employeeStatisticsService;
    }

    @PostMapping
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto employeeDto) {
        EmployeeDto created = employeeService.createEmployee(employeeDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<EmployeeDto> updateEmployee(@RequestBody EmployeeDto employeeDto) {
        EmployeeDto updated = employeeService.updateEmployee(employeeDto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        EmployeeDto employee = employeeService.getEmployeeById(id);
        return new ResponseEntity<>(employee, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployeeById(@PathVariable Long id) {
        employeeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint pour obtenir les statistiques complètes des employés
     * @return EmployeeStatisticsDto avec tous les indicateurs RH
     */
    @GetMapping("/statistics")
    public ResponseEntity<EmployeeStatisticsDto> getEmployeeStatistics() {
        EmployeeStatisticsDto statistics = employeeStatisticsService.calculateEmployeeStatistics();
        return new ResponseEntity<>(statistics, HttpStatus.OK);
    }
}


