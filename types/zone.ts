import { z } from 'zod'

// types of zones we support
export const Zones = ['Alarm', 'Fire', 'Perimeter'] as const
export const zoneTypeSchema = z.enum(Zones)
export type ZoneTypes = z.infer<typeof zoneTypeSchema>

function createZoneSchema<T extends ZoneTypes, U extends [string, ...string[]]>(type: T, rolesSchema: z.ZodEnum<U>) {
  return z.object({
    id: z.number(),
    type: z.literal(type),
    name: z.string(),
    sensors: z.array(z.object({
      id: z.number(),
      role: rolesSchema,
    })),
  })
}

/**
 *
 * This is where we configure the type of sensors roles that each zone can have.
 * This impacts how the sensor is used in each zone.  For example, a sensor with
 * a tamper role, may setoff the alram even when not armed.
 */

// Alarm config functionality
export const AlarmSensorRoles = ['immediate', 'delayed', 'tamper'] as const
export const AlarmSensorRoleSchema = z.enum(AlarmSensorRoles)
export const AlarmZoneSchema = createZoneSchema('Alarm', AlarmSensorRoleSchema)

// Fire config functionality
export const FireSensorRoles = ['fire'] as const
export const FireSensorRoleSchema = z.enum(FireSensorRoles)
export const FireZoneSchema = createZoneSchema('Fire', FireSensorRoleSchema)

// Perimeter config functionality
export const PerimeterSensorRoles = ['perimeter'] as const
export const PerimeterSensorRoleSchema = z.enum(PerimeterSensorRoles)
export const PerimeterZoneSchema = createZoneSchema('Perimeter', PerimeterSensorRoleSchema)

export const ZoneSchema = z.discriminatedUnion('type', [
  AlarmZoneSchema,
  FireZoneSchema,
  PerimeterZoneSchema,
])
