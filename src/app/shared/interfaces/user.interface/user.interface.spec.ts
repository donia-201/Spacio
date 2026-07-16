import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInterface } from './user.interface';

describe('UserInterface', () => {
  let component: UserInterface;
  let fixture: ComponentFixture<UserInterface>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInterface],
    }).compileComponents();

    fixture = TestBed.createComponent(UserInterface);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
