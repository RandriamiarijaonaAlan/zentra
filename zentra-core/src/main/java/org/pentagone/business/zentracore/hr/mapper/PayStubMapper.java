package org.pentagone.business.zentracore.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.pentagone.business.zentracore.hr.dto.PayStubDto;
import org.pentagone.business.zentracore.hr.entity.PayStub;

@Mapper(componentModel = "spring", uses = {SalaryComponentMapper.class, SalaryDeductionMapper.class})
public interface PayStubMapper {
    @Mapping(target = "employeeId", source = "employee.id")
    PayStubDto toDto(PayStub entity);

    @Mapping(target = "employee", ignore = true)
    PayStub toEntity(PayStubDto dto);
}

