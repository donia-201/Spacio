import { DistancePipe } from './distance-pipe';

describe('DistancePipe', () => {
  const pipe = new DistancePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('uses metres below a kilometre', () => {
    expect(pipe.transform(0)).toBe('0 متر');
    expect(pipe.transform(450)).toBe('450 متر');
    expect(pipe.transform(999)).toBe('999 متر');
  });

  it('switches to kilometres at 1km', () => {
    expect(pipe.transform(1000)).toBe('1.0 كم');
    expect(pipe.transform(2500)).toBe('2.5 كم');
  });

  it('returns an empty string when there is no distance', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
