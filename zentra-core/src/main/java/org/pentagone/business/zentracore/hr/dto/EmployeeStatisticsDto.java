package org.pentagone.business.zentracore.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO pour les statistiques des employés
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeStatisticsDto {
    
    // Statistiques de base
    private Integer totalEmployees;
    
    // Genre
    private Integer maleCount;
    private Integer femaleCount;
    
    // Tranches d'âge
    private Integer lessThan30;
    private Integer between30And50;
    private Integer moreThan50;
    
    // Services (par Job/Department)
    private Map<String, Integer> serviceStats;
    
    // Types de contrats
    private Map<String, Integer> contractStats;
    
    // Indicateurs clés
    private Double turnoverRate; // pourcentage
    private Double absenteeismRate; // pourcentage
    private Double avgSeniority; // années
    
    // Tendance du turnover (mensuelle)
    private List<Integer> turnoverTrend;
    
    // Statistiques supplémentaires
    private Integer activeEmployees; // Employés actuellement actifs
    private Integer inactiveEmployees; // Employés inactifs
    private Double avgAge; // Âge moyen
    private Double avgSalary; // Salaire moyen
}
