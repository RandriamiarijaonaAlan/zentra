package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.BonusDto;
import org.pentagone.business.zentracore.hr.dto.PayStubDto;
import org.pentagone.business.zentracore.hr.dto.SalaryAdvanceDto;

import java.time.YearMonth;
import java.util.List;

public interface PayService {
    PayStubDto generatePayStubByEmployeeIdAndYearMonth(Long employeeId, YearMonth yearMonth);
    PayStubDto getPayStubByEmployeeIdAndYearMonth(Long employeeId, YearMonth yearMonth);
    BonusDto createBonus(BonusDto bonusDto);
    SalaryAdvanceDto createSalaryAdvance(SalaryAdvanceDto salaryAdvanceDto);
    SalaryAdvanceDto validateSalaryAdvance(Long salaryAdvanceId);
    SalaryAdvanceDto rejectSalaryAdvance(Long salaryAdvanceId);

    List<BonusDto> getAllBonuses();

    List<SalaryAdvanceDto> getAllSalaryAdvances();
}
