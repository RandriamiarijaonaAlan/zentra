package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.util.List;

@Entity
@Table(name = "leave_type")
@Data
@EqualsAndHashCode(callSuper = true)
public class LeaveType extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = true;

    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;

    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval = true;

    @Column(name = "advance_notice_days")
    private Integer advanceNoticeDays;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "color", length = 7) // For calendar display
    private String color;

    @Column(name = "max_concurrent_requests")
    private Integer maxConcurrentRequests; // null or <=0 means unlimited

    @OneToMany(mappedBy = "leaveType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LeaveRequest> leaveRequests;

    @OneToMany(mappedBy = "leaveType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LeaveBalance> leaveBalances;
}
