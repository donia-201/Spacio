import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TechnicianLayout } from './technician-layout';

describe('TechnicianLayout', () => {
  let fixture: ComponentFixture<TechnicianLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianLayout],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnicianLayout);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
