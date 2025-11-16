package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;

@Data
public class EmployeeProfileUpdateDto {
    // Champs modifiables par l'employé
    private String workPhone;
    private String address;
    private String city;
    private String country;
    private String gender;
}
