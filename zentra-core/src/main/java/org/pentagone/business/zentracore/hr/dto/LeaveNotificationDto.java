package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import org.pentagone.business.zentracore.hr.entity.LeaveNotification.NotificationType;

import java.time.LocalDateTime;

@Data
public class LeaveNotificationDto {
    private Long id;
    private Long leaveRequestId;
    private String leaveRequestEmployee;
    private String leaveTypeName;
    private Long recipientId;
    private String recipientName;
    private NotificationType notificationType;
    private String message;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime sentAt;
}
