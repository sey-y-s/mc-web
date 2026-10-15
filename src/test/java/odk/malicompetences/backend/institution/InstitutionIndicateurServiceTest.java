package odk.malicompetences.backend.institution;

import odk.malicompetences.backend.skillsGap.IndicateurSkillsGapRepository;
import odk.malicompetences.backend.skillsGap.IndicateurSkillsGap;
import odk.malicompetences.backend.competence.Competence;
import odk.malicompetences.backend.territoire.Region;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InstitutionIndicateurServiceTest {

    @Test
    void espaceInstitutionResteDesactiveParDefaut() {
        var repository = mock(IndicateurSkillsGapRepository.class);
        var gate = new InstitutionFeatureGate(false, false);
        var service = new InstitutionIndicateurService(repository, gate);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.lire(UUID.randomUUID(), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 3, 31)));

        assertEquals(503, error.getStatusCode().value());
        verifyNoInteractions(repository);
    }


    @Test
    void masqueLesEffectifsFaiblesEtUneCelluleComplementaireSansRenvoyerLeCompte() {
        var repository = mock(IndicateurSkillsGapRepository.class);
        var gate = new InstitutionFeatureGate(true, true);
        var service = new InstitutionIndicateurService(repository, gate);
        UUID competenceId = UUID.randomUUID();
        LocalDate debut = LocalDate.of(2026, 1, 1);
        LocalDate fin = LocalDate.of(2026, 3, 31);
        Competence competence = new Competence();
        competence.setId(competenceId);
        competence.setNom("Compétence test");

        IndicateurSkillsGap faible = indicateur("ML-01", "Région 1", competence, debut, fin, 3, 10, 20);
        IndicateurSkillsGap moyen = indicateur("ML-02", "Région 2", competence, debut, fin, 15, 40, 50);
        IndicateurSkillsGap fort = indicateur("ML-03", "Région 3", competence, debut, fin, 20, 60, 70);
        when(repository.findByCompetence_IdAndPeriodeDebutAndPeriodeFin(competenceId, debut, fin))
                .thenReturn(List.of(faible, moyen, fort));

        List<InstitutionIndicateurResponse> rows = service.lire(competenceId, debut, fin);

        assertEquals("MASQUE", rows.get(0).statutConfidentialite());
        assertNull(rows.get(0).offre());
        assertEquals("MASQUE", rows.get(1).statutConfidentialite());
        assertNull(rows.get(1).ecart());
        assertEquals("VISIBLE", rows.get(2).statutConfidentialite());
        assertEquals(Integer.valueOf(60), rows.get(2).offre());
    }

    private static IndicateurSkillsGap indicateur(String code, String nom, Competence competence,
            LocalDate debut, LocalDate fin, int effectif, int demande, int offre) {
        Region region = new Region();
        region.setCodeStable(code);
        region.setNom(nom);
        IndicateurSkillsGap i = new IndicateurSkillsGap();
        i.setRegion(region);
        i.setCompetence(competence);
        i.setPeriodeDebut(debut);
        i.setPeriodeFin(fin);
        i.setDateCalcul(LocalDateTime.now());
        i.setEffectifContributeurs(effectif);
        i.setDemandeEstimee(demande);
        i.setOffreDisponible(offre);
        i.setEcart(demande - offre);
        return i;
    }

    @Test
    void refuseLesPeriodesChevauchantesOuNonTrimestrielles() {
        var repository = mock(IndicateurSkillsGapRepository.class);
        var gate = new InstitutionFeatureGate(true, true);
        var service = new InstitutionIndicateurService(repository, gate);

        assertThrows(IllegalArgumentException.class,
                () -> service.lire(UUID.randomUUID(), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 28)));
        verifyNoInteractions(repository);
    }
}
