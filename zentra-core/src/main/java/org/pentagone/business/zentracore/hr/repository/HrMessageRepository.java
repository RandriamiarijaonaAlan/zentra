package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.HrMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HrMessageRepository extends JpaRepository<HrMessage, Long> {
    
    List<HrMessage> findByEmployeeIdAndIsArchivedOrderBySentAtDesc(Long employeeId, Boolean isArchived);
    
    List<HrMessage> findByThreadIdOrderBySentAt(String threadId);
    
    @Query("SELECT DISTINCT m.threadId FROM HrMessage m WHERE m.employee.id = :employeeId AND m.isArchived = false ORDER BY m.sentAt DESC")
    List<String> findDistinctThreadIdsByEmployeeId(Long employeeId);
    
}
