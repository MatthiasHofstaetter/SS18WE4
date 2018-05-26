/**
 * Definition for the control for a device
 */
export interface Control<T> {

  /**
   * Title of this control
   */
  title: string;

  /**
   * Type of this control (ENUM, BOOLEAN, CONTINUOUS)
   */
  type: ControlType;

  /**
   * The current value for this control (number iff type is CONTINUOUS or ENUM, boolean if type is BOOLEAN)
   */
  current: T;

  /**
   * Previous changes to this control
   */
  log: LogEntry<T>[];
}

export interface BooleanControl extends Control<boolean> {
  /**
   * Lock the type to BOOLEAN
   */
  type: ControlType.BOOLEAN;
}

export interface EnumControl extends Control<number> {
  /**
   * Lock the type to ENUM
   */
  type: ControlType.ENUM;

  /**
   * Possible values for this control
   */
  readonly values: string[];
}

export interface ContinuousControl extends Control<number> {
  /**
   * Lock the type to CONTINUOUS
   */
  type: ControlType.CONTINUOUS;

  /**
   * Label for the y-axis of the plot
   */
  readonly yLabel: string;

  /**
   * Minimum value for this control
   */
  readonly min: number;

  /**
   * Maximum value for this control
   */
  readonly max: number;
}

/**
 * One entry in the list of logs
 */
export interface LogEntry<T> {
  readonly date: Date;
  readonly oldValue: T;
  readonly newValue: T;
}

export enum ControlType {
  BOOLEAN = 'boolean',
  ENUM = 'enum',
  CONTINUOUS = 'continuous'
}
