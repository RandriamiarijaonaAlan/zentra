package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class CnapsRateDto {
    private Long id;
    private Double ceilingBaseAmount;
    private Double ceilingRate;
    private Double rate;
    private Double ceilingAmount; // computed value if needed
}

