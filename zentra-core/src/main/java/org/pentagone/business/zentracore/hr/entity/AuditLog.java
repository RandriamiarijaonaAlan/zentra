package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@EqualsAndHashCode(callSuper = true)
public class AuditLog extends BaseEntity {

    @Column(name = "action_by", length = 150)
    private String actionBy;

    @Column(name = "action", length = 150)
    private String action;

    @Column(name = "entity_name", length = 150)
    private String entityName;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
