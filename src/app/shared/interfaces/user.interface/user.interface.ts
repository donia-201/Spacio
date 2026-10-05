/**
 * Legacy path kept so old imports don't break.
 *
 * The canonical model is `../../../core/models`. This file used to declare a
 * second `User` interface with `role: string` — too loose to catch an invalid
 * role — plus an empty placeholder component.
 */
export type { User } from '../../../core/models/models';

export { UserInterface } from './user.interface.component';
