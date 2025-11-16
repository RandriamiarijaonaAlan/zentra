package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "hr_message")
@Data
@EqualsAndHashCode(callSuper = true)
public class HrMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole; // EMPLOYEE, HR

    @Column(name = "subject", length = 255)
    private String subject;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "thread_id", length = 100)
    private String threadId; // For grouping messages in conversations

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_user_id")
    private Employee hrUser; // HR staff member handling the conversation

}
