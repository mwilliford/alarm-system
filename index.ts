import type { Config } from './config'
import { createMachine } from './alarm/machine'

export * from './types'

interface SystemOpts {
  config: Config
}
interface SystemInstance {
  config: Config
}

// top level API access, create an instance
export const System = {

  /**
   *
   * @param opts
   * @returns A new SystemInstance
   */
  create: (opts: SystemOpts): SystemInstance => {
    // init the state machine
    createMachine(opts.config)
    return {
      config: opts.config,
    }
  },
}
