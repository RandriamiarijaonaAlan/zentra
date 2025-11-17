package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.JobHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobHistoryRepository extends JpaRepository<JobHistory, Long> {
    List<JobHistory> findByEmployeeId(Long employeeId);
}

