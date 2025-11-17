package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.CnapsRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CnapsRateRepository extends JpaRepository<CnapsRate, Long> {
}

