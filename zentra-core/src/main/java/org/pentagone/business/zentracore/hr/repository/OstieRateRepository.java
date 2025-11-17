package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.OstieRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OstieRateRepository extends JpaRepository<OstieRate, Long> {
}

