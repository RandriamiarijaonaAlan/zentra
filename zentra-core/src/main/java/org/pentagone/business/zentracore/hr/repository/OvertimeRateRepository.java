package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.OvertimeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OvertimeRateRepository extends JpaRepository<OvertimeRate, Long> {
    @Query(value = "select o from OvertimeRate o order by o.rate")
    List<OvertimeRate> findAllOrderByRate();
}

