import type { Config } from '~/config'

export interface RunningConfig extends Config {
  originalConfig: Readonly<Config>
  
}
