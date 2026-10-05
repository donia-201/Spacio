import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Landing } from './landing';
import { withAppTestDeps } from '../../shared/testing/test-deps';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let component: Landing;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [...withAppTestDeps(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // The component fires the categories request in ngOnInit.
    http.match(() => true).forEach((req) => req.flush({ success: true, data: { categories: [] } }));
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('falls back to the static category list when the API returns nothing', () => {
    expect(component.categories().length).toBeGreaterThan(0);
  });
});
