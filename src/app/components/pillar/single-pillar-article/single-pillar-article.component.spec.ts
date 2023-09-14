import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePillarArticleComponent } from './single-pillar-article.component';

describe('SinglePillarArticleComponent', () => {
  let component: SinglePillarArticleComponent;
  let fixture: ComponentFixture<SinglePillarArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SinglePillarArticleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SinglePillarArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
