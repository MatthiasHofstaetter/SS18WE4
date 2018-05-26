import {Control} from './control';

export interface AvailableDevice {
  title: string;
  type: string;
  image: string;
  control: Control<any>;
}
