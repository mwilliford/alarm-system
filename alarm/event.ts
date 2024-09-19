import type { AlarmSensorRoleType } from '~/types'

// Events for transition, external are capitalized
export type EventTypeNames = 'arm' | 'boot' | 'error' | 'disarm' | 'alarmAcknowledge' | 'SENSOR_UPDATE'

interface SensorUpdateEventBase {
  type: 'SENSOR_UPDATE'
}

export interface SensorUpdateBreach extends SensorUpdateEventBase {
  state: 'breach'
  role: AlarmSensorRoleType
}

export interface SensorUpdateStandby extends SensorUpdateEventBase {
  state: 'standby'
}

export type SensorUpdateEvent = SensorUpdateBreach | SensorUpdateStandby

export const BREACH_IMMEDIATE = { type: 'BREACH_IMMEDIATE' } as const
export const BREACH_DELAYED = { type: 'BREACH_DELAYED' } as const
export const BREACH_TAMPER = { type: 'BREACH_TAMPER' } as const
export const STANDBY = { type: 'STANDBY' } as const

type SensorUpdateStateEvents =
  typeof BREACH_IMMEDIATE | typeof BREACH_DELAYED | typeof BREACH_TAMPER | typeof STANDBY
type SensorUpdateStateEventNames = SensorUpdateStateEvents['type']

export const TransitionEvents = {} as
  | { type: 'arm' }
  | { type: 'boot' }
  | { type: 'error' }
  | { type: 'disarm' }
  | { type: 'SENSOR_UPDATE' }
  | { type: 'BREACH_IMMEDIATE' }
  | { type: 'BREACH_DELAYED' }
  | { type: 'BREACH_TAMPER' }
  | { type: 'STANDBY' }
  | { type: 'alarmAcknowledge' } satisfies { type: EventTypeNames | SensorUpdateStateEventNames }

// type ValidEventBlocks = {
//   [K in EventTypeNames]?: Array<{
//     readonly guard: string
//     readonly target: string
//   }>
// }

// // transitions related to a breach
// export const breachTransitionEvents = {
//   TRANSITION_BREACH: [
//     {
//       guard: 'SENSOR_IMMEDIATE',
//       target: 'Alarm',
//     },
//     {
//       guard: 'SENSOR_DELAYED',
//       target: 'PreAlarm',
//     },
//     {
//       guard: 'SENSOR_TAMPER',
//       target: 'Alarm',
//     },
//   ],
// } as const satisfies ValidEventBlocks

// export const breachStandbyEvents = {
//   TRANSITION_BREACH: [
//     {
//       guard: 'SENSOR_TAMPER',
//       target: 'Alarm',
//     },
//     {
//       guard: 'SENSOR_IMMEDIATE',
//       target: 'NotReady',
//     },
//     {
//       guard: 'SENSOR_DELAYED',
//       target: 'NotReady',
//     },
//   ],
// } as const satisfies ValidEventBlocks
