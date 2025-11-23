package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {
    
    List<DocumentRequest> findByEmployeeIdOrderByRequestedAtDesc(Long employeeId);
    
    List<DocumentRequest> findByEmployeeIdAndStatus(Long employeeId, String status);
    
    List<DocumentRequest> findByStatus(String status);
    
}
