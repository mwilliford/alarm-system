import { type MachineContext, setup } from 'xstate'

/**
 * Main state machine system for general alarm system
 */
const FSMSetup = setup({
  types: {
    context: {} as MachineContext,
    events: {} as
    | { type: 'arm' }
    | { type: 'boot' }
    | { type: 'alarm' }
    | { type: 'fault' }
    | { type: 'breach' }
    | { type: 'disarm' }
    | { type: 'alarmAcknowledge' },
  },
  guards: {
    guard_boot_success({ context: _conext, event: _event }) {
      // Add your guard condition here
      return true
    },
  },
})

interface SecurityContext {}

export function createMachine(_context: SecurityContext): unknown { // todo: fix
  return FSMSetup.createMachine({
    context: {},
    id: 'AlarmMachine',
    initial: 'startup',
    states: {
      startup: {
        on: {
          boot: [
            {
              target: 'standby',
              guard: {
                type: 'guard_boot_success',
              },
            },
            {
              target: 'error',
            },
          ],
          fault: {
            target: 'error',
          },
        },
      },
      standby: {
        on: {
          arm: {
            target: 'Armed',
          },
        },
      },
      error: {},
      Armed: {
        on: {
          breach: {
            target: 'Alarm',
          },
          disarm: {
            target: 'standby',
          },
        },
      },
      Alarm: {
        after: {
          alarmTimeout: {
            target: 'postAlarm',
          },
        },
      },
      postAlarm: {
        on: {
          alarmAcknowledge: {
            target: 'standby',
          },
        },
      },
    },
  })
}
