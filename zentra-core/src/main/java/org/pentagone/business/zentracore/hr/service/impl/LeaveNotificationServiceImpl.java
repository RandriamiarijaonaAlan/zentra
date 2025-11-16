package org.pentagone.business.zentracore.hr.service.impl;

import lombok.RequiredArgsConstructor;
import org.pentagone.business.zentracore.hr.dto.LeaveNotificationDto;
import org.pentagone.business.zentracore.hr.entity.*;
import org.pentagone.business.zentracore.hr.entity.LeaveNotification.NotificationType;
import org.pentagone.business.zentracore.hr.repository.*;
import org.pentagone.business.zentracore.hr.service.LeaveNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveNotificationServiceImpl implements LeaveNotificationService {

    private final LeaveNotificationRepository leaveNotificationRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void createNotification(Long leaveRequestId, Long recipientId, NotificationType type, String message) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        Employee recipient = employeeRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        LeaveNotification notification = new LeaveNotification();
        notification.setLeaveRequest(leaveRequest);
        notification.setRecipient(recipient);
        notification.setNotificationType(type);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setSentAt(LocalDateTime.now());

        leaveNotificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveNotificationDto> getEmployeeNotifications(Long employeeId) {
        return leaveNotificationRepository.findByRecipientIdOrderBySentAtDesc(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveNotificationDto> getUnreadNotifications(Long employeeId) {
        return leaveNotificationRepository.findByRecipientIdAndIsReadFalseOrderBySentAtDesc(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadNotificationCount(Long employeeId) {
        return leaveNotificationRepository.countByRecipientIdAndIsReadFalse(employeeId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        LeaveNotification notification = leaveNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        leaveNotificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long employeeId) {
        List<LeaveNotification> unreadNotifications = leaveNotificationRepository
                .findByRecipientIdAndIsReadFalseOrderBySentAtDesc(employeeId);

        LocalDateTime now = LocalDateTime.now();
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(now);
        });

        leaveNotificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public void sendLeaveRequestNotifications(Long leaveRequestId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        String message = String.format(
                "Nouvelle demande de congé de %s %s pour %s du %s au %s (%s jour%s)",
                request.getEmployee().getFirstName(),
                request.getEmployee().getLastName(),
                request.getLeaveType().getName(),
                request.getStartDate().toString(),
                request.getEndDate().toString(),
                request.getDaysRequested().stripTrailingZeros().toPlainString(),
                request.getDaysRequested().compareTo(java.math.BigDecimal.ONE) > 0 ? "s" : ""
        );

        // Send to managers/HR - simplified placeholder
        List<Employee> managers = getManagers();
        for (Employee manager : managers) {
            createNotification(leaveRequestId, manager.getId(), NotificationType.REQUEST_SUBMITTED, message);
        }
    }

    @Override
    public void sendApprovalNotifications(Long leaveRequestId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        String message = String.format(
                "Votre demande de congé pour %s du %s au %s a été approuvée",
                request.getLeaveType().getName(),
                request.getStartDate().toString(),
                request.getEndDate().toString()
        );

        createNotification(leaveRequestId, request.getEmployee().getId(), NotificationType.REQUEST_APPROVED, message);
    }

    @Override
    public void sendRejectionNotifications(Long leaveRequestId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        String message = String.format(
                "Votre demande de congé pour %s du %s au %s a été rejetée",
                request.getLeaveType().getName(),
                request.getStartDate().toString(),
                request.getEndDate().toString()
        );

        if (request.getApprovalComment() != null && !request.getApprovalComment().trim().isEmpty()) {
            message += ". Commentaire: " + request.getApprovalComment();
        }

        createNotification(leaveRequestId, request.getEmployee().getId(), NotificationType.REQUEST_REJECTED, message);
    }

    @Override
    public void sendCancellationNotifications(Long leaveRequestId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        String message = String.format(
                "La demande de congé de %s %s pour %s du %s au %s a été annulée",
                request.getEmployee().getFirstName(),
                request.getEmployee().getLastName(),
                request.getLeaveType().getName(),
                request.getStartDate().toString(),
                request.getEndDate().toString()
        );

        // Notify managers/HR
        List<Employee> managers = getManagers();
        for (Employee manager : managers) {
            if (!manager.getId().equals(request.getEmployee().getId())) {
                createNotification(leaveRequestId, manager.getId(), NotificationType.REQUEST_CANCELLED, message);
            }
        }
    }

    private LeaveNotificationDto toDto(LeaveNotification notification) {
        LeaveNotificationDto dto = new LeaveNotificationDto();
        dto.setId(notification.getId());
        dto.setLeaveRequestId(notification.getLeaveRequest().getId());
        dto.setLeaveRequestEmployee(notification.getLeaveRequest().getEmployee().getFirstName() +
                " " + notification.getLeaveRequest().getEmployee().getLastName());
        dto.setLeaveTypeName(notification.getLeaveRequest().getLeaveType().getName());
        dto.setRecipientId(notification.getRecipient().getId());
        dto.setRecipientName(notification.getRecipient().getFirstName() +
                " " + notification.getRecipient().getLastName());
        dto.setNotificationType(notification.getNotificationType());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setReadAt(notification.getReadAt());
        dto.setSentAt(notification.getSentAt());
        return dto;
    }

    private List<Employee> getManagers() {
        // Placeholder: return a small subset of employees
        return employeeRepository.findAll().stream()
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
    }
}
