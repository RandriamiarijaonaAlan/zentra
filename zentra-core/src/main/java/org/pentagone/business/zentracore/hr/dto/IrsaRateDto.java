package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class IrsaRateDto {
    private Long id;
    private Double minIncome;
    private Double maxIncome;
    private Double rate;
    private Double amount;
}

