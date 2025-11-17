package org.pentagone.business.zentracore.hr.service.impl;

import org.pentagone.business.zentracore.hr.dto.EmployeeStatisticsDto;
import org.pentagone.business.zentracore.hr.entity.Employee;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest;
import org.pentagone.business.zentracore.hr.repository.EmployeeRepository;
import org.pentagone.business.zentracore.hr.repository.LeaveRequestRepository;
import org.pentagone.business.zentracore.hr.service.EmployeeStatisticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EmployeeStatisticsServiceImpl implements EmployeeStatisticsService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public EmployeeStatisticsServiceImpl(EmployeeRepository employeeRepository, LeaveRequestRepository leaveRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    public EmployeeStatisticsDto calculateEmployeeStatistics() {
        List<Employee> employees = employeeRepository.findAll();
        LocalDate today = LocalDate.now();

        // Calcul du nombre total d'employés
        int totalEmployees = employees.size();

        // Statistiques par genre (gère M, Male, Homme, etc.)
        int maleCount = (int) employees.stream()
                .filter(e -> e.getGender() != null && (
                    "M".equalsIgnoreCase(e.getGender()) || 
                    "Male".equalsIgnoreCase(e.getGender()) || 
                    "Homme".equalsIgnoreCase(e.getGender()) ||
                    "H".equalsIgnoreCase(e.getGender())
                ))
                .count();
        int femaleCount = (int) employees.stream()
                .filter(e -> e.getGender() != null && (
                    "F".equalsIgnoreCase(e.getGender()) || 
                    "Female".equalsIgnoreCase(e.getGender()) || 
                    "Femme".equalsIgnoreCase(e.getGender())
                ))
                .count();

        // Statistiques par tranche d'âge
        int lessThan30 = (int) employees.stream()
                .filter(e -> e.getBirthDate() != null && calculateAge(e.getBirthDate(), today) < 30)
                .count();
        int between30And50 = (int) employees.stream()
                .filter(e -> {
                    if (e.getBirthDate() == null) return false;
                    int age = calculateAge(e.getBirthDate(), today);
                    return age >= 30 && age <= 50;
                })
                .count();
        int moreThan50 = (int) employees.stream()
                .filter(e -> e.getBirthDate() != null && calculateAge(e.getBirthDate(), today) > 50)
                .count();

        // Statistiques par service (Job)
        Map<String, Integer> serviceStats = employees.stream()
                .filter(e -> e.getJob() != null && e.getJob().getDepartment() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getJob().getDepartment().getName(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        // Statistiques par type de contrat
        Map<String, Integer> contractStats = new HashMap<>();
        // Utilisez contractEndDate pour déterminer le type de contrat
        long cdiCount = employees.stream()
                .filter(e -> e.getContractEndDate() == null || e.getContractEndDate().isAfter(today))
                .count();
        long cddCount = employees.stream()
                .filter(e -> e.getContractEndDate() != null && (e.getContractEndDate().isBefore(today) || e.getContractEndDate().isEqual(today)))
                .count();
        if (cdiCount > 0) contractStats.put("CDI", (int) cdiCount);
        if (cddCount > 0) contractStats.put("CDD", (int) cddCount);

        // Employés actifs (contrat non expiré)
        int activeEmployees = (int) employees.stream()
                .filter(e -> e.getContractEndDate() == null || e.getContractEndDate().isAfter(today))
                .count();
        int inactiveEmployees = totalEmployees - activeEmployees;

        // Âge moyen
        double avgAge = employees.stream()
                .filter(e -> e.getBirthDate() != null)
                .mapToInt(e -> calculateAge(e.getBirthDate(), today))
                .average()
                .orElse(0.0);

        // Salaire moyen
        double avgSalary = employees.stream()
                .filter(e -> e.getBaseSalary() != null)
                .mapToDouble(Employee::getBaseSalary)
                .average()
                .orElse(0.0);

        // Ancienneté moyenne
        double avgSeniority = calculateAverageSeniority();

        // Taux de turnover
        Double turnoverRate = calculateTurnoverRate();

        // Taux d'absentéisme
        Double absenteeismRate = calculateAbsenteeismRate();

        // Tendance du turnover (derniers 12 mois)
        List<Integer> turnoverTrend = calculateTurnoverTrend();

        return EmployeeStatisticsDto.builder()
                .totalEmployees(totalEmployees)
                .maleCount(maleCount)
                .femaleCount(femaleCount)
                .lessThan30(lessThan30)
                .between30And50(between30And50)
                .moreThan50(moreThan50)
                .serviceStats(serviceStats)
                .contractStats(contractStats)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .avgAge(Math.round(avgAge * 100) / 100.0)
                .avgSalary(Math.round(avgSalary * 100) / 100.0)
                .avgSeniority(Math.round(avgSeniority * 100) / 100.0)
                .turnoverRate(turnoverRate)
                .absenteeismRate(absenteeismRate)
                .turnoverTrend(turnoverTrend)
                .build();
    }

    @Override
    public Double calculateTurnoverRate() {
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return 0.0;
        }

        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        
        // Nombre de contrats terminés dans le dernier an (utiliser contractEndDate)
        long terminatedContractsCount = employees.stream()
                .filter(e -> e.getContractEndDate() != null)
                .filter(e -> e.getContractEndDate().isAfter(oneYearAgo) && e.getContractEndDate().isBefore(LocalDate.now()))
                .count();

        // Nombre moyen d'employés actifs dans l'année
        int activeEmployeeCount = (int) employees.stream()
                .filter(e -> e.getContractEndDate() == null || e.getContractEndDate().isAfter(LocalDate.now()))
                .count();

        if (activeEmployeeCount == 0) {
            return 0.0;
        }

        return Math.round(((double) terminatedContractsCount / activeEmployeeCount) * 10000) / 100.0;
    }

    @Override
    public Double calculateAbsenteeismRate() {
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return 0.0;
        }

        LocalDate today = LocalDate.now();
        LocalDate sixMonthsAgo = today.minusMonths(6);

        // Nombre de jours d'absence approuvés dans les 6 derniers mois
        long absentDays = leaveRequestRepository.findAll().stream()
                .filter(lr -> lr.getStatus() == LeaveRequest.LeaveRequestStatus.APPROVED)
                .filter(lr -> lr.getStartDate().isAfter(sixMonthsAgo) && lr.getStartDate().isBefore(today.plusDays(1)))
                .mapToLong(lr -> lr.getDaysRequested().longValue())
                .sum();

        // Nombre total de jours ouvrables (6 mois * 22 jours ouvrables par mois)
        long totalWorkingDays = employees.size() * 6 * 22;

        if (totalWorkingDays == 0) {
            return 0.0;
        }

        return Math.round(((double) absentDays / totalWorkingDays) * 10000) / 100.0;
    }

    @Override
    public Double calculateAverageSeniority() {
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return 0.0;
        }

        LocalDate today = LocalDate.now();
        
        double totalSeniority = employees.stream()
                .filter(e -> e.getHireDate() != null)
                .mapToDouble(e -> {
                    int years = Period.between(e.getHireDate(), today).getYears();
                    int months = Period.between(e.getHireDate(), today).getMonths();
                    return years + (months / 12.0);
                })
                .sum();

        return Math.round((totalSeniority / employees.size()) * 100) / 100.0;
    }

    /**
     * Calcule la tendance du turnover pour les 12 derniers mois
     */
    private List<Integer> calculateTurnoverTrend() {
        List<Integer> trend = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate monthStart = month.atDay(1);
            LocalDate monthEnd = month.atEndOfMonth();

            long contractsTerminatedThisMonth = employeeRepository.findAll().stream()
                    .filter(e -> e.getContract() != null && e.getContract().getEndDate() != null)
                    .filter(e -> !e.getContract().getEndDate().isBefore(monthStart) && !e.getContract().getEndDate().isAfter(monthEnd))
                    .count();

            trend.add((int) contractsTerminatedThisMonth);
        }

        return trend;
    }

    /**
     * Calcule l'âge en années
     */
    private int calculateAge(LocalDate birthDate, LocalDate referenceDate) {
        return Period.between(birthDate, referenceDate).getYears();
    }
}
