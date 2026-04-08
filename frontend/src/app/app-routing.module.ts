import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  { path: 'browse', loadComponent: () => import('./pages/browse/browse.page').then(m => m.BrowsePage) },
  { path: 'chat/:id', loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage), canActivate: [AuthGuard] },
  { path: 'conversations', loadComponent: () => import('./pages/conversations-list/conversations-list.page').then(m => m.ConversationsListPage), canActivate: [AuthGuard] },
  { path: 'create-gig', loadComponent: () => import('./pages/create-gig/create-gig.page').then(m => m.CreateGigPage), canActivate: [AuthGuard] },
  { path: 'gigs', loadComponent: () => import('./pages/gigs-list/gigs-list.page').then(m => m.GigsListPage), canActivate: [AuthGuard] },
  { path: 'freelancer-profile/:id', loadComponent: () => import('./pages/freelancer-profile/freelancer-profile.page').then(m => m.FreelancerProfilePage) },
  { path: 'freelancer-profile', loadComponent: () => import('./pages/freelancer-profile/freelancer-profile.page').then(m => m.FreelancerProfilePage) },
  { path: 'profile-admin/:id', loadComponent: () => import('./pages/profile-admin/profile-admin.page').then(m => m.ProfileAdminPage), canActivate: [AuthGuard] },
  { path: 'profile-admin', loadComponent: () => import('./pages/profile-admin/profile-admin.page').then(m => m.ProfileAdminPage), canActivate: [AuthGuard] },
  { path: 'profile-client/:id', loadComponent: () => import('./pages/profile-client/profile-client.page').then(m => m.ProfileClientPage), canActivate: [AuthGuard] },
  { path: 'profile-client', loadComponent: () => import('./pages/profile-client/profile-client.page').then(m => m.ProfileClientPage), canActivate: [AuthGuard] },
  { path: 'dashboard-admin', loadComponent: () => import('./pages/dashboard-admin/dashboard-admin.page').then(m => m.DashboardAdminPage), canActivate: [AuthGuard] },
  { path: 'dashboard-client', loadComponent: () => import('./pages/dashboard-client/dashboard-client.page').then(m => m.DashboardClientPage), canActivate: [AuthGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage), canActivate: [AuthGuard] },
  { path: 'store', loadComponent: () => import('./pages/store/store.page').then(m => m.StorePage) },
  { path: 'store/checkout', loadComponent: () => import('./pages/store-checkout/store-checkout.page').then(m => m.StoreCheckoutPage) },
  { path: 'interests', loadComponent: () => import('./pages/interests/interests.page').then(m => m.InterestsPage) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage) },
  { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage), canActivate: [AuthGuard] },
  { path: 'splash', loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage) },
  { path: 'not-found', loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage) },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
