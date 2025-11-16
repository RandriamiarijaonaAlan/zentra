package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.ExpenseClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, Long> {
    
    List<ExpenseClaim> findByEmployeeIdOrderBySubmittedAtDesc(Long employeeId);
    
    List<ExpenseClaim> findByEmployeeIdAndStatus(Long employeeId, String status);
    
    List<ExpenseClaim> findByStatus(String status);
    
}
