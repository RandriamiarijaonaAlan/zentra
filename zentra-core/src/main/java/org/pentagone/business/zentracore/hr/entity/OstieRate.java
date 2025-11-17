package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class OstieRate extends BaseEntity {
    private Double rate;
}
