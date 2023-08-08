import { BulkSingleProductComponent } from './components/bulk-single-product/bulk-single-product.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleProductComponent } from './components/single-product/single-product.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'single-product', component: SingleProductComponent},
  { path: 'bulk-product', component: BulkSingleProductComponent},
  { path: 'settings', component: SettingsComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
