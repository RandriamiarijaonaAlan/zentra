package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseClaimDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate claimDate;
    private Double amount;
    private String currency;
    private String category;
    private String description;
    private String status;
    private String receiptFiles;
    private LocalDateTime submittedAt;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    private LocalDateTime paidAt;
}
