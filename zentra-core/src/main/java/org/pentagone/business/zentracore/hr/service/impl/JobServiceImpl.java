package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.JobDto;
import org.pentagone.business.zentracore.hr.mapper.JobMapper;
import org.pentagone.business.zentracore.hr.repository.JobRepository;
import org.pentagone.business.zentracore.hr.service.JobService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobMapper jobMapper;

    public JobServiceImpl(JobRepository jobRepository, JobMapper jobMapper) {
        this.jobRepository = jobRepository;
        this.jobMapper = jobMapper;
    }

    @Override
    public List<JobDto> getAllJobs() {
        return jobRepository.findAll().stream().map(jobMapper::toDto).toList();
    }

    @Override
    public JobDto getJobById(Long id) {
        return jobRepository.findById(id)
                .map(jobMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with id: " + id));
    }

    @Override
    public List<JobDto> getJobsByDepartment(Long departmentId) {
        return jobRepository.findByDepartmentId(departmentId).stream().map(jobMapper::toDto).toList();
    }

    @Override
    public List<JobDto> searchJobsByTitle(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title).stream().map(jobMapper::toDto).toList();
    }
}

