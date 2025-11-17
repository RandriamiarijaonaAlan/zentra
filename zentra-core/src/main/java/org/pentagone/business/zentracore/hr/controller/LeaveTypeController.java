package org.pentagone.business.zentracore.hr.controller;

import lombok.RequiredArgsConstructor;
import org.pentagone.business.zentracore.hr.dto.LeaveTypeDto;
import org.pentagone.business.zentracore.hr.service.LeaveTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    @PostMapping
    public ResponseEntity<LeaveTypeDto> create(@RequestBody LeaveTypeDto dto) {
        return new ResponseEntity<>(leaveTypeService.createLeaveType(dto), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<LeaveTypeDto> update(@RequestBody LeaveTypeDto dto) {
        return ResponseEntity.ok(leaveTypeService.updateLeaveType(dto));
    }

    @GetMapping
    public ResponseEntity<List<LeaveTypeDto>> findAll() {
        return ResponseEntity.ok(leaveTypeService.getAllLeaveTypes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<LeaveTypeDto>> findActive() {
        return ResponseEntity.ok(leaveTypeService.getActiveLeaveTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveTypeDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveTypeService.getLeaveTypeById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leaveTypeService.deleteLeaveType(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        leaveTypeService.activateLeaveType(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        leaveTypeService.deactivateLeaveType(id);
        return ResponseEntity.ok().build();
    }
}

