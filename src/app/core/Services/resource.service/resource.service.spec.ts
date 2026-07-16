import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  let component: ResourceService;
  let fixture: ComponentFixture<ResourceService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceService],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
