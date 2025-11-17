package org.pentagone.business.zentracore.hr.service.impl;

import jakarta.transaction.Transactional;
import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.CnapsRateDto;
import org.pentagone.business.zentracore.hr.dto.IrsaRateDto;
import org.pentagone.business.zentracore.hr.dto.OstieRateDto;
import org.pentagone.business.zentracore.hr.entity.CnapsRate;
import org.pentagone.business.zentracore.hr.entity.IrsaRate;
import org.pentagone.business.zentracore.hr.entity.OstieRate;
import org.pentagone.business.zentracore.hr.mapper.CnapsRateMapper;
import org.pentagone.business.zentracore.hr.mapper.IrsaRateMapper;
import org.pentagone.business.zentracore.hr.mapper.OstieRateMapper;
import org.pentagone.business.zentracore.hr.repository.CnapsRateRepository;
import org.pentagone.business.zentracore.hr.repository.IrsaRateRepository;
import org.pentagone.business.zentracore.hr.repository.OstieRateRepository;
import org.pentagone.business.zentracore.hr.service.ContributionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ContributionServiceImpl implements ContributionService {
    private final IrsaRateRepository irsaRateRepository;
    private final CnapsRateRepository cnapsRateRepository;
    private final OstieRateRepository ostieRateRepository;
    private final IrsaRateMapper irsaRateMapper;
    private final CnapsRateMapper cnapsRateMapper;
    private final OstieRateMapper ostieRateMapper;

    public ContributionServiceImpl(IrsaRateRepository irsaRateRepository,
                                   CnapsRateRepository cnapsRateRepository, OstieRateRepository ostieRateRepository,
                                   IrsaRateMapper irsaRateMapper,
                                   CnapsRateMapper cnapsRateMapper, OstieRateMapper ostieRateMapper) {
        this.irsaRateRepository = irsaRateRepository;
        this.cnapsRateRepository = cnapsRateRepository;
        this.ostieRateRepository = ostieRateRepository;
        this.irsaRateMapper = irsaRateMapper;
        this.cnapsRateMapper = cnapsRateMapper;
        this.ostieRateMapper = ostieRateMapper;
    }

    @Override
    public List<IrsaRateDto> getIrsaRates() {
        return irsaRateRepository.findAll().stream().map(irsaRateMapper::toDto).toList();
    }

    @Override
    public IrsaRateDto createIrsaRate(IrsaRateDto irsaRateDto) {
        IrsaRate irsaRate = irsaRateMapper.toEntity(irsaRateDto);
        if (irsaRate.getId() != null) throw new IllegalArgumentException("New IrsaRate cannot already have an ID");
        return irsaRateMapper.toDto(irsaRateRepository.save(irsaRate));
    }

    @Override
    public IrsaRateDto updateIrsaRate(IrsaRateDto irsaRateDto) {
        IrsaRate irsaRate = irsaRateMapper.toEntity(irsaRateDto);
        if (irsaRate.getId() == null || !irsaRateRepository.existsById(irsaRate.getId()))
            throw new EntityNotFoundException("IrsaRate to update must have a valid ID");
        return irsaRateMapper.toDto(irsaRateRepository.save(irsaRate));
    }

    @Override
    public void deleteIrsaRate(Long id) {
        if (id == null || !irsaRateRepository.existsById(id))
            throw new EntityNotFoundException("IrsaRate to delete must have a valid ID");
        irsaRateRepository.deleteById(id);
    }

    @Override
    public CnapsRateDto getFirstCnapsRate() {
        return cnapsRateMapper.toDto(cnapsRateRepository.findAll().stream().findFirst().orElseThrow(() ->
                new EntityNotFoundException("No CnapsRate found")));
    }

    @Override
    public CnapsRateDto updateCnapsRate(CnapsRateDto cnapsRateDto) {
        CnapsRate cnapsRate = cnapsRateMapper.toEntity(cnapsRateDto);
        if (cnapsRate.getId() == null || !cnapsRateRepository.existsById(cnapsRate.getId()))
            throw new EntityNotFoundException("CnapsRate to update must have a valid ID");
        return cnapsRateMapper.toDto(cnapsRateRepository.save(cnapsRate));
    }

    @Override
    public OstieRateDto getFirstOstieRate() {
        return ostieRateMapper.toDto(ostieRateRepository.findAll().stream().findFirst().orElseThrow(() ->
                new EntityNotFoundException("No OstieRate found")));
    }

    @Override
    public OstieRateDto updateOstieRate(OstieRateDto ostieRateDto) {
        OstieRate ostieRate = ostieRateMapper.toEntity(ostieRateDto);
        if (ostieRate.getId() == null || !ostieRateRepository.existsById(ostieRate.getId()))
            throw new EntityNotFoundException("OstieRate to update must have a valid ID");
        return ostieRateMapper.toDto(ostieRateRepository.save(ostieRate));
    }
}
