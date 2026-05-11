import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private subscriptions = new Subscription();

  showPublicFooter = true;
  hidePublicShell = false;

  ngOnInit(): void {
    this.subscriptions.add(this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.showPublicFooter = !isLoggedIn;
    }));

    this.updatePublicShellVisibility(this.router.url);
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(event => this.updatePublicShellVisibility(event.urlAfterRedirects))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updatePublicShellVisibility(url: string): void {
    this.hidePublicShell =
      url.startsWith('/login') ||
      url.startsWith('/employee') ||
      url.startsWith('/admin');
  }
}
