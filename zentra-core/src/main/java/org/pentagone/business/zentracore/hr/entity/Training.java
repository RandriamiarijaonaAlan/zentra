package org.pentagone.business.zentracore.hr.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.pentagone.business.zentracore.common.entity.BaseEntity;

import java.util.List;

@Entity
@Table(name = "training")
@Data
@EqualsAndHashCode(callSuper = true)
public class Training extends BaseEntity {

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_level_reached")
    private Integer maxLevelReached;

    @ManyToMany
    @JoinTable(name = "training_skill",
            joinColumns = @JoinColumn(name = "training_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private List<Skill> targetSkills;
}
