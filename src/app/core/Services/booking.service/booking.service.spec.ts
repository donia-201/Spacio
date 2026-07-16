import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingService } from './booking.service';

describe('BookingService', () => {
  let component: BookingService;
  let fixture: ComponentFixture<BookingService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingService],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
