import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent, OverviewComponent, OptionsComponent} from './components';
import {AuthGuard} from './guards';
import {DeviceDetailsComponent} from "./components/detail/device-details.component";

const routes: Routes = [
  {path: '', redirectTo: '/overview', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'overview', component: OverviewComponent, canActivate: [AuthGuard]},
  {path: 'options', component: OptionsComponent, canActivate: [AuthGuard]},
  {path: 'details/:id', component: DeviceDetailsComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
