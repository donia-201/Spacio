import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPipe } from './status-pipe';

describe('StatusPipe', () => {
  const pipe = new StatusPipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('translates resource statuses', () => {
    expect(pipe.transform('available')).toBe('متاح');
    expect(pipe.transform('booked')).toBe('محجوز');
    expect(pipe.transform('maintenance')).toBe('صيانة');
  });

  it('translates booking statuses', () => {
    expect(pipe.transform('pending')).toBe('بانتظار الموافقة');
    expect(pipe.transform('approved')).toBe('مؤكد');
    expect(pipe.transform('rejected')).toBe('مرفوض');
  });

  it('returns an empty string for missing values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('passes unknown values through unchanged', () => {
    expect(pipe.transform('something_new')).toBe('something_new');
  });
});
