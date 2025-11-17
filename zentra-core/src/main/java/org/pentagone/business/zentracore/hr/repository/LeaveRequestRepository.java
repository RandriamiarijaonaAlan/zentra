package org.pentagone.business.zentracore.hr.repository;

import org.pentagone.business.zentracore.hr.entity.LeaveRequest;
import org.pentagone.business.zentracore.hr.entity.LeaveRequest.LeaveRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, String status);

    List<LeaveRequest> findByStatus(String status);
    

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequestStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.status = 'APPROVED' AND lr.endDate >= :fromDate ORDER BY lr.startDate ASC")
    List<LeaveRequest> findUpcomingApprovedLeaves(@Param("employeeId") Long employeeId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.startDate <= :endDate AND lr.endDate >= :startDate AND lr.status IN ('APPROVED','PENDING') AND (:excludeEmployeeId IS NULL OR lr.employee.id <> :excludeEmployeeId)")
    List<LeaveRequest> findOverlappingLeaves(@Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             @Param("excludeEmployeeId") Long excludeEmployeeId);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.leaveType.id = :leaveTypeId AND lr.status IN ('APPROVED','PENDING') AND lr.startDate BETWEEN :startYear AND :endYear")
    List<LeaveRequest> findByEmployeeAndLeaveTypeAndYear(@Param("employeeId") Long employeeId,
                                                         @Param("leaveTypeId") Long leaveTypeId,
                                                         @Param("startYear") LocalDate startYear,
                                                         @Param("endYear") LocalDate endYear);

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.leaveType.id = :leaveTypeId AND lr.status IN ('APPROVED','PENDING') AND lr.startDate <= :endDate AND lr.endDate >= :startDate")
    long countOverlappingByType(@Param("leaveTypeId") Long leaveTypeId,
                               @Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.startDate <= :endDate AND lr.endDate >= :startDate AND lr.status IN ('APPROVED','PENDING')")
    List<LeaveRequest> findEmployeeOverlappingLeaves(@Param("employeeId") Long employeeId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.id <> :excludeRequestId AND lr.startDate <= :endDate AND lr.endDate >= :startDate AND lr.status IN ('APPROVED','PENDING')")
    List<LeaveRequest> findEmployeeOverlappingLeavesExcluding(@Param("employeeId") Long employeeId,
                                                              @Param("excludeRequestId") Long excludeRequestId,
                                                              @Param("startDate") LocalDate startDate,
                                                              @Param("endDate") LocalDate endDate);
}
