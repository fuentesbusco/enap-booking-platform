import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
  private http = inject(HttpClient);

  createPreference(
    title: string,
    quantity: number,
    unitPrice: number,
    backUrls?: { success: string; failure: string; pending: string }
  ): Observable<{
    success: boolean;
    id: string;
    init_point: string;
    sandbox_init_point: string;
  }> {
    const body = {
      title,
      quantity,
      unitPrice,
      backUrls,
    };
    return this.http.post<any>(`${environment.apiUrl}/mercadopago/preference`, body);
  }
}
