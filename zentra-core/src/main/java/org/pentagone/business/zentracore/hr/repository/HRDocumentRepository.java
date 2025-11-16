package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.HRDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HRDocumentRepository extends JpaRepository<HRDocument, Long> {
    List<HRDocument> findByEmployeeId(Long employeeId);
}
