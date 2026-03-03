import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'client',
    loadComponent: () =>
      import('./pages/client-welcome/client-welcome.page').then((m) => m.ClientWelcomePage)
  },
  {
    path: 'freelancer',
    loadComponent: () =>
      import('./pages/freelancer-welcome/freelancer-welcome.page').then((m) => m.FreelancerWelcomePage)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-welcome/admin-welcome.page').then((m) => m.AdminWelcomePage)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
