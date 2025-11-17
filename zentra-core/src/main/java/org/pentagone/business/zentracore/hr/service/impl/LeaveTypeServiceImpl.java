package org.pentagone.business.zentracore.hr.service.impl;

import lombok.RequiredArgsConstructor;
import org.pentagone.business.zentracore.hr.dto.LeaveTypeDto;
import org.pentagone.business.zentracore.hr.entity.LeaveType;
import org.pentagone.business.zentracore.hr.mapper.LeaveTypeMapper;
import org.pentagone.business.zentracore.hr.repository.LeaveTypeRepository;
import org.pentagone.business.zentracore.hr.service.LeaveTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveTypeServiceImpl implements LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveTypeMapper leaveTypeMapper;

    @Override
    public LeaveTypeDto createLeaveType(LeaveTypeDto leaveTypeDto) {
        // Check if leave type with same name already exists
        LeaveType existing = leaveTypeRepository.findByNameIgnoreCase(leaveTypeDto.getName());
        if (existing != null) {
            throw new RuntimeException("Leave type with name '" + leaveTypeDto.getName() + "' already exists");
        }

        LeaveType leaveType = leaveTypeMapper.toEntity(leaveTypeDto);
        leaveType.setId(null); // Ensure new entity
        leaveType = leaveTypeRepository.save(leaveType);
        return leaveTypeMapper.toDto(leaveType);
    }

    @Override
    public LeaveTypeDto updateLeaveType(LeaveTypeDto leaveTypeDto) {
        LeaveType existing = leaveTypeRepository.findById(leaveTypeDto.getId())
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + leaveTypeDto.getId()));

        // Check if name is being changed and if it conflicts with another leave type
        if (!existing.getName().equalsIgnoreCase(leaveTypeDto.getName())) {
            LeaveType nameConflict = leaveTypeRepository.findByNameIgnoreCase(leaveTypeDto.getName());
            if (nameConflict != null && !nameConflict.getId().equals(leaveTypeDto.getId())) {
                throw new RuntimeException("Leave type with name '" + leaveTypeDto.getName() + "' already exists");
            }
        }

        LeaveType leaveType = leaveTypeMapper.toEntity(leaveTypeDto);
        leaveType = leaveTypeRepository.save(leaveType);
        return leaveTypeMapper.toDto(leaveType);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveTypeDto getLeaveTypeById(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));
        return leaveTypeMapper.toDto(leaveType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveTypeDto> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream()
                .map(leaveTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveTypeDto> getActiveLeaveTypes() {
        return leaveTypeRepository.findByIsActiveTrue().stream()
                .map(leaveTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));

        // Check if leave type has associated leave requests
        if (leaveType.getLeaveRequests() != null && !leaveType.getLeaveRequests().isEmpty()) {
            throw new RuntimeException("Cannot delete leave type with existing leave requests");
        }

        leaveTypeRepository.deleteById(id);
    }

    @Override
    public void activateLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));
        leaveType.setIsActive(true);
        leaveTypeRepository.save(leaveType);
    }

    @Override
    public void deactivateLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));
        leaveType.setIsActive(false);
        leaveTypeRepository.save(leaveType);
    }
}
