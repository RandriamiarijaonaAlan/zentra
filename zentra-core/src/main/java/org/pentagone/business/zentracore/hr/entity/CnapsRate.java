package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class CnapsRate extends BaseEntity {
    private Double ceilingBaseAmount;
    private Double ceilingRate;
    private Double rate;

    public Double getCeilingAmount() {
        return ceilingBaseAmount * ceilingRate * rate / 100;
    }
}
