package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.HRDocumentDto;

import java.util.List;

public interface HRDocumentService {
    HRDocumentDto upload(HRDocumentDto dto);
    List<HRDocumentDto> listByEmployee(Long employeeId);
    void delete(Long id);
}

