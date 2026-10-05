import { TestBed } from '@angular/core/testing';

import { ResourceInterface } from './resource.interface';

describe('ResourceInterface (legacy path)', () => {
  it('still creates as an empty placeholder component', () => {
    TestBed.configureTestingModule({ imports: [ResourceInterface] });

    expect(TestBed.createComponent(ResourceInterface).componentInstance).toBeTruthy();
  });
});
