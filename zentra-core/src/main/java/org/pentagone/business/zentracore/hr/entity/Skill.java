package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

@Entity
@Table(name = "skill")
@Data
@EqualsAndHashCode(callSuper = true)
public class Skill extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Added category to classify the skill (e.g. TECHNICAL, BEHAVIORAL, BUSINESS)
    @Column(name = "category", length = 50)
    private String category;
}
