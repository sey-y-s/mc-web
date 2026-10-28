import { AuthLayoutComponent } from '../../shared/components/auth-layout.component';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';
import { AuthService, CanalVerification } from '../../core/auth/auth.service';
import { VerificationState } from '../../core/auth/verification.state';
import { OrganisationService } from '../../core/services/organisation.service';
import { ToastService } from '../../core/ui/toast.service';

const DELAI_RENVOI = 60;

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './verification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly organisations = inject(OrganisationService);
  private readonly state = inject(VerificationState);

  readonly contexte = this.state.courante;
  readonly canal = signal<CanalVerification>(this.contexte()?.canaux[0] ?? 'TELEPHONE');
  readonly code = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly info = signal('');
  readonly attente = signal(0);
  private minuteur?: ReturnType<typeof setInterval>;

  readonly libelleCanal = computed(() =>
    this.canal() === 'EMAIL' ? 'votre adresse e-mail' : 'votre numéro de téléphone',
  );
  readonly codeValide = computed(() => /^\d{6}$/.test(this.code().trim()));

  constructor() {
    const ctx = this.contexte();
    if (!ctx) {
      void this.router.navigate(['/auth/login']);
      return;
    }
    if (ctx.codeDejaEnvoye) this.demarrerAttente();
    else this.renvoyer(true);
  }

  ngOnDestroy(): void {
    clearInterval(this.minuteur);
  }

  choisir(canal: CanalVerification): void {
    if (canal === this.canal()) return;
    this.canal.set(canal);
    this.code.set('');
    this.error.set('');
    this.info.set('');
  }

  renvoyer(silencieux = false): void {
    const ctx = this.contexte();
    if (!ctx || this.attente() > 0) return;
    this.error.set('');
    this.auth.renvoyerOtp(ctx.identifiant, this.canal()).subscribe({
      next: () => {
        if (!silencieux) this.info.set('Un nouveau code vient d’être envoyé.');
        this.demarrerAttente();
      },
      error: (e: HttpErrorResponse) => {
        // 429 : un code vient d’être envoyé, on attend simplement avant d’en redemander un.
        if (e.status === 429) this.demarrerAttente();
        else if (!silencieux) this.error.set(e.error?.message ?? 'Envoi impossible pour le moment.');
      },
    });
  }

  valider(): void {
    const ctx = this.contexte();
    if (!ctx || !this.codeValide()) {
      this.error.set('Saisissez les 6 chiffres du code reçu.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.verifierOtp(ctx.identifiant, this.canal(), this.code()).subscribe({
      next: () => this.terminer(),
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(e.status === 0 ? 'Connexion impossible. Vérifiez votre réseau.' : (e.error?.message ?? 'Code incorrect ou expiré.'));
      },
    });
  }

  private terminer(): void {
    const ctx = this.contexte();
    const pieces = ctx?.pieces ?? [];
    this.state.courante.set(null);
    const fin = (echecs: number) => {
      this.loading.set(false);
      if (echecs) this.toast.error(`${echecs} pièce(s) n'ont pas pu être envoyées : ajoutez-les depuis « Mon organisation ».`);
      else this.toast.success(pieces.length ? 'Bienvenue ! Votre dossier a été transmis pour validation.' : 'Compte vérifié. Bienvenue !');
      void this.router.navigate([ctx?.pieces ? '/app/organisation/profil' : this.auth.homeRoute()]);
    };
    if (!pieces.length) return fin(0);
    from(pieces)
      .pipe(
        concatMap(([type, fichier]) => this.organisations.deposerDocument(type, fichier).pipe(map(() => true), catchError(() => of(false)))),
        toArray(),
      )
      .subscribe((r) => fin(r.filter((x) => !x).length));
  }

  private demarrerAttente(): void {
    clearInterval(this.minuteur);
    this.attente.set(DELAI_RENVOI);
    this.minuteur = setInterval(() => {
      this.attente.update((n) => Math.max(0, n - 1));
      if (this.attente() === 0) clearInterval(this.minuteur);
    }, 1000);
  }
}
