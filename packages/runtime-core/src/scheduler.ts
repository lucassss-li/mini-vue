export function queueJob(fn) {
    Promise.resolve().then(fn)
}

export function nextTick(fn) {
    Promise.resolve().then(fn)
}
