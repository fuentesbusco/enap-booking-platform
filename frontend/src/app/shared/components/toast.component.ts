import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div
        *ngFor="let toast of toastService.toasts()"
        [class]="toastClass(toast.type)"
        class="p-4 rounded-2xl shadow-float border backdrop-blur-md flex items-start gap-3 pointer-events-auto animate-slide-in transition-all duration-300"
      >
        <span class="text-lg shrink-0">{{ toastIcon(toast.type) }}</span>
        <div class="flex-1 text-sm font-medium leading-relaxed">{{ toast.message }}</div>
        <button (click)="toastService.remove(toast.id)" class="text-charcoal/40 hover:text-charcoal transition-colors ml-auto shrink-0 select-none cursor-pointer">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.25s ease-out forwards;
    }
    .shadow-float {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-50/90 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50/90 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50/90 border-yellow-200 text-yellow-900';
      default:
        return 'bg-white/95 border-charcoal/10 text-charcoal';
    }
  }

  toastIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '⚠️';
      case 'warning': return '⏳';
      default: return 'ℹ️';
    }
  }
}
