package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.JobDto;

import java.util.List;

public interface JobService {
    List<JobDto> getAllJobs();
    JobDto getJobById(Long id);
    List<JobDto> getJobsByDepartment(Long departmentId);
    List<JobDto> searchJobsByTitle(String title);
}

