package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.TrainingDto;
import org.pentagone.business.zentracore.hr.service.TrainingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trainings")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @PostMapping
    public ResponseEntity<TrainingDto> create(@RequestBody TrainingDto dto) {
        return new ResponseEntity<>(trainingService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<TrainingDto> update(@RequestBody TrainingDto dto) {
        return ResponseEntity.ok(trainingService.update(dto));
    }

    @GetMapping
    public ResponseEntity<List<TrainingDto>> findAll() {
        return ResponseEntity.ok(trainingService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trainingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<TrainingDto>> suggestions(@RequestParam Long employeeId) {
        return ResponseEntity.ok(trainingService.suggestTrainingsForEmployee(employeeId));
    }
}

