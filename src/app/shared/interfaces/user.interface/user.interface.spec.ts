import { TestBed } from '@angular/core/testing';

import { UserInterface } from './user.interface';

describe('UserInterface (legacy path)', () => {
  it('still creates as an empty placeholder component', () => {
    TestBed.configureTestingModule({ imports: [UserInterface] });

    expect(TestBed.createComponent(UserInterface).componentInstance).toBeTruthy();
  });
});
