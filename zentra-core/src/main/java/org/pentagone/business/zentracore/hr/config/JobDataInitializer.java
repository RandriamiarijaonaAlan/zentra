package org.pentagone.business.zentracore.hr.config;

import jakarta.annotation.PostConstruct;
import org.pentagone.business.zentracore.hr.entity.Department;
import org.pentagone.business.zentracore.hr.entity.Job;
import org.pentagone.business.zentracore.hr.repository.DepartmentRepository;
import org.pentagone.business.zentracore.hr.repository.JobRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class JobDataInitializer {

    private final DepartmentRepository departmentRepository;
    private final JobRepository jobRepository;

    public JobDataInitializer(DepartmentRepository departmentRepository, JobRepository jobRepository) {
        this.departmentRepository = departmentRepository;
        this.jobRepository = jobRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        if (jobRepository.count() > 0) return; // déjà peuplé (ou alimenté par scripts SQL)

        Department dev = departmentRepository.findByName("Développement");
        if (dev == null) {
            dev = new Department();
            dev.setName("Développement");
            dev.setDescription("Équipe de développement logiciel");
            dev.setAnnualBudget(250000.0);
            dev = departmentRepository.save(dev);
        }

        Department rh = departmentRepository.findByName("Ressources Humaines");
        if (rh == null) {
            rh = new Department();
            rh.setName("Ressources Humaines");
            rh.setDescription("Gestion RH");
            rh.setAnnualBudget(150000.0);
            rh = departmentRepository.save(rh);
        }

        createJobIfMissing("Développeur Backend", "API et logique serveur (Java/Spring)", dev);
        createJobIfMissing("Développeur Frontend", "UI/UX et composants React", dev);
        createJobIfMissing("Chargé de Recrutement", "Gestion des recrutements", rh);
    }

    private void createJobIfMissing(String title, String description, Department dept) {
        boolean exists = jobRepository.findByTitleContainingIgnoreCase(title).stream()
                .anyMatch(j -> j.getTitle().equalsIgnoreCase(title));
        if (!exists) {
            Job j = new Job();
            j.setTitle(title);
            j.setDescription(description);
            j.setDepartment(dept);
            jobRepository.save(j);
        }
    }
}

