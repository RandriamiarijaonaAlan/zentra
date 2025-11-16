package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.JobDto;
import org.pentagone.business.zentracore.hr.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<JobDto>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<JobDto>> getJobsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(jobService.getJobsByDepartment(departmentId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobDto>> searchJobs(@RequestParam("title") String title) {
        return ResponseEntity.ok(jobService.searchJobsByTitle(title));
    }
}

