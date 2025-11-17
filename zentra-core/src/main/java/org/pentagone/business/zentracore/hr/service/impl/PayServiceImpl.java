package org.pentagone.business.zentracore.hr.service.impl;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.pentagone.business.zentracore.common.exception.EntityNotFoundException;
import org.pentagone.business.zentracore.hr.dto.*;
import org.pentagone.business.zentracore.hr.entity.*;
import org.pentagone.business.zentracore.hr.mapper.BonusMapper;
import org.pentagone.business.zentracore.hr.mapper.PayStubMapper;
import org.pentagone.business.zentracore.hr.mapper.SalaryAdvanceMapper;
import org.pentagone.business.zentracore.hr.repository.*;
import org.pentagone.business.zentracore.hr.service.ContributionService;
import org.pentagone.business.zentracore.hr.service.PayService;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Period;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PayServiceImpl implements PayService {
    private final EmployeeRepository employeeRepository;
    private final SalaryAdvanceRepository salaryAdvanceRepository;
    private final BonusRepository bonusRepository;
    private final OvertimeRateRepository overtimeRateRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final PayStubRepository payStubRepository;
    private final SalaryAdvanceMapper salaryAdvanceMapper;
    private final BonusMapper bonusMapper;
    private final PayStubMapper payStubMapper;
    private final ContributionService contributionService;

    public PayServiceImpl(EmployeeRepository employeeRepository, SalaryAdvanceRepository salaryAdvanceRepository, BonusRepository bonusRepository, OvertimeRateRepository overtimeRateRepository, TimeEntryRepository timeEntryRepository, PayStubRepository payStubRepository, SalaryAdvanceMapper salaryAdvanceMapper, BonusMapper bonusMapper, PayStubMapper payStubMapper, ContributionService contributionService) {
        this.employeeRepository = employeeRepository;
        this.salaryAdvanceRepository = salaryAdvanceRepository;
        this.bonusRepository = bonusRepository;
        this.overtimeRateRepository = overtimeRateRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.payStubRepository = payStubRepository;
        this.salaryAdvanceMapper = salaryAdvanceMapper;
        this.bonusMapper = bonusMapper;
        this.payStubMapper = payStubMapper;
        this.contributionService = contributionService;
    }

    @Override
    public PayStubDto generatePayStubByEmployeeIdAndYearMonth(Long employeeId, YearMonth yearMonth) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with ID: " + employeeId));
        if (yearMonth == null) throw new IllegalArgumentException("YearMonth must be provided");

        PayStub payStub = new PayStub();

        payStub.setDate(yearMonth.atEndOfMonth());
        payStub.setEmployee(employee);
        payStub.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        payStub.setEmployeeNumber(employee.getEmployeeNumber());
        payStub.setJobTitle(employee.getJob().getTitle());
        payStub.setCnapsNumber(employee.getCnapsNumber());
        payStub.setHireDate(employee.getHireDate());
        Period period = Period.between(employee.getHireDate(), yearMonth.atEndOfMonth());
        payStub.setSeniority(period.getYears() + " ans, " + period.getMonths() + " mois, " + period.getDays() + " jours");

        payStub.setClassification(String.valueOf(employee.getJob().getTitle().charAt(0)));
        payStub.setBaseSalary(employee.getBaseSalary());
        payStub.setDayRate(employee.getBaseSalary() / 30);
        payStub.setHourRate(employee.getBaseSalary() / 173.33);
        payStub.setSalaryIndex(payStub.getHourRate() / 1.334);

        List<SalaryComponent> salaryComponents = new ArrayList<>();
        salaryComponents.add(new SalaryComponent("Salaire du " + payStub.getDate(), "1 mois", payStub.getDayRate(), payStub.getBaseSalary()));
        salaryComponents.add(new SalaryComponent("Abscence deductible", null, payStub.getDayRate(), null));
        salaryComponents.add(new SalaryComponent("Prime de randement"));
        salaryComponents.add(new SalaryComponent("Prime d'anciennete'"));
        List<OvertimeRate> overtimeRates = overtimeRateRepository.findAllOrderByRate();
        List<TimeEntry> timeEntries = timeEntryRepository.findRange(employeeId, yearMonth.atDay(1), yearMonth.atEndOfMonth());
        int overtime = timeEntries.stream()
                .filter(te -> te.getOvertimeHours() != null)
                .mapToInt(te -> te.getOvertimeHours().intValue())
                .sum();
        for (OvertimeRate overtimeRate : overtimeRates) {
            Integer number = overtime > overtimeRate.getMinHours() ? Math.min(overtimeRate.getMaxHours(), overtime) - overtimeRate.getMinHours() : null;
            Double rate = payStub.getHourRate() * (1 + overtimeRate.getRate() / 100);
            salaryComponents.add(new SalaryComponent (
                    "Heures sup majorees de " + overtimeRate.getRate() + " %",
                    number == null ? null : number + " heures",
                    rate,
                    number == null ? null : Math.round(rate * number * 100.0) / 100.0
            ));
        }
        salaryComponents.add(new SalaryComponent("Majoration pour heure de nuit"));
        List<Bonus> bonuses = bonusRepository.findAllByEmployeeIdAndDate(employeeId, yearMonth);
        salaryComponents.add(new SalaryComponent("Prime divers", null, null, bonuses.stream().mapToDouble(Bonus::getAmount).sum()));
        salaryComponents.add(new SalaryComponent("Rappel sur periode anterieur"));
        salaryComponents.add(new SalaryComponent("Droit de conge", null, payStub.getDayRate(), null));
        salaryComponents.add(new SalaryComponent("Droit de preavis", null, payStub.getDayRate(), null));
        salaryComponents.add(new SalaryComponent("Indemnite de licenciment", null, payStub.getDayRate(), null));
        payStub.setSalaryComponents(salaryComponents);
        payStub.setGrossSalary(salaryComponents.stream().mapToDouble(s -> Optional.ofNullable(s.getAmount()).orElse(0.0)).sum());
        double taxableIncome = payStub.getGrossSalary();

        List<SalaryDeduction> salaryDeductions = new ArrayList<>();
        CnapsRateDto cnapsRateDto = contributionService.getFirstCnapsRate();
        salaryDeductions.add(new SalaryDeduction("Retenu CNAPS " + cnapsRateDto.getRate() + " %", cnapsRateDto.getRate(),
                Math.min(cnapsRateDto.getCeilingAmount(), payStub.getGrossSalary() * cnapsRateDto.getRate() / 100)));
        taxableIncome -= salaryDeductions.get(0).getAmount();
        OstieRateDto ostieRateDto = contributionService.getFirstOstieRate();
        salaryDeductions.add(new SalaryDeduction("Retenu OSTIE " + ostieRateDto.getRate() + " %", ostieRateDto.getRate(),
                payStub.getGrossSalary() * cnapsRateDto.getRate() / 100));
        taxableIncome -= salaryDeductions.get(1).getAmount();
        double irsaDeduction = 0.0;
        List<IrsaRateDto> irsaRates = contributionService.getIrsaRates();
        for (IrsaRateDto irsaRate : irsaRates) {
            double minIncome = irsaRate.getMinIncome() == null ? 0.0 : irsaRate.getMinIncome();
            double maxIncome = irsaRate.getMaxIncome() == null ? Double.MAX_VALUE : irsaRate.getMaxIncome();
            Double amount = taxableIncome > minIncome ? Math.min(maxIncome, irsaRate.getAmount() * irsaRate.getRate() / 100) : null;
            String designation = irsaRate.getMinIncome() == null ? "TRANCHE IRSA INF " + irsaRate.getMaxIncome() :
                                irsaRate.getMaxIncome() == null ? "TRANCHE IRSA SUP " + irsaRate.getMinIncome() :
                            "TRANCHE IRSA DE " + irsaRate.getMinIncome() + " A " + irsaRate.getMaxIncome();
            salaryDeductions.add(new SalaryDeduction(designation, irsaRate.getRate(), amount));
            if (amount != null) irsaDeduction += amount;
        }
        payStub.setSalaryDeductions(salaryDeductions);
        payStub.setSumDeductions(salaryDeductions.stream().mapToDouble(s -> Optional.ofNullable(s.getAmount()).orElse(0.0)).sum());
        payStub.setNetSalary(payStub.getGrossSalary() - payStub.getSumDeductions());

        payStub.setIrsaDeduction(irsaDeduction);
        payStub.setTaxableIncome(taxableIncome);

        payStub.setPayingMethod("Virement / Cheque");
        payStub.setFilepath("documents/paystubs/" + employee.getEmployeeNumber() + "_" + yearMonth + ".pdf");

        payStub.getSalaryComponents().forEach(s -> s.setPayStub(payStub));
        payStub.getSalaryDeductions().forEach(d -> d.setPayStub(payStub));
        PayStub savedPayStub = payStubRepository.save(payStub);

        // Générer le PDF
        try {
            generatePdf(savedPayStub, savedPayStub.getFilepath());
            generateExcel(savedPayStub, savedPayStub.getFilepath().replace(".pdf", ".xlsx"));
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }

        return payStubMapper.toDto(savedPayStub);
    }

    @Override
    public PayStubDto getPayStubByEmployeeIdAndYearMonth(Long employeeId, YearMonth yearMonth) {
        return payStubMapper.toDto(payStubRepository.findByEmployeeIdAndDate(employeeId, yearMonth.atEndOfMonth())
                .orElseThrow(() -> new EntityNotFoundException("Pay stub not found for employee ID: " + employeeId + " and YearMonth: " + yearMonth)));
    }

    @Override
    public BonusDto createBonus(BonusDto bonusDto) {
        Bonus bonus = bonusMapper.toEntity(bonusDto);
        if (bonus.getId() != null) throw new IllegalArgumentException("New bonus cannot already have an ID");
        if (bonus.getEmployee() == null) throw new IllegalArgumentException("Bonus must be associated with an employee");
        if (bonus.getAmount() == null || bonus.getAmount() <= 0) throw new IllegalArgumentException("Bonus amount must be positive");
        if (bonus.getDate() == null) throw new IllegalArgumentException("Bonus date must be provided");
        return bonusMapper.toDto(bonusRepository.save(bonus));
    }

    @Override
    public SalaryAdvanceDto createSalaryAdvance(SalaryAdvanceDto salaryAdvanceDto) {
        SalaryAdvance salaryAdvance = salaryAdvanceMapper.toEntity(salaryAdvanceDto);
        if (salaryAdvance.getId() != null) throw new IllegalArgumentException("New salary advance cannot already have an ID");
        if (salaryAdvance.getEmployee() == null) throw new IllegalArgumentException("Salary advance must be associated with an employee");
        if (salaryAdvance.getAmount() == null || salaryAdvance.getAmount() <= 0) throw new IllegalArgumentException("Salary advance amount must be positive");
        if (salaryAdvance.getDate() == null) throw new IllegalArgumentException("Salary advance date must be provided");
        salaryAdvance.setStatus("PENDING");
        return salaryAdvanceMapper.toDto(salaryAdvanceRepository.save(salaryAdvance));
    }

    @Override
    public SalaryAdvanceDto validateSalaryAdvance(Long salaryAdvanceId) {
        SalaryAdvance salaryAdvance = salaryAdvanceRepository.findById(salaryAdvanceId)
                .orElseThrow(() -> new EntityNotFoundException("Salary advance not found with ID: " + salaryAdvanceId));
        if (!salaryAdvance.getStatus().equals("PENDING")) throw new IllegalArgumentException("Salary advance status is not PENDING");
        salaryAdvance.setStatus("APPROVED");
        return salaryAdvanceMapper.toDto(salaryAdvanceRepository.save(salaryAdvance));
    }

    @Override
    public SalaryAdvanceDto rejectSalaryAdvance(Long salaryAdvanceId) {
        SalaryAdvance salaryAdvance = salaryAdvanceRepository.findById(salaryAdvanceId)
                .orElseThrow(() -> new EntityNotFoundException("Salary advance not found with ID: " + salaryAdvanceId));
        if (!salaryAdvance.getStatus().equals("PENDING")) throw new IllegalArgumentException("Salary advance status is not PENDING");
        salaryAdvance.setStatus("REJECTED");
        return salaryAdvanceMapper.toDto(salaryAdvanceRepository.save(salaryAdvance));
    }

    @Override
    public List<BonusDto> getAllBonuses() {
        return bonusRepository.findAll().stream().map(bonusMapper::toDto).toList();
    }

    @Override
    public List<SalaryAdvanceDto> getAllSalaryAdvances() {
        return salaryAdvanceRepository.findAll().stream().map(salaryAdvanceMapper::toDto).toList();
    }

    /**
     * Génère un PDF professionnel de fiche de paie avec iText 7
     * Format compact et formel conforme aux standards des bulletins de salaire
     */
    private void generatePdf(PayStub payStub, String filepath) throws FileNotFoundException {
        // Couleurs professionnelles
        DeviceRgb headerBg = new DeviceRgb(45, 55, 72); // Gris foncé professionnel
        DeviceRgb borderColor = new DeviceRgb(200, 200, 200); // Gris clair pour bordures
        DeviceRgb lightGray = new DeviceRgb(245, 245, 245); // Fond gris très clair

        // Créer le dossier si nécessaire
        File file = new File(filepath);
        if (file.getParentFile() != null && !file.getParentFile().exists()) {
            boolean created = file.getParentFile().mkdirs();
            if (!created) {
                throw new RuntimeException("Impossible de créer le dossier: " + file.getParentFile().getAbsolutePath());
            }
        }

        PdfWriter writer = new PdfWriter(filepath);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);
        document.setMargins(30, 30, 30, 30);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // HEADER compact
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(10);

        Cell companyCell = new Cell()
                .add(new Paragraph("ENTREPRISE")
                        .setFontSize(10)
                        .setBold())
                .add(new Paragraph("ZENTRA")
                        .setFontSize(12)
                        .setBold())
                .add(new Paragraph("Adresse entreprise")
                        .setFontSize(8))
                .setPadding(8)
                .setBorder(new SolidBorder(borderColor, 1));

        Cell titleCell = new Cell()
                .add(new Paragraph("BULLETIN DE PAIE")
                        .setFontSize(14)
                        .setBold()
                        .setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("Période: " + payStub.getDate().format(formatter))
                        .setFontSize(9)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(3))
                .setPadding(8)
                .setBorder(new SolidBorder(borderColor, 1));

        headerTable.addCell(companyCell);
        headerTable.addCell(titleCell);
        document.add(headerTable);

        // SECTION INFORMATIONS EMPLOYÉ - Format compact 4 colonnes
        Table employeeTable = new Table(UnitValue.createPercentArray(new float[]{1.2f, 1.8f, 1.2f, 1.8f}))
                .useAllAvailableWidth()
                .setMarginBottom(8)
                .setMarginTop(8);

        addCompactRow(employeeTable, "Nom et Prénom:", payStub.getEmployeeName(), "Matricule:", payStub.getEmployeeNumber(), borderColor);
        addCompactRow(employeeTable, "Poste:", payStub.getJobTitle(), "Classification:", payStub.getClassification(), borderColor);
        addCompactRow(employeeTable, "Date d'embauche:", payStub.getHireDate().format(dateFormatter), "Ancienneté:", payStub.getSeniority(), borderColor);
        addCompactRow(employeeTable, "N° CNAPS:", String.valueOf(payStub.getCnapsNumber()), "Salaire de base:", formatCurrency(payStub.getBaseSalary()), borderColor);

        document.add(employeeTable);

        // TABLEAU PRINCIPAL - GAINS ET RETENUES côte à côte
        Table mainTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth()
                .setMarginTop(8);

        // COLONNE GAUCHE - GAINS
        Table gainsTable = new Table(UnitValue.createPercentArray(new float[]{3f, 1f, 1f, 1.3f}))
                .useAllAvailableWidth();

        // Header gains
        Cell gainsHeader = new Cell(1, 4)
                .add(new Paragraph("GAINS")
                        .setFontSize(9)
                        .setBold()
                        .setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(headerBg)
                .setPadding(4)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(borderColor, 1));
        gainsTable.addCell(gainsHeader);

        gainsTable.addCell(createCompactHeaderCell("Désignation", borderColor));
        gainsTable.addCell(createCompactHeaderCell("Nombre", borderColor));
        gainsTable.addCell(createCompactHeaderCell("Taux", borderColor));
        gainsTable.addCell(createCompactHeaderCell("Montant", borderColor));

        // Lignes des gains (uniquement ceux avec montant)
        for (SalaryComponent component : payStub.getSalaryComponents()) {
            gainsTable.addCell(createCompactDataCell(component.getDesignation(), false, borderColor));
            gainsTable.addCell(createCompactDataCell(component.getNumber() != null ? component.getNumber() : "-", true, borderColor));
            gainsTable.addCell(createCompactDataCell(component.getRate() != null ? formatCompactCurrency(component.getRate()) : "-", true, borderColor));
            gainsTable.addCell(createCompactDataCell(formatCompactCurrency(component.getAmount()), true, borderColor));
        }

        // Total brut
        Cell totalBrutLabel = new Cell(1, 3)
                .add(new Paragraph("TOTAL BRUT")
                        .setFontSize(8)
                        .setBold())
                .setBackgroundColor(lightGray)
                .setPadding(4)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(borderColor, 1));

        Cell totalBrutValue = new Cell()
                .add(new Paragraph(formatCompactCurrency(payStub.getGrossSalary()))
                        .setFontSize(8)
                        .setBold())
                .setBackgroundColor(lightGray)
                .setPadding(4)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(borderColor, 1));

        gainsTable.addCell(totalBrutLabel);
        gainsTable.addCell(totalBrutValue);

        // COLONNE DROITE - RETENUES
        Table deductionsTable = new Table(UnitValue.createPercentArray(new float[]{3f, 1f, 1.3f}))
                .useAllAvailableWidth();

        // Header retenues
        Cell deductionsHeader = new Cell(1, 3)
                .add(new Paragraph("RETENUES")
                        .setFontSize(9)
                        .setBold()
                        .setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(headerBg)
                .setPadding(4)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(borderColor, 1));
        deductionsTable.addCell(deductionsHeader);

        deductionsTable.addCell(createCompactHeaderCell("Désignation", borderColor));
        deductionsTable.addCell(createCompactHeaderCell("Taux", borderColor));
        deductionsTable.addCell(createCompactHeaderCell("Montant", borderColor));

        // Lignes des retenues (uniquement celles avec montant)
        for (SalaryDeduction deduction : payStub.getSalaryDeductions()) {
            deductionsTable.addCell(createCompactDataCell(deduction.getDesignation(), false, borderColor));
            deductionsTable.addCell(createCompactDataCell(deduction.getRate() != null ? deduction.getRate() + "%" : "-", true, borderColor));
            deductionsTable.addCell(createCompactDataCell(formatCompactCurrency(deduction.getAmount()), true, borderColor));
        }

        // Total retenues
        Cell totalRetLabel = new Cell(1, 2)
                .add(new Paragraph("TOTAL RETENUES")
                        .setFontSize(8)
                        .setBold())
                .setBackgroundColor(lightGray)
                .setPadding(4)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(borderColor, 1));

        Cell totalRetValue = new Cell()
                .add(new Paragraph(formatCompactCurrency(payStub.getSumDeductions()))
                        .setFontSize(8)
                        .setBold())
                .setBackgroundColor(lightGray)
                .setPadding(4)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(borderColor, 1));

        deductionsTable.addCell(totalRetLabel);
        deductionsTable.addCell(totalRetValue);

        // Ajouter les deux tables côte à côte
        mainTable.addCell(new Cell().add(gainsTable).setPadding(0).setBorder(Border.NO_BORDER));
        mainTable.addCell(new Cell().add(deductionsTable).setPadding(0).setBorder(Border.NO_BORDER));
        document.add(mainTable);

        // SECTION NET À PAYER - Compact et professionnel
        Table netTable = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
                .useAllAvailableWidth()
                .setMarginTop(10)
                .setMarginBottom(8);

        Cell netLabel = new Cell()
                .add(new Paragraph("NET À PAYER")
                        .setFontSize(11)
                        .setBold())
                .setBackgroundColor(headerBg)
                .setFontColor(ColorConstants.WHITE)
                .setPadding(8)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(borderColor, 2));

        Cell netValue = new Cell()
                .add(new Paragraph(formatCompactCurrency(payStub.getNetSalary()))
                        .setFontSize(12)
                        .setBold())
                .setBackgroundColor(lightGray)
                .setPadding(8)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(new SolidBorder(borderColor, 2));

        netTable.addCell(netLabel);
        netTable.addCell(netValue);
        document.add(netTable);

        // INFORMATIONS FISCALES - Compact
        Table fiscalTable = new Table(UnitValue.createPercentArray(new float[]{2f, 1.5f, 2f, 1.5f}))
                .useAllAvailableWidth()
                .setMarginTop(8);

        addCompactRow(fiscalTable, "Revenu imposable:", formatCompactCurrency(payStub.getTaxableIncome()),
                      "IRSA retenu:", formatCompactCurrency(payStub.getIrsaDeduction()), borderColor);
        addCompactRow(fiscalTable, "Mode de paiement:", payStub.getPayingMethod(),
                      "Date de paiement:", payStub.getDate().format(dateFormatter), borderColor);

        document.add(fiscalTable);

        // FOOTER compact
        document.add(new Paragraph("Document généré automatiquement - Ne nécessite pas de signature")
                .setFontSize(7)
                .setFontColor(new DeviceRgb(128, 128, 128))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(15));

        document.close();
    }

    /**
     * Génère un fichier Excel professionnel de fiche de paie avec Apache POI
     * Format compact et formel conforme aux standards des bulletins de salaire
     */
    private void generateExcel(PayStub payStub, String filepath) throws IOException {
        // Créer le dossier si nécessaire
        File file = new File(filepath);
        if (file.getParentFile() != null && !file.getParentFile().exists()) {
            boolean created = file.getParentFile().mkdirs();
            if (!created) {
                throw new RuntimeException("Impossible de créer le dossier: " + file.getParentFile().getAbsolutePath());
            }
        }

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Fiche de Paie");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // Styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle labelStyle = createLabelStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle totalStyle = createTotalStyle(workbook);
        CellStyle netPayStyle = createNetPayStyle(workbook);
        CellStyle footerStyle = createFooterStyle(workbook);

        int rowNum = 0;

        // HEADER - Titre principal
        Row titleRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BULLETIN DE PAIE");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 7));

        // Période
        Row periodRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell periodCell = periodRow.createCell(0);
        periodCell.setCellValue("Période: " + payStub.getDate().format(formatter));
        periodCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 7));

        rowNum++; // Ligne vide

        // SECTION ENTREPRISE
        Row companyRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell companyCell = companyRow.createCell(0);
        companyCell.setCellValue("ENTREPRISE: ZENTRA");
        companyCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

        rowNum++; // Ligne vide

        // SECTION INFORMATIONS EMPLOYÉ
        Row empHeaderRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell empHeaderCell = empHeaderRow.createCell(0);
        empHeaderCell.setCellValue("INFORMATIONS EMPLOYÉ");
        empHeaderCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 7));

        // Nom et Matricule
        Row empRow1 = sheet.createRow(rowNum++);
        createLabelValueCells(empRow1, 0, "Nom et Prénom:", payStub.getEmployeeName(), labelStyle, dataStyle);
        createLabelValueCells(empRow1, 4, "Matricule:", payStub.getEmployeeNumber(), labelStyle, dataStyle);

        // Poste et Classification
        Row empRow2 = sheet.createRow(rowNum++);
        createLabelValueCells(empRow2, 0, "Poste:", payStub.getJobTitle(), labelStyle, dataStyle);
        createLabelValueCells(empRow2, 4, "Classification:", payStub.getClassification(), labelStyle, dataStyle);

        // Date embauche et Ancienneté
        Row empRow3 = sheet.createRow(rowNum++);
        createLabelValueCells(empRow3, 0, "Date d'embauche:", payStub.getHireDate().format(dateFormatter), labelStyle, dataStyle);
        createLabelValueCells(empRow3, 4, "Ancienneté:", payStub.getSeniority(), labelStyle, dataStyle);

        // CNAPS et Salaire de base
        Row empRow4 = sheet.createRow(rowNum++);
        createLabelValueCells(empRow4, 0, "N° CNAPS:", String.valueOf(payStub.getCnapsNumber()), labelStyle, dataStyle);
        createLabelValueCells(empRow4, 4, "Salaire de base:", formatCurrency(payStub.getBaseSalary()), labelStyle, dataStyle);

        rowNum++; // Ligne vide

        // SECTION GAINS
        Row gainsHeaderRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell gainsHeaderCell = gainsHeaderRow.createCell(0);
        gainsHeaderCell.setCellValue("GAINS");
        gainsHeaderCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

        // Headers colonnes gains
        Row gainsColHeaderRow = sheet.createRow(rowNum++);
        String[] gainsHeaders = {"Désignation", "Nombre", "Taux", "Montant"};
        for (int i = 0; i < gainsHeaders.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = gainsColHeaderRow.createCell(i);
            cell.setCellValue(gainsHeaders[i]);
            cell.setCellStyle(labelStyle);
        }

        // Lignes des gains
        for (SalaryComponent component : payStub.getSalaryComponents()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(component.getDesignation());
            row.getCell(0).setCellStyle(dataStyle);

            org.apache.poi.ss.usermodel.Cell numberCell = row.createCell(1);
            numberCell.setCellValue(component.getNumber() != null ? component.getNumber() : "-");
            numberCell.setCellStyle(dataStyle);

            org.apache.poi.ss.usermodel.Cell rateCell = row.createCell(2);
            if (component.getRate() != null) {
                rateCell.setCellValue(component.getRate());
                rateCell.setCellStyle(currencyStyle);
            } else {
                rateCell.setCellValue("-");
                rateCell.setCellStyle(dataStyle);
            }

            org.apache.poi.ss.usermodel.Cell amountCell = row.createCell(3);
            if (component.getAmount() != null) {
                amountCell.setCellValue(component.getAmount());
                amountCell.setCellStyle(currencyStyle);
            } else {
                amountCell.setCellValue("");
                amountCell.setCellStyle(dataStyle);
            }
        }

        // Total brut
        Row totalBrutRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell totalBrutLabelCell = totalBrutRow.createCell(0);
        totalBrutLabelCell.setCellValue("TOTAL BRUT");
        totalBrutLabelCell.setCellStyle(totalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 2));

        org.apache.poi.ss.usermodel.Cell totalBrutValueCell = totalBrutRow.createCell(3);
        totalBrutValueCell.setCellValue(payStub.getGrossSalary());
        totalBrutValueCell.setCellStyle(totalStyle);

        rowNum++; // Ligne vide

        // SECTION RETENUES
        Row deductionsHeaderRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell deductionsHeaderCell = deductionsHeaderRow.createCell(0);
        deductionsHeaderCell.setCellValue("RETENUES");
        deductionsHeaderCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

        // Headers colonnes retenues
        Row deductionsColHeaderRow = sheet.createRow(rowNum++);
        String[] deductionsHeaders = {"Désignation", "Taux", "Montant"};
        for (int i = 0; i < deductionsHeaders.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = deductionsColHeaderRow.createCell(i);
            cell.setCellValue(deductionsHeaders[i]);
            cell.setCellStyle(labelStyle);
        }

        // Lignes des retenues
        for (SalaryDeduction deduction : payStub.getSalaryDeductions()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(deduction.getDesignation());
            row.getCell(0).setCellStyle(dataStyle);

            org.apache.poi.ss.usermodel.Cell rateCell = row.createCell(1);
            rateCell.setCellValue(deduction.getRate() != null ? deduction.getRate() + "%" : "-");
            rateCell.setCellStyle(dataStyle);

            org.apache.poi.ss.usermodel.Cell amountCell = row.createCell(2);
            amountCell.setCellValue(deduction.getAmount() != null ? deduction.getAmount() : 0.0);
            amountCell.setCellStyle(currencyStyle);
        }

        // Total retenues
        Row totalDeductionsRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell totalDeductionsLabelCell = totalDeductionsRow.createCell(0);
        totalDeductionsLabelCell.setCellValue("TOTAL RETENUES");
        totalDeductionsLabelCell.setCellStyle(totalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 1));

        org.apache.poi.ss.usermodel.Cell totalDeductionsValueCell = totalDeductionsRow.createCell(2);
        totalDeductionsValueCell.setCellValue(payStub.getSumDeductions());
        totalDeductionsValueCell.setCellStyle(totalStyle);

        rowNum++; // Ligne vide

        // NET À PAYER
        Row netPayRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell netPayLabelCell = netPayRow.createCell(0);
        netPayLabelCell.setCellValue("NET À PAYER");
        netPayLabelCell.setCellStyle(netPayStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 2));

        org.apache.poi.ss.usermodel.Cell netPayValueCell = netPayRow.createCell(3);
        netPayValueCell.setCellValue(payStub.getNetSalary());
        netPayValueCell.setCellStyle(netPayStyle);

        rowNum++; // Ligne vide

        // INFORMATIONS FISCALES
        Row fiscalHeaderRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell fiscalHeaderCell = fiscalHeaderRow.createCell(0);
        fiscalHeaderCell.setCellValue("INFORMATIONS FISCALES");
        fiscalHeaderCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 7));

        Row fiscalRow1 = sheet.createRow(rowNum++);
        createLabelValueCells(fiscalRow1, 0, "Revenu imposable:", formatCurrency(payStub.getTaxableIncome()), labelStyle, dataStyle);
        createLabelValueCells(fiscalRow1, 4, "IRSA retenu:", formatCurrency(payStub.getIrsaDeduction()), labelStyle, dataStyle);

        Row fiscalRow2 = sheet.createRow(rowNum++);
        createLabelValueCells(fiscalRow2, 0, "Mode de paiement:", payStub.getPayingMethod(), labelStyle, dataStyle);
        createLabelValueCells(fiscalRow2, 4, "Date de paiement:", payStub.getDate().format(dateFormatter), labelStyle, dataStyle);

        rowNum++; // Ligne vide

        // FOOTER
        Row footerRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell footerCell = footerRow.createCell(0);
        footerCell.setCellValue("Document généré automatiquement - Ne nécessite pas de signature");
        footerCell.setCellStyle(footerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 7));

        // Ajuster la largeur des colonnes
        for (int i = 0; i < 8; i++) {
            sheet.autoSizeColumn(i);
            // Ajouter un peu de padding
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }

        // Écrire le fichier
        try (FileOutputStream fileOut = new FileOutputStream(filepath)) {
            workbook.write(fileOut);
        }
        workbook.close();
    }

    // Méthodes utilitaires pour le PDF compact et professionnel
    private Cell createCompactHeaderCell(String text, DeviceRgb borderColor) {
        return new Cell()
                .add(new Paragraph(text)
                        .setFontSize(7)
                        .setBold())
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(3)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(borderColor, 0.5f));
    }

    private Cell createCompactDataCell(String text, boolean rightAlign, DeviceRgb borderColor) {
        Cell cell = new Cell()
                .add(new Paragraph(text != null ? text : "-")
                        .setFontSize(7))
                .setPadding(3)
                .setBorder(new SolidBorder(borderColor, 0.5f));

        if (rightAlign) {
            cell.setTextAlignment(TextAlignment.RIGHT);
        }

        return cell;
    }

    private void addCompactRow(Table table, String label1, String value1, String label2, String value2,
                               DeviceRgb borderColor) {
        table.addCell(new Cell()
                .add(new Paragraph(label1)
                        .setFontSize(7)
                        .setBold())
                .setPadding(3)
                .setBackgroundColor(new DeviceRgb(250, 250, 250))
                .setBorder(new SolidBorder(borderColor, 0.5f)));

        table.addCell(new Cell()
                .add(new Paragraph(value1)
                        .setFontSize(7))
                .setPadding(3)
                .setBorder(new SolidBorder(borderColor, 0.5f)));

        table.addCell(new Cell()
                .add(new Paragraph(label2)
                        .setFontSize(7)
                        .setBold())
                .setPadding(3)
                .setBackgroundColor(new DeviceRgb(250, 250, 250))
                .setBorder(new SolidBorder(borderColor, 0.5f)));

        table.addCell(new Cell()
                .add(new Paragraph(value2)
                        .setFontSize(7))
                .setPadding(3)
                .setBorder(new SolidBorder(borderColor, 0.5f)));
    }

    private String formatCurrency(Double amount) {
        if (amount == null) return "0,00 Ar";
        return String.format("%,.2f Ar", amount).replace(".", ",");
    }

    private String formatCompactCurrency(Double amount) {
        if (amount == null) return "";
        return String.format("%,.2f", amount).replace(".", ",");
    }

    // Méthodes utilitaires pour créer les styles Excel
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_80_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createLabelStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
        return style;
    }

    private CellStyle createNetPayStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_80_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
        return style;
    }

    private CellStyle createFooterStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 8);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private void createLabelValueCells(Row row, int startCol, String label, String value,
                                       CellStyle labelStyle, CellStyle dataStyle) {
        org.apache.poi.ss.usermodel.Cell labelCell = row.createCell(startCol);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);

        org.apache.poi.ss.usermodel.Cell valueCell = row.createCell(startCol + 1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(dataStyle);
    }
}
