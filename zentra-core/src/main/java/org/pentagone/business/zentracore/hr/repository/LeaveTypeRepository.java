package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {

    List<LeaveType> findByIsActiveTrue();

    LeaveType findByNameIgnoreCase(String name);
}
