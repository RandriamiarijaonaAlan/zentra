package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.LeaveNotificationDto;
import org.pentagone.business.zentracore.hr.entity.LeaveNotification.NotificationType;

import java.util.List;

public interface LeaveNotificationService {
    void createNotification(Long leaveRequestId, Long recipientId, NotificationType type, String message);
    List<LeaveNotificationDto> getEmployeeNotifications(Long employeeId);
    List<LeaveNotificationDto> getUnreadNotifications(Long employeeId);
    Long getUnreadNotificationCount(Long employeeId);

    void markAsRead(Long notificationId);
    void markAllAsRead(Long employeeId);

    void sendLeaveRequestNotifications(Long leaveRequestId);
    void sendApprovalNotifications(Long leaveRequestId);
    void sendRejectionNotifications(Long leaveRequestId);
    void sendCancellationNotifications(Long leaveRequestId);
}
