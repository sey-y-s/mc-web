import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'mc-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-control w-full space-y-1">
      @if (label) {
        <label [for]="id" class="label p-0">
          <span class="label-text font-semibold text-xs uppercase tracking-wider text-neutral/70">
            {{ label }}
            @if (required) {
              <span class="text-error">*</span>
            }
          </span>
        </label>
      }
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [ngClass]="[
          'input w-full text-sm transition-colors focus:outline-none',
          error ? 'input-error' : 'focus:input-primary',
        ]"
      />
      @if (error) {
        <span class="text-xs text-error font-medium mt-1">{{ error }}</span>
      } @else if (hint) {
        <span class="text-xs text-neutral/60 mt-1">{{ hint }}</span>
      }
    </div>
  `,
})
export class McInputComponent implements ControlValueAccessor {
  @Input() id: string = `input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() hint: string = '';
  @Input() error: string | null = null;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  value = signal<string>('');
  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const inputVal = (event.target as HTMLInputElement).value;
    this.value.set(inputVal);
    this.onChange(inputVal);
  }
}
