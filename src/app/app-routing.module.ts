import { BulkSingleProductComponent } from './components/bulk-single-product/bulk-single-product.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleProductComponent } from './components/single-product/single-product.component';

const routes: Routes = [
  { path: 'single-product', component: SingleProductComponent},
  { path: 'bulk-product', component: BulkSingleProductComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
