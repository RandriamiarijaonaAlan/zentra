package org.pentagone.business.zentracore.hr.dto;

import lombok.Data;
import java.util.List;

@Data
public class TrainingDto {
    private Long id;
    private String title;
    private String description;
    private Integer maxLevelReached;
    private List<Long> targetSkillIds; // IDs of skills targeted by this training
}

