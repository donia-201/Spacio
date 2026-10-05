/**
 * Legacy path kept so old imports don't break.
 *
 * The real service is `../booking.service`. This was a second class with the
 * same name and a `createBooking(resourceId)` that posted only a `resource`
 * field, which the backend rejects — it requires `organization`,
 * `startTime` and `endTime` too.
 */
export { BookingService } from '../booking.service';
