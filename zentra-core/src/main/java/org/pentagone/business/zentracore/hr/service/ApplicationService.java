package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ApplicationService {
    ApplicationDto createApplication(ApplicationDto applicationDto, MultipartFile cv, MultipartFile motivationLetter);
    ApplicationDto getApplicationById(Long id);
    List<ApplicationDto> getApplications();
    ApplicationDto updateApplication(ApplicationDto applicationDto);
    Void deleteApplicationById(Long id);

    SetDocumentScoreDto setDocumentScore(SetDocumentScoreDto setDocumentScoreDto);

    AssignQcmDto assignQcm(AssignQcmDto assignQcmDto);

    ScoreDto getScoreByApplicationId(Long applicationId);

    EmployeeDto acceptByApplicationId(Long applicationId);
}

