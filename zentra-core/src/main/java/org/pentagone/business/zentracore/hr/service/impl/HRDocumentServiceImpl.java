package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.HRDocumentDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.HRDocument;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.HRDocumentRepository;
import org.pentagone.business.zentracore.hr.service.HRDocumentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class HRDocumentServiceImpl implements HRDocumentService {

    private final HRDocumentRepository hrDocumentRepository;
    private final EmployeeRepository employeeRepository;

    public HRDocumentServiceImpl(HRDocumentRepository hrDocumentRepository, EmployeeRepository employeeRepository) {
        this.hrDocumentRepository = hrDocumentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public HRDocumentDto upload(HRDocumentDto dto) {
        if (dto.getId() != null) throw new IllegalArgumentException("Upload sans ID");
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable"));
        HRDocument doc = new HRDocument();
        doc.setEmployee(emp);
        doc.setDocType(dto.getDocType());
        doc.setFilePath(dto.getFilePath());
        doc.setUploadedAt(LocalDateTime.now());
        doc.setExpiryDate(dto.getExpiryDate());
        doc.setVisibleToEmployee(dto.getVisibleToEmployee() != null ? dto.getVisibleToEmployee() : true);
        HRDocument saved = hrDocumentRepository.save(doc);
        return toDto(saved);
    }

    @Override
    public List<HRDocumentDto> listByEmployee(Long employeeId) {
        return hrDocumentRepository.findByEmployeeId(employeeId).stream().map(this::toDto).toList();
    }

    @Override
    public void delete(Long id) {
        HRDocument doc = hrDocumentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document introuvable"));
        hrDocumentRepository.delete(doc);
    }

    private HRDocumentDto toDto(HRDocument d) {
        HRDocumentDto dto = new HRDocumentDto();
        dto.setId(d.getId());
        dto.setEmployeeId(d.getEmployee() != null ? d.getEmployee().getId() : null);
        dto.setDocType(d.getDocType());
        dto.setFilePath(d.getFilePath());
        dto.setUploadedAt(d.getUploadedAt());
        dto.setExpiryDate(d.getExpiryDate());
        dto.setVisibleToEmployee(d.getVisibleToEmployee());
        return dto;
    }
}

