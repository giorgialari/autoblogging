import { AmazonComponent } from './components/amazon/amazon.component';
import { BulkSingleProductComponent } from './components/amazon/bulk-single-product/bulk-single-product.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleProductComponent } from './components/amazon/single-product/single-product.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'single-product', component: SingleProductComponent},
  { path: 'bulk-product', component: BulkSingleProductComponent},
  { path: 'settings', component: SettingsComponent},
  { path: 'amazon', component: AmazonComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
