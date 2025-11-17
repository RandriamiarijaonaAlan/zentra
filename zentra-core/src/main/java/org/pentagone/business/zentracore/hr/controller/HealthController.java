package org.pentagone.business.zentracore.hr.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("message", "Zentra Core API is running");
        return ResponseEntity.ok(health);
    }

    @GetMapping("/leave-management")
    public ResponseEntity<Map<String, Object>> leaveManagementHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("module", "Leave Management");
        health.put("message", "Leave Management endpoints are available");
        return ResponseEntity.ok(health);
    }
}
