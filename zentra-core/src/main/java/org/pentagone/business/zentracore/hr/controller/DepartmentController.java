package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.DepartmentDto;
import org.pentagone.business.zentracore.hr.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> list() {
        return ResponseEntity.ok(departmentService.getDepartments());
    }
}
