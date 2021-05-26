import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';

const appRoutes: Routes = [
  { path: 'home-page', component: HomePageComponent },
  { path: 'user-page', component: UserPageComponent },
  { path: '', redirectTo: '/home-page' , pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [ 
    RouterModule,
  ],
})
export class AppRoutingModule { }
