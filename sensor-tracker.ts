import type { SensorState } from './api/hardware'

interface SensorData {
  readonly id: number
  state: SensorState
}

type OnSensorStateChange = (state: SensorData) => void
type ObserversArray = Array<OnSensorStateChange>

/**
 * Tracks sensor state and notifies observers when sensor state changes.
 * If you update SensorTracker with the same state, it will not notify observers.
 */
export class SensorTracker {
  sensors: Map<number, SensorData>
  sensorObservers: Map<number, ObserversArray>

  constructor() {
    this.sensors = new Map<number, SensorData>()
    this.sensorObservers = new Map<number, ObserversArray>()
  }

  /**
   * Register a new observer for a sensor.
   *
   * @param id
   * @param observer
   */
  registerSensorObserver(id: number, observer: OnSensorStateChange) {
    const existingObservers = this.sensorObservers.get(id)
    if (existingObservers) {
      existingObservers.push(observer)
    } else {
      this.sensorObservers.set(id, [observer])
    }
  }

  unregisterSensorObserver(id: number, observer: OnSensorStateChange) {
    const observers = this.sensorObservers.get(id)
    if (observers) {
      const index = observers.indexOf(observer)
      if (index !== -1) {
        observers.splice(index, 1)
      }
    }
  }

  private notifyObservers(sensor: SensorData) {
    const observers = this.sensorObservers.get(sensor.id)
    if (observers) {
      observers.forEach(observer => observer(sensor))
    }
  }

  private addSensor(sensor: SensorData) {
    this.sensors.set(sensor.id, sensor)
  }

  private getSensor(id: number) {
    return this.sensors.get(id)
  }

  removeSensor(id: number) {
    this.sensors.delete(id)
  }

  setSensorState(id: number, state: SensorState) {
    const sensor = this.getSensor(id)
    if (sensor) {
      sensor.state = state
    } else {
      const sensorData = { id, state }
      this.addSensor(sensorData)
      this.notifyObservers(sensorData)
    }
  }

  /**
   * Returns the state of the sensor with the given id.
   *
   * @param id
   * @param defaultValue The value to return if the sensor state is unknown, default is null
   * @returns The state of the sensor with the given id, or null if the sensor state is unknown
   */
  getSensorState(id: number, defaultValue: SensorState | null = null): SensorState | null {
    const sensor = this.getSensor(id)
    return sensor ? sensor.state : defaultValue
  }
}
