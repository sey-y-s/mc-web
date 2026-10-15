package odk.malicompetences.backend.centre;

import java.util.UUID;

public record CentreResponse(
        UUID id,
        String nom,
        String description,
        String adresse,
        String telephone
) {}