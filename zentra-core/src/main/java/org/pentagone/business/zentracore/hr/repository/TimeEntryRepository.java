package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    List<TimeEntry> findByEmployeeIdAndEntryDate(Long employeeId, LocalDate entryDate);

    @Query("select t from TimeEntry t where (:employeeId is null or t.employee.id = :employeeId) and t.entryDate between :start and :end order by t.entryDate asc")
    List<TimeEntry> findRange(@Param("employeeId") Long employeeId,
                              @Param("start") LocalDate start,
                              @Param("end") LocalDate end);
}
