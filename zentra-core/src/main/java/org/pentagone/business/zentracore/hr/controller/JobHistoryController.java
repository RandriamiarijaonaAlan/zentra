package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.JobHistoryDto;
import org.pentagone.business.zentracore.hr.service.JobHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-histories")
public class JobHistoryController {

    private final JobHistoryService jobHistoryService;

    public JobHistoryController(JobHistoryService jobHistoryService) {
        this.jobHistoryService = jobHistoryService;
    }

    @PostMapping
    public ResponseEntity<JobHistoryDto> create(@RequestBody JobHistoryDto dto) {
        return new ResponseEntity<>(jobHistoryService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<JobHistoryDto> update(@RequestBody JobHistoryDto dto) {
        return ResponseEntity.ok(jobHistoryService.update(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobHistoryDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(jobHistoryService.getById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<JobHistoryDto>> listByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(jobHistoryService.listByEmployee(employeeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobHistoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

