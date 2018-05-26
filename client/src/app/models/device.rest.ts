import {Control} from './control';

export interface RestDevice<C extends Control<any>> {
  readonly index: number;
  readonly position: [number, number];
  readonly type: string;
  readonly title: string;
  readonly control: C;
  readonly successors?: number[];
}
