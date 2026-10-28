import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="skip-link" href="#main-content">Aller au contenu principal</a>
    <div class="min-h-screen bg-base-100">
      <header class="border-b border-base-300 bg-base-100">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a routerLink="/" class="flex items-center gap-3 rounded-sm" aria-label="MaliCompétences, accueil">
            <span class="h-8 w-1 rounded-full bg-secondary" aria-hidden="true"></span>
            <span class="text-lg font-semibold tracking-tight">MaliCompétences</span>
          </a>
          <nav aria-label="Navigation principale" class="flex items-center gap-3 sm:gap-6">
            <a routerLink="/opportunites" class="text-sm font-semibold text-base-content/80 hover:text-primary">Opportunités</a>
            <a routerLink="/auth/login" class="btn btn-primary btn-sm rounded-md px-4">Connexion</a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section class="mc-pattern-band relative overflow-hidden text-white">
          <div class="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div class="max-w-3xl">
              <p class="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">Compétences · Opportunités · Territoires</p>
              <h1 class="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
                Les compétences au service des opportunités.
              </h1>
              <p class="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                MaliCompétences a pour ambition de rapprocher les savoir-faire des personnes et les besoins des organisations, partout au Mali.
              </p>
              <div class="mt-8 flex flex-wrap gap-3">
                <a routerLink="/opportunites" class="btn rounded-md border-0 bg-white px-5 text-mc-green-950 hover:bg-mc-green-50">Consulter les opportunités</a>
                <a routerLink="/auth/login" class="btn btn-outline rounded-md border-white/70 px-5 text-white hover:bg-white/10">Accéder à mon espace</a>
              </div>
            </div>
            <div class="hidden lg:block" aria-hidden="true">
              <div class="ml-auto max-w-sm border-l border-white/35 pl-8 py-4">
                <p class="text-sm leading-7 text-white/80">Une plateforme pensée pour rendre les compétences plus visibles et aider les organisations à mieux exprimer leurs besoins.</p>
                <div class="mt-8 h-px w-24 bg-amber-200"></div>
                <p class="mt-4 text-xs uppercase tracking-[0.18em] text-amber-100">Une ambition nationale</p>
              </div>
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">La démarche</p>
            <h2 class="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">Mieux relier les compétences et les besoins.</h2>
            <p class="mc-muted mt-4 max-w-xl">Les espaces professionnels sont conçus pour soutenir le travail des organisations et des équipes de la plateforme. Les fonctionnalités sont présentées selon leur niveau réel de disponibilité.</p>
          </div>
          <div class="mt-9 grid gap-5 md:grid-cols-3">
            <article class="border-t-2 border-primary pt-4">
              <p class="text-sm font-semibold text-primary">01 / Identifier</p>
              <h3 class="mt-3 text-lg font-semibold">Rendre les compétences visibles</h3>
              <p class="mc-muted mt-2">Structurer les compétences et les expériences pour faciliter leur compréhension.</p>
            </article>
            <article class="border-t-2 border-secondary pt-4">
              <p class="text-sm font-semibold text-secondary">02 / Comprendre</p>
              <h3 class="mt-3 text-lg font-semibold">Qualifier les besoins</h3>
              <p class="mc-muted mt-2">Aider les organisations à exprimer les compétences recherchées.</p>
            </article>
            <article class="border-t-2 border-base-300 pt-4">
              <p class="text-sm font-semibold text-base-content/70">03 / Relier</p>
              <h3 class="mt-3 text-lg font-semibold">Favoriser la mise en relation</h3>
              <p class="mc-muted mt-2">Préparer des parcours de rapprochement entre les besoins et les compétences disponibles.</p>
            </article>
          </div>
        </section>
      </main>

      <footer class="border-t border-base-300 bg-base-200/70">
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-base-content/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>MaliCompétences</span>
          <span>Valoriser les compétences, rapprocher les opportunités.</span>
        </div>
      </footer>
    </div>
  `,
})
export class HomePageComponent {}
