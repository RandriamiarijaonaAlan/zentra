package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SalaryDeduction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_stub_id")
    private PayStub payStub;
    private String designation;
    private Double rate;
    private Double amount;

    public SalaryDeduction(String designation, Double rate, Double amount) {
        this.designation = designation;
        this.rate = rate;
        this.amount = amount;
    }
}
