package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.EmployeeDto;
import org.pentagone.business.zentracore.hr.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
public class ReferenceController {

    private final EmployeeService employeeService;

    public ReferenceController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // liste des managers (pour l'instant: tous les employés, vous pourrez filtrer par rôle/grade plus tard)
    @GetMapping("/employees/managers")
    public ResponseEntity<List<EmployeeDto>> listManagers() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // TODO: si vous avez une entité Service/Position, exposez-les ici. Pour éviter 500 côté front, on renvoie une liste vide.
    @GetMapping("/services")
    public ResponseEntity<List<Object>> listServices() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/positions")
    public ResponseEntity<List<Object>> listPositions() {
        return ResponseEntity.ok(List.of());
    }
}

