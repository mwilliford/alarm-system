import type { AlarmMachineConfig } from './machine'
import type { AlarmSensorRoleType } from '~/types'

// stores the breach state of a sensor (it is actively alarming)
export interface BreachEntry {
  id: number
  role: AlarmSensorRoleType
}

// export const breachUpdateEventActions = {
//   [breachUpdater.type]: [
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
// } as const

// export const breachUpdateTamperAction = {
//   [breachUpdater.type]: [
//     {
//       actions: breachUpdater.action,
//       guard: 'SENSOR_TAMPER',
//       target: 'Alarm',
//     },
//   ],
// } as const

export function getTransitionEntryActions(config: AlarmMachineConfig) {
  return {
    onArmed: () => {
      if (config.onArmed) {
        config.onArmed()
      }
    },
    onAlarm: () => {
      if (config.onAlarm) {
        config.onAlarm()
      }
    },
    onPreAlarm: () => {
      if (config.onPreAlarm) {
        config.onPreAlarm()
      }
    },
    onPostAlarm: () => {
      if (config.onPostAlarm) {
        config.onPostAlarm()
      }
    },
    onStandby: () => {
      if (config.onStandby) {
        config.onStandby()
      }
    },
    onNotReady: () => {
      if (config.onNotReady) {
        config.onNotReady()
      }
    },
    onError: () => {
      if (config.onError) {
        config.onError()
      }
    },
  }
}
