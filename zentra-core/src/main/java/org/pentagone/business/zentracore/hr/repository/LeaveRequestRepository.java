package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, String status);
    
    List<LeaveRequest> findByStatus(String status);
    
}
