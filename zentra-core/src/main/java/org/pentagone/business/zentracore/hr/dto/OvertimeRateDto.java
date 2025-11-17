package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class OvertimeRateDto {
    private Long id;
    private Integer minHours;
    private Integer maxHours;
    private Double rate;
}

