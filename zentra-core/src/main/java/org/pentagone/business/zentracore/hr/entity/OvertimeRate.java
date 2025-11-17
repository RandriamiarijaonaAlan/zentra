package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class OvertimeRate extends BaseEntity {
    private Integer minHours;
    private Integer maxHours;
    private Double rate;
}
