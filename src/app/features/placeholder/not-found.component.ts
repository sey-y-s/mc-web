import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="skip-link" href="#not-found-title">Aller au contenu principal</a>
    <main class="flex min-h-screen items-center justify-center bg-base-200 px-5 py-12">
      <section class="mc-card w-full max-w-lg p-8 sm:p-10" aria-labelledby="not-found-title">
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Erreur 404</p>
        <h1 id="not-found-title" class="mc-page-title mt-3 text-3xl">Cette page est introuvable.</h1>
        <p class="mc-muted mt-3">L’adresse demandée ne correspond à aucune page connue de MaliCompétences.</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a routerLink="/" class="btn btn-primary rounded-md">Accueil</a>
          <a routerLink="/auth/login" class="btn btn-outline rounded-md">Connexion</a>
        </div>
      </section>
    </main>
  `,
})
export class NotFoundComponent {}
