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
public class SalaryComponent extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_stub_id")
    private PayStub payStub;
    private String designation;
    private String number;
    private Double rate;
    private Double amount;

    public SalaryComponent(String designation, String number, Double rate, Double amount) {
        this.designation = designation;
        this.number = number;
        this.rate = rate;
        this.amount = amount;
    }

    public SalaryComponent(String designation) {
        this.designation = designation;
    }
}
