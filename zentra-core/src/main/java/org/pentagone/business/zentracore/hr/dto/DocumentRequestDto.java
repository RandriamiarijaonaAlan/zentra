package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String type;
    private String status;
    private String reason;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private LocalDateTime deliveredAt;
    private String filePath;
    private Long processedById;
    private String processedByName;
    private String notes;
}
