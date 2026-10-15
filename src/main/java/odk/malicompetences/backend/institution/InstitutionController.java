package odk.malicompetences.backend.institution;

import odk.malicompetences.backend.competence.CompetenceRepository;
import odk.malicompetences.backend.skillsGap.IndicateurSkillsGapRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/institution")
@PreAuthorize("hasRole('INSTITUTION')")
public class InstitutionController {
    private final InstitutionIndicateurService service;
    private final InstitutionFeatureGate gate;
    private final CompetenceRepository competenceRepository;
    private final IndicateurSkillsGapRepository indicateurRepository;

    public InstitutionController(
            InstitutionIndicateurService service,
            InstitutionFeatureGate gate,
            CompetenceRepository competenceRepository,
            IndicateurSkillsGapRepository indicateurRepository
    ) {
        this.service = service;
        this.gate = gate;
        this.competenceRepository = competenceRepository;
        this.indicateurRepository = indicateurRepository;
    }

    @GetMapping("/skills-gap")
    public List<InstitutionIndicateurResponse> skillsGap(
            @RequestParam UUID competenceId,
            @RequestParam LocalDate periodeDebut,
            @RequestParam LocalDate periodeFin
    ) {
        gate.requireEnabled();
        return service.lire(competenceId, periodeDebut, periodeFin);
    }

    @GetMapping("/tableau-de-bord")
    public InstitutionDashboard tableauDeBord(
            @RequestParam UUID competenceId,
            @RequestParam LocalDate periodeDebut,
            @RequestParam LocalDate periodeFin
    ) {
        List<InstitutionIndicateurResponse> rows = service.lire(competenceId, periodeDebut, periodeFin);
        long visibles = rows.stream().filter(r -> "VISIBLE".equals(r.statutConfidentialite())).count();
        long masques = rows.size() - visibles;
        List<InstitutionIndicateurResponse> tensions = rows.stream()
                .filter(r -> r.ecart() != null)
                .sorted(Comparator.comparing(InstitutionIndicateurResponse::ecart).reversed())
                .limit(5)
                .toList();
        return new InstitutionDashboard(competenceId, periodeDebut, periodeFin, visibles, masques, tensions);
    }

    @GetMapping("/competences")
    public List<CompetenceOption> competences() {
        gate.requireEnabled();
        Set<UUID> ids = new HashSet<>(indicateurRepository.findAll().stream()
                .filter(i -> estTrimestreCivil(i.getPeriodeDebut(), i.getPeriodeFin()))
                .map(i -> i.getCompetence().getId()).toList());
        return competenceRepository.findAll().stream()
                .filter(c -> ids.contains(c.getId()))
                .map(c -> new CompetenceOption(c.getId(), c.getNom()))
                .sorted(Comparator.comparing(CompetenceOption::nom, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @GetMapping("/periodes")
    public List<PeriodeOption> periodes(@RequestParam UUID competenceId) {
        gate.requireEnabled();
        return indicateurRepository.findByCompetence_Id(competenceId).stream()
                .filter(i -> estTrimestreCivil(i.getPeriodeDebut(), i.getPeriodeFin()))
                .map(i -> new PeriodeOption(i.getPeriodeDebut(), i.getPeriodeFin()))
                .distinct()
                .sorted(Comparator.comparing(PeriodeOption::debut).thenComparing(PeriodeOption::fin))
                .toList();
    }

    @GetMapping("/skills-gap/export")
    public ResponseEntity<ByteArrayResource> exporter(
            @RequestParam UUID competenceId,
            @RequestParam LocalDate periodeDebut,
            @RequestParam LocalDate periodeFin
    ) {
        List<InstitutionIndicateurResponse> rows = service.lire(competenceId, periodeDebut, periodeFin);
        StringBuilder csv = new StringBuilder("\uFEFFregionCode,regionNom,competenceId,competenceNom,periodeDebut,periodeFin,offre,demande,ecart,statutConfidentialite,motifMasquage\r\n");
        for (InstitutionIndicateurResponse r : rows) {
            csv.append(csv(r.regionCode())).append(',')
                    .append(csv(r.regionNom())).append(',')
                    .append(csv(r.competenceId().toString())).append(',')
                    .append(csv(r.competenceNom())).append(',')
                    .append(csv(r.periodeDebut().toString())).append(',')
                    .append(csv(r.periodeFin().toString())).append(',')
                    .append(r.offre() == null ? "" : r.offre()).append(',')
                    .append(r.demande() == null ? "" : r.demande()).append(',')
                    .append(r.ecart() == null ? "" : r.ecart()).append(',')
                    .append(csv(r.statutConfidentialite())).append(',')
                    .append(csv(r.motifMasquage())).append("\r\n");
        }
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=skills-gap-agrege.csv")
                .cacheControl(CacheControl.noStore())
                .body(new ByteArrayResource(bytes));
    }

    private static boolean estTrimestreCivil(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null || !List.of(1, 4, 7, 10).contains(debut.getMonthValue())
                || debut.getDayOfMonth() != 1) return false;
        return debut.plusMonths(3).minusDays(1).equals(fin);
    }

    private static String csv(String value) {
        if (value == null) return "";
        String safe = value.replace("\r", " ").replace("\n", " ");
        // Protection contre l'injection de formules dans les tableurs.
        if (!safe.isEmpty() && "=+-@".indexOf(safe.charAt(0)) >= 0) safe = "'" + safe;
        return "\"" + safe.replace("\"", "\"\"") + "\"";
    }

    public record InstitutionDashboard(
            UUID competenceId, LocalDate periodeDebut, LocalDate periodeFin,
            long cellulesVisibles, long cellulesMasquees,
            List<InstitutionIndicateurResponse> competencesEnTension
    ) {}
    public record CompetenceOption(UUID id, String nom) {}
    public record PeriodeOption(LocalDate debut, LocalDate fin) {}
}
