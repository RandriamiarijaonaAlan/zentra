package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.IrsaRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IrsaRateRepository extends JpaRepository<IrsaRate, Long> {
}

