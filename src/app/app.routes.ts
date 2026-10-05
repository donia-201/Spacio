import { Routes } from '@angular/router';

import { Landing } from './features/landing/landing';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { LocationPrompt } from './features/location/location-prompt';
import { Home } from './features/home/home';
import { Category } from './features/home/category/category';
import { OrganizationDetail } from './features/organization/organization-detail';
import { MyBookings } from './features/bookings/my-bookings';
import { Notifications } from './features/notifications/notifications';
import { Profile } from './features/profile/profile';
import { AdminDashboardPage } from './features/admin/admin-dashboard';
import { TechnicianDashboardPage } from './features/technician/technician-dashboard';
import { NotFound } from './pages/not-found/not-found';

import { UserLayout } from './layouts/user-layout/user-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { TechnicianLayout } from './layouts/technician-layout/technician-layout';

import { authGuard, guestGuard, roleGuard, userOnlyGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  // ---------------- Public ----------------
  { path: '', component: Landing },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  // Asked right after signup: the whole product is location-first.
  {
    path: 'welcome/location',
    component: LocationPrompt,
    canActivate: [authGuard],
  },

  // ---------------- Signed-in users ----------------
  {
    path: '',
    component: UserLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home, canActivate: [userOnlyGuard] },
      { path: 'home/category/:type', component: Category, canActivate: [userOnlyGuard] },
      { path: 'organizations/:id', component: OrganizationDetail, canActivate: [userOnlyGuard] },
      { path: 'my-bookings', component: MyBookings, canActivate: [userOnlyGuard] },
      { path: 'notifications', component: Notifications },
      { path: 'profile', component: Profile },
    ],
  },

  // ---------------- Admin ----------------
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard('admin')],
    children: [{ path: '', component: AdminDashboardPage }],
  },

  // ---------------- Technician ----------------
  // Admins can open this too: a technician's view is a useful subset.
  {
    path: 'technician',
    component: TechnicianLayout,
    canActivate: [authGuard, roleGuard('admin', 'technician')],
    children: [{ path: '', component: TechnicianDashboardPage }],
  },

  { path: '**', component: NotFound },
];
