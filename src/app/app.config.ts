import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api'; // <-- 💡 NUEVO IMPORT
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Importar esto
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(
    withInterceptors([authInterceptor])),
    MessageService,
    providePrimeNG({
      theme: {
          preset: Aura,
          options: {
            prefix: 'p',
            darkModeSelector: 'light',
            cssLayer: false,
        }
      }
  })


  ]
};
