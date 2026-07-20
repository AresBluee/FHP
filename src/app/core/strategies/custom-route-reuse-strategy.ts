import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  
  private storedRoutes = new Map<string, DetachedRouteHandle>();
  
  // Lista de rutas exactas que queremos cachear (rutas del empleado)
  private cacheableRoutes = [
    'profile',
    'my-schedule',
    'my-attendance-history',
    'my-requests',
    'my-payslips',
    'my-certificates',
    'policies'
  ];

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return path ? this.cacheableRoutes.includes(path) : false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path = route.routeConfig?.path;
    if (path) {
      this.storedRoutes.set(path, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return path ? this.storedRoutes.has(path) : false;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path;
    if (path && this.storedRoutes.has(path)) {
      return this.storedRoutes.get(path) as DetachedRouteHandle;
    }
    return null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
