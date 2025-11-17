package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
    Optional<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);


    List<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(Long employeeId, Long leaveTypeId, Integer year);

    List<LeaveBalance> findByYear(Integer year);

    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.expiresOn <= :date AND (lb.allocatedDays + COALESCE(lb.carriedOverDays, 0) - lb.usedDays - lb.pendingDays) > 0")
    List<LeaveBalance> findExpiringBalances(@Param("date") LocalDate date);

    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.id = :employeeId ORDER BY lb.year DESC")
    List<LeaveBalance> findByEmployeeIdOrderByYearDesc(@Param("employeeId") Long employeeId);
}
