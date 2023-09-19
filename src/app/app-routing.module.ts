import { AmazonComponent } from './components/amazon/amazon.component';
import { BulkSingleProductComponent } from './components/amazon/bulk-single-product/bulk-single-product.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleProductComponent } from './components/amazon/single-product/single-product.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';
import { SingleArticleComponent } from './components/blog-post/single-article/single-article.component';
import { BulkArticlesComponent } from './components/blog-post/bulk-articles/bulk-articles.component';
import { PillarComponent } from './components/pillar/pillar.component';
import { BulkPillarArticlesComponent } from './components/pillar/bulk-pillar-articles/bulk-pillar-articles.component';
import { SinglePillarArticleComponent } from './components/pillar/single-pillar-article/single-pillar-article.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'single-product', component: SingleProductComponent},
  { path: 'single-article', component: SingleArticleComponent},
  { path: 'bulk-product', component: BulkSingleProductComponent},
  { path: 'bulk-articles', component: BulkArticlesComponent},

  { path: 'pillar-article', component: PillarComponent},
  { path: 'single-pillar-article', component: SinglePillarArticleComponent},
  { path: 'bulk-pillar-article', component: BulkPillarArticlesComponent},

  { path: 'settings', component: SettingsComponent},
  { path: 'amazon', component: AmazonComponent},
  { path: 'blog-post', component: BlogPostComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
