package org.pentagone.business.zentracore.hr.controller;

import lombok.RequiredArgsConstructor;
import org.pentagone.business.zentracore.hr.dto.LeaveNotificationDto;
import org.pentagone.business.zentracore.hr.entity.LeaveNotification.NotificationType;
import org.pentagone.business.zentracore.hr.service.LeaveNotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave-notifications")
@RequiredArgsConstructor
public class LeaveNotificationController {

    private final LeaveNotificationService leaveNotificationService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveNotificationDto>> getEmployeeNotifications(@PathVariable Long employeeId) {
        return new ResponseEntity<>(leaveNotificationService.getEmployeeNotifications(employeeId), HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/unread")
    public ResponseEntity<List<LeaveNotificationDto>> getUnreadNotifications(@PathVariable Long employeeId) {
        return new ResponseEntity<>(leaveNotificationService.getUnreadNotifications(employeeId), HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long employeeId) {
        return new ResponseEntity<>(leaveNotificationService.getUnreadNotificationCount(employeeId), HttpStatus.OK);
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        leaveNotificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/employee/{employeeId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long employeeId) {
        leaveNotificationService.markAllAsRead(employeeId);
        return ResponseEntity.ok().build();
    }
}

