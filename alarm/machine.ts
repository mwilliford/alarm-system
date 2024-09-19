import type { Config } from '../config'
import type { AlarmSensorRoleType } from '../types'
import type { SensorUpdateEvent } from './event'
import { assign } from '@xstate/immer'
import { createActor, fromPromise, sendTo, setup } from 'xstate'
import { getTransitionEntryActions } from './actions'
import { TransitionEvents } from './event'
import { SensorEventService } from './service'

type BootCallback = () => Promise<BootInfo | undefined>

export interface AlarmMachineConfig {
  config: Config
  onBoot?: BootCallback
  onArmed?: () => void
  onAlarm?: () => void
  onPostAlarm?: () => void
  onPreAlarm?: () => void
  onStandby?: () => void
  onNotReady?: () => void
  onError?: () => void
  alarmTimeout?: number
  prealarmTimeout?: number
}

export interface BootInfo {
  data: Record<PropertyKey, unknown>
}

export interface Context extends AlarmMachineConfig {
  bootInfo?: BootInfo
}

export function createMachine(config: AlarmMachineConfig) {
  const FSMSetup = setup({
    types: {
      input: {} as AlarmMachineConfig,
      context: {
        config: {} as Config,
        onBoot: {} as BootCallback | undefined,
        bootInfo: {} as BootInfo | undefined,
      } satisfies Context,
      events: TransitionEvents,
    },
    actors: {
      boot: fromPromise<BootInfo | undefined, { bootCallback: BootCallback | undefined }>(async ({ input }) => {
        if (input?.bootCallback) {
          return await input.bootCallback()
        } else {
          return undefined
        }
      }),
    'SensorEventService': SensorEventService,
    },
    guards: {
    },
    delays: {
      alarmTimeout: config.alarmTimeout ?? 60 * 1000, // how long the alarm will sound before doing into postAlarm state
      prealarmTimeout: config.prealarmTimeout ?? 30 * 1000, // how long you have to disarm before the alarm goes off
    },
    actions: getTransitionEntryActions(config),
  })

  const machine = FSMSetup.createMachine({
    context: ({ input }) => ({
      config: input.config,
      onBoot: input.onBoot,
      bootInfo: undefined,
    }) satisfies Context,
    id: 'AlarmMachine',
    initial: 'startup',
    states: {
      startup: {
        invoke: {
          src: 'boot',
          input: ({ context }) => ({ bootCallback: context.onBoot }),
          onDone: {
            target: 'standby',
            actions: assign((context: Context & { event: { output: BootInfo } }) => {
              context.bootInfo = context.event.output
            }),
          },
          onError: {
            target: 'Error',
          },
        },
      },
      standby: {
        entry: 'onStandby',
        on: {
          BREACH_IMMEDIATE: {
            target: 'NotReady',
          },
          BREACH_DELAYED: {
            target: 'NotReady',
          },
          BREACH_TAMPER: {
            target: 'Alarm',
          },
          arm: {
            target: 'Armed',
          },
        },
      },
      NotReady: {
        entry: 'onNotReady',
        on: {
          STANDBY: {
            target: 'standby',
          },
          BREACH_TAMPER: {
            target: 'Alarm',
          },
        },
      },
      Error: {
        entry: 'onError',
      },
      Armed: {
        entry: 'onArmed',
        on: {
          BREACH_IMMEDIATE: {
            target: 'Alarm',
          },
          BREACH_DELAYED: {
            target: 'PreAlarm',
          },
          BREACH_TAMPER: {
            target: 'Alarm',
          },
          disarm: {
            target: 'standby',
          },
        },
      },
      Alarm: {
        entry: 'onAlarm',
        on: {
          disarm: {
            target: 'standby',
          },
        },
      },
      PreAlarm: {
        entry: 'onPreAlarm',
        on: {
          BREACH_TAMPER: {
            target: 'Alarm',
          },
        },
      },
      PostAlarm: {
        entry: 'onPostAlarm',
        on: {
          alarmAcknowledge: {
            target: 'standby',
          },
        },
      },
    },
    invoke: {
      src: 'SensorEventService',
      id: 'SensorEventService',
    },
    on: {
      SENSOR_UPDATE: {
        actions: sendTo('SensorEventService', ({ event }) => {
          return event
        }),
      },
    },
  })

  const actor = createActor(machine, {
    input: config,
  })
  actor.subscribe((snapshot) => {
    console.log(snapshot.value)
  })

  /**
   * State machine action to breach a sensor role, or to put it in standby
   *
   * The state machine does not care which sensor cause it, just that the zone/role is breached.
   *
   * A layer prior to this should be responsible for determining the sensor that caused the breach,
   * track state, and then call this function.
   *
   *
   * @param state
   * @param role
   */
  const sensorUpdate = (state: 'breach' | 'standby', role: AlarmSensorRoleType): void => {
    const event: SensorUpdateEvent = {
      type: 'SENSOR_UPDATE',
      state,
      role,
    }
    console.log('sensorUpdate', event)
    actor.send(event)
  }

  actor.start()
  return {
    actor,
    sensorUpdate,
  }
}
