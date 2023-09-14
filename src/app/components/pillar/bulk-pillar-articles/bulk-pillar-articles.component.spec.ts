import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkPillarArticlesComponent } from './bulk-pillar-articles.component';

describe('BulkPillarArticlesComponent', () => {
  let component: BulkPillarArticlesComponent;
  let fixture: ComponentFixture<BulkPillarArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkPillarArticlesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkPillarArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
