package odk.malicompetences.backend.skillsGap;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IndicateurSkillsGapRepository extends JpaRepository<IndicateurSkillsGap, UUID> {
    List<IndicateurSkillsGap> findByRegion_Id(UUID regionId);
    List<IndicateurSkillsGap> findByCompetence_Id(UUID competenceId);
    List<IndicateurSkillsGap> findByCompetence_IdAndPeriodeDebutAndPeriodeFin(
            UUID competenceId, LocalDate periodeDebut, LocalDate periodeFin);
}
