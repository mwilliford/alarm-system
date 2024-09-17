import _ from 'lodash'
import { type Config, parseConfig } from '~/config'

describe('config', () => {
  const config: Readonly<Config> = {
    zones: [
      {
        id: 0,
        name: 'zone1',
        type: 'Alarm',
        sensors: [
          {
            id: 0,
            role: 'delayed',
          },
        ],
      },
    ],
    sensors: [
      {
        id: 0,
        name: 'sensor1',
      },
    ],
  }

  it('should be valid', () => {
    expect(() => parseConfig(config)).not.toThrow()
  })

  it('should throw if it does not have zones', () => {
    // @ts-expect-error testing
    expect(() => parseConfig(_.omit(_.cloneDeep(config), 'zones'))).toThrow()
  })

  it('should throw if it does not have sensors', () => {
    // @ts-expect-error testing
    expect(() => parseConfig(_.omit(_.cloneDeep(config), 'sensors'))).toThrow()
  })

  it('should throw if sensor id is missing in sensors array', () => {
    // sensors in the sensors array must be listed if included in a zone.
    expect(() => parseConfig(_.set(_.cloneDeep(config), 'sensors[0].id', 2))).toThrow('Sensor with id 0 is not included in the sensors array')
  })

  it('should allow senors in the sensors array to be listed, but not used in a zone', () => {
    // sensors in the sensors array must be listed if included in a zone.
    expect(() => parseConfig(_.set(_.cloneDeep(config), 'sensors[1]', { id: 1, name: 'sensor2' }))).not.toThrow()
  })
})
