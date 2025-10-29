import { Component, signal, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop">
      <div class="modal">
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="New Password"
          [value]="password()"
          (input)="password.set($any($event.target).value)"
        />
        <div class="modal-actions">
          <button (click)="submit()">Save</button>
          <button (click)="cancel()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal {
        background: #1f1f1f;
        padding: 1rem;
        border-radius: 0.5rem;
        width: 300px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .modal input {
        padding: 0.5rem;
        border-radius: 0.25rem;
        border: 1px solid #ccc;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .modal-actions button {
        padding: 0.25rem 0.5rem;
      }
    `,
  ],
})
export class PasswordModal {
  @Input() userId?: number;
  @Output() save = new EventEmitter<{ userId: number; password: string }>();
  @Output() close = new EventEmitter<void>();

  password = signal('');

  submit() {
    if (this.userId && this.password()) {
      this.save.emit({ userId: this.userId, password: this.password() });
      this.password.set('');
    }
  }

  cancel() {
    this.close.emit();
    this.password.set('');
  }
}
