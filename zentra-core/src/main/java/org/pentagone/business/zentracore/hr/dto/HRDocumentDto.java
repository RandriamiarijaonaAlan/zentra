package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class HRDocumentDto {
    private Long id;
    private Long employeeId;
    private String docType;
    private String filePath;
    private LocalDateTime uploadedAt;
    private LocalDate expiryDate;
    private Boolean visibleToEmployee;
}

