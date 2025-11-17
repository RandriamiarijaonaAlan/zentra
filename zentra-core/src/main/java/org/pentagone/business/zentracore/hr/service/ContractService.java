package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.ContractDto;

import java.util.List;

public interface ContractService {
    ContractDto create(ContractDto dto);
    ContractDto update(ContractDto dto);
    ContractDto getById(Long id);
    List<ContractDto> listByEmployee(Long employeeId);
    void delete(Long id);
}

