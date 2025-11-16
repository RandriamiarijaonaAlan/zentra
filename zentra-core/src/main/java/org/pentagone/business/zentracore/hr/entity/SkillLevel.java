package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Table(name = "skill_level")
@Data
@EqualsAndHashCode(callSuper = true)
public class SkillLevel extends BaseEntity {

    @Column(name = "label", nullable = false, length = 50)
    private String label; // Beginner, Intermediate, Advanced, Expert

    @Column(name = "value", nullable = false, unique = true)
    private Integer value; // 1,2,3,4
}

