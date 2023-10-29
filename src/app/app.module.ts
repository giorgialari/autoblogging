import { EditorComponent } from './shared/ui/editor/editor.component';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { BulkSingleProductComponent } from './components/amazon/bulk-single-product/bulk-single-product.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AmazonComponent } from './components/amazon/amazon.component';
import { BulkTableComponent } from './components/amazon/bulk-single-product/bulk-table/bulk-table.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';
import { SingleArticleComponent } from './components/blog-post/single-article/single-article.component';
import { BulkArticlesComponent } from './components/blog-post/bulk-articles/bulk-articles.component';
import { SingleProductComponent } from './components/amazon/single-product/single-product.component';
import { BulkTableArticlesComponent } from './components/blog-post/bulk-articles/bulk-table/bulk-table.component';
import { PillarComponent } from './components/pillar/pillar.component';
import { SinglePillarArticleComponent } from './components/pillar/single-pillar-article/single-pillar-article.component';
import { BulkPillarArticlesComponent } from './components/pillar/bulk-pillar-articles/bulk-pillar-articles.component';


@NgModule({
  declarations: [
    AppComponent,
    SingleProductComponent,
    NavbarComponent,
    HomeComponent,
    EditorComponent,
    BulkSingleProductComponent,
    SettingsComponent,
    AmazonComponent,
    BulkTableComponent,
    BlogPostComponent,
    SingleArticleComponent,
    BulkArticlesComponent,
    BulkTableArticlesComponent,
    PillarComponent,
    SinglePillarArticleComponent,
    BulkPillarArticlesComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CKEditorModule,
    MatStepperModule,
    MatInputModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      "radius": 60,
      "outerStrokeWidth": 10,
      "innerStrokeWidth": 5,
      "responsive": true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
