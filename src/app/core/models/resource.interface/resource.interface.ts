/**
 * Legacy path kept so old imports don't break.
 *
 * The canonical model now lives in `../models`. This file used to define a
 * second, narrower `Resource` interface plus an empty placeholder component;
 * keeping both meant two shapes for the same thing, so it is now a re-export.
 */
export type {
  Resource,
  ResourceStatus,
  ResourceType,
} from '../models';

export { ResourceInterface } from './resource.interface.component';
