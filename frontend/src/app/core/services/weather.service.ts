import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  getLimacheWeather(): Observable<any> {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-33.0153&longitude=-71.2675&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Santiago';
    return this.http.get(url).pipe(
      map((res: any) => {
        return {
          temp: Math.round(res.current.temperature_2m),
          humidity: res.current.relative_humidity_2m,
          wind: res.current.wind_speed_10m,
          code: res.current.weather_code,
          text: this.getWeatherText(res.current.weather_code),
          icon: this.getWeatherEmoji(res.current.weather_code),
          forecast: res.daily.time.slice(1, 4).map((time: string, idx: number) => ({
            date: time,
            max: Math.round(res.daily.temperature_2m_max[idx + 1]),
            min: Math.round(res.daily.temperature_2m_min[idx + 1]),
            icon: this.getWeatherEmoji(res.daily.weather_code[idx + 1]),
            text: this.getWeatherText(res.daily.weather_code[idx + 1]),
          }))
        };
      }),
      catchError((err) => {
        console.error('Weather API failed, using fallback mock data:', err);
        return of(this.getMockWeather());
      })
    );
  }

  private getMockWeather() {
    return {
      temp: 18,
      humidity: 65,
      wind: 12,
      code: 3,
      text: 'Parcialmente Nublado',
      icon: '⛅',
      forecast: [
        { date: 'Mañana', max: 20, min: 9, icon: '☀️', text: 'Despejado' },
        { date: 'Pasado Mañana', max: 21, min: 10, icon: '☀️', text: 'Despejado' },
        { date: 'Siguiente Día', max: 17, min: 11, icon: '☁️', text: 'Nublado' },
      ]
    };
  }

  private getWeatherEmoji(code: number): string {
    if (code === 0) return '☀️'; 
    if (code >= 1 && code <= 3) return '⛅'; 
    if (code >= 45 && code <= 48) return '🌫️'; 
    if (code >= 51 && code <= 67) return '🌧️'; 
    if (code >= 71 && code <= 77) return '❄️'; 
    if (code >= 80 && code <= 82) return '🌦️'; 
    if (code >= 95 && code <= 99) return '⛈️'; 
    return '☀️';
  }

  private getWeatherText(code: number): string {
    if (code === 0) return 'Despejado';
    if (code === 1) return 'Mayormente Despejado';
    if (code === 2) return 'Parcialmente Nublado';
    if (code === 3) return 'Nublado';
    if (code >= 45 && code <= 48) return 'Niebla';
    if (code >= 51 && code <= 55) return 'Llovizna';
    if (code >= 61 && code <= 65) return 'Lluvia';
    if (code >= 80 && code <= 82) return 'Chubascos';
    if (code >= 95 && code <= 99) return 'Tormenta';
    return 'Templado';
  }
}
