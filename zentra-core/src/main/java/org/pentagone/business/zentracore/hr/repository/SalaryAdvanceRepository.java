package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.SalaryAdvance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryAdvanceRepository extends JpaRepository<SalaryAdvance, Long> {
}

