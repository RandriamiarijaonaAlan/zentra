package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.EmployeeSkillHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSkillHistoryRepository extends JpaRepository<EmployeeSkillHistory, Long> {
    List<EmployeeSkillHistory> findByEmployeeSkillIdOrderByEvaluationDateDesc(Long employeeSkillId);
}

