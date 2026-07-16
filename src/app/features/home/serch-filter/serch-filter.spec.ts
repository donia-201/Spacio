import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerchFilter } from './serch-filter';

describe('SerchFilter', () => {
  let component: SerchFilter;
  let fixture: ComponentFixture<SerchFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerchFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(SerchFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
