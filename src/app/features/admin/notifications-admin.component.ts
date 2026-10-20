import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, NotificationAdminRequest } from '../../core/services/admin.service';

@Component({
  selector: 'app-notifications-admin', standalone: true, imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Notifications administratives" description="Envoyer une notification aux destinataires sélectionnés." />
    <section class="mc-card max-w-3xl p-5 sm:p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      @if (success) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ success }}</p> }
      <form class="space-y-4" (ngSubmit)="previsualiser()">
        <label class="block text-sm font-medium">Titre *<input class="mc-input mt-1" name="titre" [(ngModel)]="form.titre" maxlength="200" required /></label>
        <label class="block text-sm font-medium">Type *<select class="mc-input mt-1" name="type" [(ngModel)]="form.type" required><option value="SYSTEME">Système</option><option value="VALIDATION">Validation</option><option value="MISE_EN_RELATION">Mise en relation</option><option value="OPPORTUNITE">Opportunité</option><option value="BESOIN_COMPETENCE">Besoin / compétence</option></select></label>
        <label class="block text-sm font-medium">Message *<textarea class="mc-input mt-1" name="message" [(ngModel)]="form.message" rows="5" required></textarea></label>
        <label class="block text-sm font-medium">Identifiants UUID des destinataires *<textarea class="mc-input mt-1 font-mono text-xs" name="destinataires" [(ngModel)]="destinatairesRaw" rows="5" placeholder="Un UUID par ligne ou séparé par une virgule" required></textarea></label>
        <p class="text-xs text-slate-500">Maximum 5 000 destinataires par envoi.</p>
        <button class="btn btn-primary" type="submit">Prévisualiser l’envoi</button>
      </form>
      @if (preview) { <div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><h2 class="font-semibold">Confirmer l’envoi</h2><p class="mt-2 text-sm"><strong>{{ form.titre }}</strong> · {{ form.type }}</p><p class="mt-1 whitespace-pre-wrap text-sm">{{ form.message }}</p><p class="mt-2 text-sm">{{ recipientIds.length }} destinataire(s) distinct(s).</p><div class="mt-4 flex gap-2"><button class="btn btn-primary" [disabled]="sending" (click)="envoyer()">{{ sending ? 'Envoi…' : 'Confirmer et envoyer' }}</button><button class="btn btn-secondary" (click)="preview = false">Annuler</button></div></div> }
    </section>
  `,
})
export class NotificationsAdminComponent {
  private readonly service = inject(AdminService);
  form: Omit<NotificationAdminRequest,'destinatairesIds'> = { titre: '', message: '', type: 'SYSTEME' };
  destinatairesRaw = ''; preview = false; sending = false; error = ''; success = '';
  get recipientIds(): string[] { return [...new Set(this.destinatairesRaw.split(/[\s,;]+/).map(v => v.trim()).filter(Boolean))]; }
  previsualiser(): void {
    this.error = ''; this.success = ''; const ids = this.recipientIds;
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!this.form.titre.trim() || !this.form.message.trim()) { this.error = 'Le titre et le message sont obligatoires.'; return; }
    if (!ids.length || ids.some(id => !uuid.test(id))) { this.error = 'Saisissez au moins un identifiant UUID valide.'; return; }
    if (ids.length > 5000) { this.error = 'La limite est de 5 000 destinataires par envoi.'; return; }
    this.preview = true;
  }
  envoyer(): void { if (!this.preview || this.sending) return; this.sending = true; this.error = ''; this.service.envoyerNotification({ ...this.form, titre: this.form.titre.trim(), message: this.form.message.trim(), destinatairesIds: this.recipientIds }).subscribe({ next: () => { this.success = 'La demande d’envoi a été transmise.'; this.form = { titre: '', message: '', type: 'SYSTEME' }; this.destinatairesRaw = ''; this.preview = false; this.sending = false; }, error: (e: Error) => { this.error = e.message || 'L’envoi n’a pas pu être effectué.'; this.sending = false; } }); }
}
