package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.TrainingDto;

import java.util.List;

public interface TrainingService {
    TrainingDto create(TrainingDto dto);
    TrainingDto update(TrainingDto dto);
    TrainingDto findById(Long id);
    List<TrainingDto> findAll();
    void deleteById(Long id);
    List<TrainingDto> suggestTrainingsForEmployee(Long employeeId);
}

