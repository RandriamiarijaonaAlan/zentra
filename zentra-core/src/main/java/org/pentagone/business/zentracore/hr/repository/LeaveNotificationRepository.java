package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.LeaveNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveNotificationRepository extends JpaRepository<LeaveNotification, Long> {
    List<LeaveNotification> findByRecipientIdOrderBySentAtDesc(Long recipientId);
    List<LeaveNotification> findByRecipientIdAndIsReadFalseOrderBySentAtDesc(Long recipientId);
    List<LeaveNotification> findByLeaveRequestIdOrderBySentAtDesc(Long leaveRequestId);
    Long countByRecipientIdAndIsReadFalse(Long recipientId);
}
