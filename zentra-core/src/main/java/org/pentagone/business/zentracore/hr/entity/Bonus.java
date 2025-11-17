package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.time.YearMonth;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Bonus extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    private Double amount;
    private String description;
    private YearMonth date;
}
