/**
 * Leading + trailing throttle. Slider drags fire dozens of events per second; the daemon only
 * needs a few, but must always receive the final value.
 */
export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait = 50) {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: A | undefined

  return (...args: A) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    pending = args
    if (remaining <= 0) {
      clearTimeout(timer)
      timer = undefined
      last = now
      fn(...args)
      pending = undefined
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now()
        timer = undefined
        if (pending) fn(...pending)
        pending = undefined
      }, remaining)
    }
  }
}
