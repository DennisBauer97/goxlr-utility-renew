import type { DaemonCommand, DaemonRequest, GoXLRCommand } from './types'

/**
 * Builds a serde externally-tagged tuple variant. serde writes `Foo()` as `{"Foo": []}`,
 * `Foo(a)` as `{"Foo": a}` and `Foo(a, b)` as `{"Foo": [a, b]}`.
 */
export function variant(name: string, ...args: unknown[]): { [name: string]: unknown } {
  if (args.length === 0) return { [name]: [] }
  if (args.length === 1) return { [name]: args[0] }
  return { [name]: args }
}

export const goxlr = (name: string, ...args: unknown[]): GoXLRCommand => variant(name, ...args)

/** Unit variants (`OpenUi`, `StopDaemon`, ...) serialise as a bare string. */
export function daemon(name: string, ...args: unknown[]): DaemonCommand {
  return args.length === 0 ? name : variant(name, ...args)
}

export const commandRequest = (serial: string, command: GoXLRCommand): DaemonRequest => ({
  Command: [serial, command],
})

export const daemonRequest = (command: DaemonCommand): DaemonRequest => ({ Daemon: command })
