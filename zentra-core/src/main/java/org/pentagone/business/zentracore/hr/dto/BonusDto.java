package org.pentagone.business.zentracore.hr.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import org.pentagone.business.zentracore.common.middleware.YearMonthDeserializerWithDay;

import java.time.YearMonth;

@Data
public class BonusDto {
    private Long id;
    private Long employeeId;
    private Double amount;
    private String description;
    @JsonDeserialize(using = YearMonthDeserializerWithDay.class)
    private YearMonth date;

}

