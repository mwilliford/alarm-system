import { fromCallback } from 'xstate'
import type { AlarmSensorRoleType } from '~/types'
import { BREACH_DELAYED, BREACH_IMMEDIATE, BREACH_TAMPER, type SensorUpdateEvent, STANDBY } from './event'

function assertUnreachable(x: never): never {
  throw new Error(`impossible: ${x}`)
}

// Exhaustive switch for creating the right event based on the state and role
function getBreachEventByRole(role: AlarmSensorRoleType) {
  switch (role) {
    case 'immediate':
      return BREACH_IMMEDIATE
    case 'delayed':
      return BREACH_DELAYED
    case 'tamper':
      return BREACH_TAMPER
    default:
      assertUnreachable(role)
  }
}

export const SensorEventService = fromCallback (
  ({
    sendBack,
    receive,
  }: {
    sendBack: (event: any) => void
    receive: (fn: (event: SensorUpdateEvent) => void) => void
  }) => {
    console.log(receive)
    // The job here is to fire the right event to the machine, based on the new sensor state
    receive((event) => {
      console.log('SensorEventService', event)
      if (event.type === 'SENSOR_UPDATE') { // shouldn't this be always true?
        if (event.state === 'standby') {
          sendBack(STANDBY)
        } else {
          sendBack(getBreachEventByRole(event.role))
        }
      }
    })
    return () => {
      console.log('SensorEventService cleanup')
    }
  },
)
