import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSingleProductComponent } from './bulk-single-product.component';

describe('BulkSingleProductComponent', () => {
  let component: BulkSingleProductComponent;
  let fixture: ComponentFixture<BulkSingleProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkSingleProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkSingleProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
