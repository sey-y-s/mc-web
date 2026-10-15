package odk.malicompetences.backend.institution;

import odk.malicompetences.backend.competence.Competence;
import odk.malicompetences.backend.skillsGap.IndicateurSkillsGap;
import odk.malicompetences.backend.skillsGap.IndicateurSkillsGapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class InstitutionIndicateurService {
    private static final int SEUIL_MINIMAL = 5;
    private final IndicateurSkillsGapRepository repository;
    private final InstitutionFeatureGate gate;

    public InstitutionIndicateurService(
            IndicateurSkillsGapRepository repository,
            InstitutionFeatureGate gate
    ) {
        this.repository = repository;
        this.gate = gate;
    }

    public List<InstitutionIndicateurResponse> lire(UUID competenceId, LocalDate debut, LocalDate fin) {
        gate.requireEnabled();
        if (competenceId == null || debut == null || fin == null || fin.isBefore(debut)) {
            throw new IllegalArgumentException("competenceId, periodeDebut et periodeFin valides sont obligatoires.");
        }
        if (!estTrimestreCivil(debut, fin)) {
            throw new IllegalArgumentException("Seules les périodes trimestrielles civiles complètes sont publiables.");
        }

        // Une seule période trimestrielle exacte est autorisée; pas de filtre région ni de périodes chevauchantes.
        List<IndicateurSkillsGap> records = repository
                .findByCompetence_IdAndPeriodeDebutAndPeriodeFin(competenceId, debut, fin);

        if (records.stream().anyMatch(i -> i.getRegion() == null
                || i.getRegion().getCodeStable() == null
                || i.getRegion().getCodeStable().isBlank())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "Référentiel territorial incomplet : code stable manquant."
            );
        }

        Map<String, IndicateurSkillsGap> byCode = new TreeMap<>();
        for (IndicateurSkillsGap item : records) {
            String code = item.getRegion().getCodeStable();
            if (byCode.putIfAbsent(code, item) != null) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "Plusieurs indicateurs existent pour une même région et période."
                );
            }
        }

        Set<String> codesMasques = records.stream()
                .filter(i -> i.getEffectifContributeurs() == null || i.getEffectifContributeurs() < SEUIL_MINIMAL)
                .map(i -> i.getRegion().getCodeStable())
                .collect(Collectors.toCollection(TreeSet::new));

        // Suppression complémentaire prudente : lorsqu'une cellule est supprimée,
        // masquer aussi la plus petite cellule visible du même groupe (compétence/période).
        if (!codesMasques.isEmpty()) {
            records.stream()
                    .filter(i -> !codesMasques.contains(i.getRegion().getCodeStable()))
                    .min(Comparator.comparingInt(i -> i.getEffectifContributeurs() == null
                            ? Integer.MAX_VALUE : i.getEffectifContributeurs()))
                    .ifPresent(i -> codesMasques.add(i.getRegion().getCodeStable()));
        }

        List<InstitutionIndicateurResponse> output = new ArrayList<>();
        for (IndicateurSkillsGap i : records) {
            boolean masked = codesMasques.contains(i.getRegion().getCodeStable());
            Competence competence = i.getCompetence();
            output.add(new InstitutionIndicateurResponse(
                    i.getRegion().getCodeStable(),
                    i.getRegion().getNom(),
                    competence.getId(),
                    competence.getNom(),
                    i.getPeriodeDebut(),
                    i.getPeriodeFin(),
                    masked ? null : i.getOffreDisponible(),
                    masked ? null : i.getDemandeEstimee(),
                    masked ? null : i.getEcart(),
                    masked ? "MASQUE" : "VISIBLE",
                    masked ? "effectif trop faible ou suppression complémentaire" : null,
                    i.getDateCalcul()
            ));
        }
        output.sort(Comparator.comparing(InstitutionIndicateurResponse::regionCode));
        return List.copyOf(output);
    }

    private boolean estTrimestreCivil(LocalDate debut, LocalDate fin) {
        int month = debut.getMonthValue();
        if (!List.of(1, 4, 7, 10).contains(month) || debut.getDayOfMonth() != 1) return false;
        LocalDate expectedEnd = debut.plusMonths(3).minusDays(1);
        return expectedEnd.equals(fin);
    }
}
