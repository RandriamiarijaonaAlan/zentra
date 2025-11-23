package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "employee")
@Data
@EqualsAndHashCode(callSuper = true)
public class Employee extends BaseEntity {
    
    @Column(name = "employee_number", nullable = false, unique = true, length = 50)
    private String employeeNumber;

    private Long cnapsNumber;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "work_email", nullable = false, unique = true, length = 150)
    private String workEmail;
    
    @Column(name = "work_phone", length = 20)
    private String workPhone;
    
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;
    
    @Column(name = "gender", length = 1)
    private String gender;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "country", nullable = false, length = 100)
    private String country = "France";
    
    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;
    
    @Column(name = "base_salary", nullable = false)
    private Double baseSalary;
    
    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
    private Contract contract;


}
