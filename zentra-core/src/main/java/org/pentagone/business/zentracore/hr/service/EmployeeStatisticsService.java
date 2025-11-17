package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.EmployeeStatisticsDto;

/**
 * Service pour le calcul des statistiques des employés
 */
public interface EmployeeStatisticsService {
    
    /**
     * Calcule les statistiques complètes des employés
     * @return EmployeeStatisticsDto contenant tous les indicateurs
     */
    EmployeeStatisticsDto calculateEmployeeStatistics();
    
    /**
     * Calcule le taux de turnover
     * @return taux de turnover en pourcentage
     */
    Double calculateTurnoverRate();
    
    /**
     * Calcule le taux d'absentéisme
     * @return taux d'absentéisme en pourcentage
     */
    Double calculateAbsenteeismRate();
    
    /**
     * Calcule l'ancienneté moyenne
     * @return ancienneté moyenne en années
     */
    Double calculateAverageSeniority();
}
