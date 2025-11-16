package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
    Optional<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);
    
}
