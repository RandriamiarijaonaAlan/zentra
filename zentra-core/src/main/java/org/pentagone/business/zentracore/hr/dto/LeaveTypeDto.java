package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

import java.util.List;

@Data
public class LeaveTypeDto {
    private Long id;
    private String name;
    private String description;
    private Boolean isPaid;
    private Integer maxDaysPerYear;
    private Boolean requiresApproval;
    private Integer advanceNoticeDays;
    private Boolean isActive;
    private String color;
    private Integer maxConcurrentRequests;
}
