package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.SkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkillLevelRepository extends JpaRepository<SkillLevel, Long> {
    Optional<SkillLevel> findByValue(Integer value);
}

