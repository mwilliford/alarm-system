import { waitFor } from 'xstate'
import type { BootInfo } from '~/alarm/machine'
import { createMachine } from '~/alarm/machine'
import type { Config } from '~/config'

describe('alarmMachine', () => {
  const config: Config = {
    zones: [
      {
        id: 1,
        name: 'zone1',
        type: 'Alarm',
        sensors: [
          {
            id: 1,
            role: 'immediate',
          },
          {
            id: 2,
            role: 'delayed',
          },
          {
            id: 3,
            role: 'tamper',
          },
        ],
      },
    ],
    sensors: [
      {
        id: 1,
        name: 'sensor1',
      },
      {
        id: 2,
        name: 'sensor2',
      },
      {
        id: 3,
        name: 'sensor3',
      },
    ],
  }

  const bootInfo: BootInfo = {
    data: {
      success: true,
    },
  }

  it('should start up in standby', async () => {
    const bootFn = vi.fn().mockResolvedValueOnce(bootInfo)
    const { actor } = createMachine({
      config,
      onBoot: bootFn,
    })
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 100 })

    expect(bootFn).toHaveBeenNthCalledWith(1)
    expect(actor.getSnapshot().context.bootInfo).toEqual(bootInfo)
    expect(actor.getSnapshot().value).toEqual('standby')
  })

  it('should response to an immediate breach event', async () => {
    const bootFn = vi.fn().mockResolvedValueOnce(bootInfo)
    const onStandby = vi.fn()
    const onArmed = vi.fn()
    const onAlarm = vi.fn()
    const onPostAlarm = vi.fn()
    const { actor, sensorUpdate } = createMachine({
      config,
      onBoot: bootFn,
      onStandby,
      onArmed,
      onAlarm,
      onPostAlarm,
    })
    expect(onStandby).not.toHaveBeenCalled()
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 100 })
    expect(onStandby).toHaveBeenCalledTimes(1)

    expect(onArmed).not.toHaveBeenCalled()
    actor.send({ type: 'arm' })
    await waitFor(actor, ctx => ctx.value === 'Armed', { timeout: 100 })
    expect(onArmed).toHaveBeenCalledTimes(1)

    expect(onAlarm).not.toHaveBeenCalled()
    sensorUpdate('breach', 'immediate')
    await waitFor(actor, ctx => ctx.value === 'Alarm', { timeout: 100 })
    expect(onAlarm).toHaveBeenCalledTimes(1)
    expect(actor.getSnapshot().value).toEqual('Alarm')
  })
  it('should response to a delayed breach event', async () => {
    const { actor, sensorUpdate } = createMachine({
      config,
    })
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 100 })
    actor.send({ type: 'arm' })
    sensorUpdate('breach', 'delayed')
    expect(actor.getSnapshot().value).toEqual('PreAlarm')
  })
  it('should response to a tamper breach event', async () => {
    const { actor, sensorUpdate } = createMachine({
      config,
    })
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 100 })
    actor.send({ type: 'arm' })
    sensorUpdate('breach', 'tamper')
    expect(actor.getSnapshot().value).toEqual('Alarm')
  })
  it('should respond to a tamper event while in standby mode', async () => {
    const { actor, sensorUpdate } = createMachine({
      config,
    })
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 100 })
    sensorUpdate('breach', 'tamper')
    expect(actor.getSnapshot().value).toEqual('Alarm')
  })
  it('should go into NotReady from standby when there are breaches, and back when breach normalized', async () => {
    const { actor, sensorUpdate } = createMachine({
      config,
    })
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 100 })
    sensorUpdate('breach', 'immediate')
    expect(actor.getSnapshot().value).toEqual('NotReady')
    expect(actor.getSnapshot().value).toEqual('NotReady')
    sensorUpdate('standby', 'immediate')
    await waitFor(actor, ctx => ctx.value === 'standby', { timeout: 1000 })
  })
})
