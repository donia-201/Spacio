import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceInterface } from './resource.interface';

describe('ResourceInterface', () => {
  let component: ResourceInterface;
  let fixture: ComponentFixture<ResourceInterface>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceInterface],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceInterface);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
