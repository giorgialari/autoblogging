import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkArticlesComponent } from './bulk-articles.component';

describe('BulkArticlesComponent', () => {
  let component: BulkArticlesComponent;
  let fixture: ComponentFixture<BulkArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkArticlesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
