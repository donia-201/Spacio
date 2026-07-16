import { Routes } from '@angular/router';


import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home';
import { NotFound } from './pages/not-found/not-found';
import { UserLayout } from "./layouts/user-layout/user-layout"

export const routes: Routes = [
  {
    path: '',
    redirectTo:'login',
    pathMatch:'full' ,
  },
 {
  path: 'login',
  component: Login
 },
      {
        path: 'register',
        component: Register,
      },
      {
        path:'',
        component: UserLayout,
        children:[
          {
            path:'home',
            component:Home
          },
          // {
          //   path:'profile',
          //   component:Profile,
          // },
          // {
          //   path: 'my-bookings',
          //   component: MyBookings
          // },
        ]

      },
    

  {
    path: '**',
    component: NotFound,
  },
];