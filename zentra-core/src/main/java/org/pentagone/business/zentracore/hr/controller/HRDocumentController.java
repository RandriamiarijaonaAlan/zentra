package org.pentagone.business.zentracore.hr.controller;

import org.pentagone.business.zentracore.hr.dto.HRDocumentDto;
import org.pentagone.business.zentracore.hr.service.HRDocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/hr-documents")
public class HRDocumentController {

    private final HRDocumentService hrDocumentService;

    public HRDocumentController(HRDocumentService hrDocumentService) {
        this.hrDocumentService = hrDocumentService;
    }

    @PostMapping
    public ResponseEntity<HRDocumentDto> upload(@RequestBody HRDocumentDto dto) {
        return new ResponseEntity<>(hrDocumentService.upload(dto), HttpStatus.CREATED);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<HRDocumentDto>> listByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(hrDocumentService.listByEmployee(employeeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hrDocumentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<HRDocumentDto> uploadFile(@RequestParam("employeeId") Long employeeId,
                                                    @RequestParam("docType") String docType,
                                                    @RequestParam("file") MultipartFile file) throws Exception {
        Path uploadDir = Paths.get("uploads/hr-docs");
        Files.createDirectories(uploadDir);
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path destination = uploadDir.resolve(filename);
        file.transferTo(destination.toFile());
        HRDocumentDto dto = new HRDocumentDto();
        dto.setEmployeeId(employeeId);
        dto.setDocType(docType);
        dto.setFilePath(destination.toString().replace('\\','/'));
        return new ResponseEntity<>(hrDocumentService.upload(dto), HttpStatus.CREATED);
    }
}
