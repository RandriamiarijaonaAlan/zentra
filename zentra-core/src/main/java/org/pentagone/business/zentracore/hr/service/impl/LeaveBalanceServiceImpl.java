package org.pentagone.business.zentracore.hr.service.impl;

import lombok.RequiredArgsConstructor;
import org.pentagone.business.zentracore.hr.dto.LeaveBalanceDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeLeaveOverviewDto;
import org.pentagone.business.zentracore.hr.entity.*;
import org.pentagone.business.zentracore.hr.mapper.LeaveBalanceMapper;
import org.pentagone.business.zentracore.hr.mapper.LeaveRequestMapper;
import org.pentagone.business.zentracore.hr.repository.*;
import org.pentagone.business.zentracore.hr.service.LeaveBalanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceMapper leaveBalanceMapper;
    private final LeaveRequestMapper leaveRequestMapper;

    @Override
    public LeaveBalanceDto createLeaveBalance(LeaveBalanceDto balanceDto) {
        Employee employee = employeeRepository.findById(balanceDto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LeaveType leaveType = leaveTypeRepository.findById(balanceDto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        // Check if balance already exists for this employee, leave type, and year
        Optional<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                balanceDto.getEmployeeId(), balanceDto.getLeaveTypeId(), balanceDto.getYear());

        if (existing.isPresent()) {
            throw new RuntimeException("Leave balance already exists for this employee, leave type, and year");
        }

        LeaveBalance leaveBalance = new LeaveBalance();
        leaveBalance.setEmployee(employee);
        leaveBalance.setLeaveType(leaveType);
        leaveBalance.setYear(balanceDto.getYear());
        leaveBalance.setAllocatedDays(balanceDto.getAllocatedDays());
        leaveBalance.setUsedDays(balanceDto.getUsedDays());
        leaveBalance.setPendingDays(balanceDto.getPendingDays());
        leaveBalance.setCarriedOverDays(balanceDto.getCarriedOverDays());
        leaveBalance.setExpiresOn(balanceDto.getExpiresOn());

        leaveBalance = leaveBalanceRepository.save(leaveBalance);
        return leaveBalanceMapper.toDto(leaveBalance);
    }

    @Override
    public LeaveBalanceDto updateLeaveBalance(LeaveBalanceDto balanceDto) {
        LeaveBalance existing = leaveBalanceRepository.findById(balanceDto.getId())
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));

        existing.setAllocatedDays(balanceDto.getAllocatedDays());
        existing.setUsedDays(balanceDto.getUsedDays());
        existing.setPendingDays(balanceDto.getPendingDays());
        existing.setCarriedOverDays(balanceDto.getCarriedOverDays());
        existing.setExpiresOn(balanceDto.getExpiresOn());

        existing = leaveBalanceRepository.save(existing);
        return leaveBalanceMapper.toDto(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveBalanceDto getLeaveBalanceById(Long id) {
        LeaveBalance balance = leaveBalanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
        return leaveBalanceMapper.toDto(balance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getEmployeeLeaveBalances(Long employeeId, Integer year) {
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year).stream()
                .map(leaveBalanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getAllLeaveBalances(Integer year) {
        return leaveBalanceRepository.findByYear(year).stream()
                .map(leaveBalanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeLeaveOverviewDto getEmployeeLeaveOverview(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        int currentYear = LocalDate.now().getYear();

        EmployeeLeaveOverviewDto overview = new EmployeeLeaveOverviewDto();
        overview.setEmployeeId(employeeId);
        overview.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        overview.setCurrentYear(currentYear);

        // Get leave balances - initialize if they don't exist
        List<LeaveBalanceDto> balances = getEmployeeLeaveBalances(employeeId, currentYear);
        if (balances.isEmpty()) {
            // Initialize balances for this employee if none exist
            initializeEmployeeBalances(employeeId, currentYear);
            balances = getEmployeeLeaveBalances(employeeId, currentYear);
        }
        overview.setLeaveBalances(balances);

        // Get recent requests (last 10)
        List<LeaveRequest> recentRequests = leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(employeeId)
                .stream().limit(10).collect(Collectors.toList());
        overview.setRecentRequests(recentRequests.stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList()));

        // Get upcoming approved leaves
        List<LeaveRequest> upcomingLeaves = leaveRequestRepository.findUpcomingApprovedLeaves(employeeId, LocalDate.now());
        overview.setUpcomingLeaves(upcomingLeaves.stream()
                .map(leaveRequestMapper::toDto)
                .collect(Collectors.toList()));

        return overview;
    }

    @Override
    public void initializeEmployeeBalances(Long employeeId, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<LeaveType> activeLeaveTypes = leaveTypeRepository.findByIsActiveTrue();

        for (LeaveType leaveType : activeLeaveTypes) {
            // Check if balance already exists
            Optional<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    employeeId, leaveType.getId(), year);

            if (existing.isEmpty()) {
                LeaveBalance balance = new LeaveBalance();
                balance.setEmployee(employee);
                balance.setLeaveType(leaveType);
                balance.setYear(year);

                // Set default allocated days based on leave type
                BigDecimal allocatedDays = leaveType.getMaxDaysPerYear() != null
                        ? BigDecimal.valueOf(leaveType.getMaxDaysPerYear())
                        : BigDecimal.valueOf(25); // Default 25 days

                balance.setAllocatedDays(allocatedDays);
                balance.setUsedDays(BigDecimal.ZERO);
                balance.setPendingDays(BigDecimal.ZERO);
                balance.setCarriedOverDays(BigDecimal.ZERO);

                // Set expiry date (end of year for most leave types)
                balance.setExpiresOn(LocalDate.of(year, 12, 31));

                leaveBalanceRepository.save(balance);
            }
        }
    }

    @Override
    public void updateBalanceAfterLeaveRequest(Long employeeId, Long leaveTypeId, Integer year, BigDecimal days, boolean isApproved) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employeeId, leaveTypeId, year);

        if (balanceOpt.isEmpty()) {
            // Initialize balance if it doesn't exist
            initializeEmployeeBalances(employeeId, year);
            balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year);
        }

        LeaveBalance balance = balanceOpt.get();

        if (isApproved) {
            // Move from pending to used
            balance.setPendingDays(balance.getPendingDays().subtract(days));
            balance.setUsedDays(balance.getUsedDays().add(days));
        } else {
            // Just update pending
            balance.setPendingDays(balance.getPendingDays().add(days));
        }

        leaveBalanceRepository.save(balance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getExpiringBalances(int daysBeforeExpiry) {
        LocalDate checkDate = LocalDate.now().plusDays(daysBeforeExpiry);
        return leaveBalanceRepository.findExpiringBalances(checkDate).stream()
                .map(leaveBalanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void carryOverBalances(Integer fromYear, Integer toYear) {
        List<LeaveBalance> fromYearBalances = leaveBalanceRepository.findByYear(fromYear);

        for (LeaveBalance fromBalance : fromYearBalances) {
            // Check if employee has balance for the target year
            Optional<LeaveBalance> toBalanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                    fromBalance.getEmployee().getId(), fromBalance.getLeaveType().getId(), toYear);

            if (toBalanceOpt.isPresent()) {
                LeaveBalance toBalance = toBalanceOpt.get();
                // Add remaining days from previous year as carried over
                BigDecimal carryOver = fromBalance.getRemainingDays();
                if (carryOver.compareTo(BigDecimal.ZERO) > 0) {
                    toBalance.setCarriedOverDays(toBalance.getCarriedOverDays().add(carryOver));
                    leaveBalanceRepository.save(toBalance);
                }
            }
        }
    }
}
