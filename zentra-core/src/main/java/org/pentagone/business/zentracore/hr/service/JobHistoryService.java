package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.JobHistoryDto;

import java.util.List;

public interface JobHistoryService {
    JobHistoryDto create(JobHistoryDto dto);
    JobHistoryDto update(JobHistoryDto dto);
    JobHistoryDto getById(Long id);
    List<JobHistoryDto> listByEmployee(Long employeeId);
    void delete(Long id);
}

