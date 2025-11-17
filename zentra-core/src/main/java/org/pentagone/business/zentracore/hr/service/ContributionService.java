package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.CnapsRateDto;
import org.pentagone.business.zentracore.hr.dto.IrsaRateDto;
import org.pentagone.business.zentracore.hr.dto.OstieRateDto;

import java.util.List;

public interface ContributionService {
    List<IrsaRateDto> getIrsaRates();
    IrsaRateDto createIrsaRate(IrsaRateDto irsaRateDto);
    IrsaRateDto updateIrsaRate(IrsaRateDto irsaRateDto);
    void deleteIrsaRate(Long id);
    CnapsRateDto getFirstCnapsRate();
    CnapsRateDto updateCnapsRate(CnapsRateDto cnapsRateDto);
    OstieRateDto getFirstOstieRate();
    OstieRateDto updateOstieRate(OstieRateDto ostieRateDto);
}
