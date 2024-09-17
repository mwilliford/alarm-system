import { z } from 'zod'

export const SensorRoles = ['immediate', 'delayed', 'perimeter', 'tamper', 'fire'] as const
export const SensorRoleSchema = z.enum(SensorRoles)
export type SensorRoleType = z.infer<typeof SensorRoleSchema>

export const SensorSpecSchema = z.object({
  id: z.number(),
  role: SensorRoleSchema,
})

export type SensorSpec = z.infer<typeof SensorSpecSchema>

export const SensorSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export type Sensor = z.infer<typeof SensorSchema>
