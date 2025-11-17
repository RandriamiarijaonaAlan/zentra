package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HrMessageDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String senderRole;
    private String subject;
    private String body;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private String threadId;
    private Boolean isArchived;
    private Long hrUserId;
    private String hrUserName;
}
