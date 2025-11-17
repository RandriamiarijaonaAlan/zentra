package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.JobHistoryDto;
import org.pentagone.business.zentracore.hr.entity.Department;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.Job;
import org.pentagone.business.zentracore.hr.entity.JobHistory;
import org.pentagone.business.zentracore.hr.repository.DepartmentRepository;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.JobHistoryRepository;
import org.pentagone.business.zentracore.hr.repository.JobRepository;
import org.pentagone.business.zentracore.hr.service.JobHistoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class JobHistoryServiceImpl implements JobHistoryService {

    private final JobHistoryRepository jobHistoryRepository;
    private final EmployeeRepository employeeRepository;
    private final JobRepository jobRepository;
    private final DepartmentRepository departmentRepository;

    public JobHistoryServiceImpl(JobHistoryRepository jobHistoryRepository,
                                 EmployeeRepository employeeRepository,
                                 JobRepository jobRepository,
                                 DepartmentRepository departmentRepository) {
        this.jobHistoryRepository = jobHistoryRepository;
        this.employeeRepository = employeeRepository;
        this.jobRepository = jobRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public JobHistoryDto create(JobHistoryDto dto) {
        if (dto.getId() != null) throw new IllegalArgumentException("Création sans ID");
        JobHistory entity = toEntity(dto);
        return toDto(jobHistoryRepository.save(entity));
    }

    @Override
    public JobHistoryDto update(JobHistoryDto dto) {
        if (dto.getId() == null) throw new IllegalArgumentException("ID requis");
        JobHistory existing = jobHistoryRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Historique introuvable"));
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setReason(dto.getReason());
        if (dto.getJobId() != null) {
            Job job = jobRepository.findById(dto.getJobId()).orElseThrow(() -> new EntityNotFoundException("Job introuvable"));
            existing.setJob(job);
        }
        if (dto.getDepartmentId() != null) {
            Department dep = departmentRepository.findById(dto.getDepartmentId()).orElseThrow(() -> new EntityNotFoundException("Dept introuvable"));
            existing.setDepartment(dep);
        }
        return toDto(jobHistoryRepository.save(existing));
    }

    @Override
    public JobHistoryDto getById(Long id) {
        JobHistory entity = jobHistoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Historique introuvable"));
        return toDto(entity);
    }

    @Override
    public List<JobHistoryDto> listByEmployee(Long employeeId) {
        return jobHistoryRepository.findByEmployeeId(employeeId).stream().map(this::toDto).toList();
    }

    @Override
    public void delete(Long id) {
        JobHistory entity = jobHistoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Historique introuvable"));
        jobHistoryRepository.delete(entity);
    }

    private JobHistoryDto toDto(JobHistory j) {
        JobHistoryDto dto = new JobHistoryDto();
        dto.setId(j.getId());
        dto.setEmployeeId(j.getEmployee() != null ? j.getEmployee().getId() : null);
        dto.setJobId(j.getJob() != null ? j.getJob().getId() : null);
        dto.setDepartmentId(j.getDepartment() != null ? j.getDepartment().getId() : null);
        dto.setStartDate(j.getStartDate());
        dto.setEndDate(j.getEndDate());
        dto.setReason(j.getReason());
        return dto;
    }

    private JobHistory toEntity(JobHistoryDto dto) {
        JobHistory j = new JobHistory();
        j.setId(dto.getId());
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable"));
        j.setEmployee(emp);
        if (dto.getJobId() != null) {
            Job job = jobRepository.findById(dto.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Job introuvable"));
            j.setJob(job);
        }
        if (dto.getDepartmentId() != null) {
            Department dep = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Dept introuvable"));
            j.setDepartment(dep);
        }
        j.setStartDate(dto.getStartDate());
        j.setEndDate(dto.getEndDate());
        j.setReason(dto.getReason());
        return j;
    }
}

