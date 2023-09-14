import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PillarComponent } from './pillar.component';

describe('PillarComponent', () => {
  let component: PillarComponent;
  let fixture: ComponentFixture<PillarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PillarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PillarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
