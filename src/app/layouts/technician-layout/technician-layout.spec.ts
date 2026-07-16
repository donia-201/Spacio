import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianLayout } from '../../technician-layout/technician-layout';

describe('TechnicianLayout', () => {
  let component: TechnicianLayout;
  let fixture: ComponentFixture<TechnicianLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnicianLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
