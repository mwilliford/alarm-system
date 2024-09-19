export type SensorState = 'breach' | 'standby' // meaning on == triggers, off == normal or safe state

export interface SensorAPI {
  setSensorState: (sensorId: number, state: SensorState) => void
}
