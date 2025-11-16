package org.pentagone.business.zentracore.hr.service;

import org.pentagone.business.zentracore.hr.dto.DepartmentDto;
import java.util.List;

public interface DepartmentService {
    List<DepartmentDto> getDepartments();
}

