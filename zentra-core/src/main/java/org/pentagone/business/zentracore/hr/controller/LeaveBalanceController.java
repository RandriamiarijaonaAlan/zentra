package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.LeaveBalanceDto;
import org.pentagone.business.zentracore.hr.dto.EmployeeLeaveOverviewDto;
import org.pentagone.business.zentracore.hr.service.LeaveBalanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave-balances")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @PostMapping
    public ResponseEntity<LeaveBalanceDto> createLeaveBalance(@RequestBody LeaveBalanceDto balanceDto) {
        LeaveBalanceDto created = leaveBalanceService.createLeaveBalance(balanceDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<LeaveBalanceDto> updateLeaveBalance(@RequestBody LeaveBalanceDto balanceDto) {
        LeaveBalanceDto updated = leaveBalanceService.updateLeaveBalance(balanceDto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveBalanceDto> getLeaveBalanceById(@PathVariable Long id) {
        LeaveBalanceDto balance = leaveBalanceService.getLeaveBalanceById(id);
        return new ResponseEntity<>(balance, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveBalanceDto>> getEmployeeLeaveBalances(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year) {
        List<LeaveBalanceDto> balances = leaveBalanceService.getEmployeeLeaveBalances(employeeId, year);
        return new ResponseEntity<>(balances, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/{year}")
    public ResponseEntity<List<LeaveBalanceDto>> getEmployeeLeaveBalancesByPath(
            @PathVariable Long employeeId,
            @PathVariable Integer year) {
        List<LeaveBalanceDto> balances = leaveBalanceService.getEmployeeLeaveBalances(employeeId, year);
        return new ResponseEntity<>(balances, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/overview")
    public ResponseEntity<EmployeeLeaveOverviewDto> getEmployeeLeaveOverview(@PathVariable Long employeeId) {
        try {
            EmployeeLeaveOverviewDto overview = leaveBalanceService.getEmployeeLeaveOverview(employeeId);
            return new ResponseEntity<>(overview, HttpStatus.OK);
        } catch (Exception e) {
            // Log the error and return a meaningful error response
            System.err.println("Error getting employee leave overview for employee " + employeeId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error retrieving leave overview: " + e.getMessage());
        }
    }

    @GetMapping("/employee/{employeeId}/overview-simple")
    public ResponseEntity<String> getEmployeeLeaveOverviewSimple(@PathVariable Long employeeId) {
        try {
            EmployeeLeaveOverviewDto overview = leaveBalanceService.getEmployeeLeaveOverview(employeeId);
            return ResponseEntity.ok("Overview loaded successfully for employee " + employeeId + " with " +
                overview.getLeaveBalances().size() + " balances");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<LeaveBalanceDto>> getAllLeaveBalances(@RequestParam(required = false) Integer year) {
        List<LeaveBalanceDto> balances = leaveBalanceService.getAllLeaveBalances(year);
        return new ResponseEntity<>(balances, HttpStatus.OK);
    }

    @PostMapping("/employee/{employeeId}/initialize")
    public ResponseEntity<Void> initializeEmployeeBalances(
            @PathVariable Long employeeId,
            @RequestParam Integer year) {
        leaveBalanceService.initializeEmployeeBalances(employeeId, year);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<LeaveBalanceDto>> getExpiringBalances(@RequestParam int daysBeforeExpiry) {
        List<LeaveBalanceDto> expiring = leaveBalanceService.getExpiringBalances(daysBeforeExpiry);
        return new ResponseEntity<>(expiring, HttpStatus.OK);
    }

    @PostMapping("/carry-over")
    public ResponseEntity<Void> carryOverBalances(
            @RequestParam Integer fromYear,
            @RequestParam Integer toYear) {
        leaveBalanceService.carryOverBalances(fromYear, toYear);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Leave Balance Controller is working");
    }
}
