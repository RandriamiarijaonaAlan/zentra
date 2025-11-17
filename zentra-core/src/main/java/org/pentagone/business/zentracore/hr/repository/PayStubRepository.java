package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.PayStub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PayStubRepository extends JpaRepository<PayStub, Long> {
    Optional<PayStub> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
}

