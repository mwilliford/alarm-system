import { z } from 'zod'
import { SensorSchema, ZoneSchema } from './types'

const configSchema = z.object({
  zones: z.array(ZoneSchema),
  sensors: z.array(SensorSchema),
}).refine((config) => {
  // sensors in the zone, must be included in the sensors array
  const zoneSensorIds = new Set(config.zones.flatMap(zone => zone.sensors.map(sensor => sensor.id)))
  const sensorIds = new Set(config.sensors.map(sensor => sensor.id))
  for (const sensorId of zoneSensorIds) {
    if (!sensorIds.has(sensorId)) {
      return false
    }
  }
  return true
}, (config) => {
  const zoneSensorIds = new Set(config.zones.flatMap(zone => zone.sensors.map(sensor => sensor.id)))
  const sensorIds = new Set(config.sensors.map(sensor => sensor.id))
  for (const sensorId of zoneSensorIds) {
    if (!sensorIds.has(sensorId)) {
      return {
        message: `Sensor with id ${sensorId} is not included in the sensors array`,
        params: {
          id: 0,
        },
      }
    }
  }
  return {}
})

export type Config = z.infer<typeof configSchema>

/**
 *
 * Will throw if the config is not valid
 *
 * @param config
 * @returns a parsed config object
 */
export function parseConfig(config: Config): Config {
  return configSchema.parse(config)
}
