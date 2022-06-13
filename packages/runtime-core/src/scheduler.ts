export function queueJob(fn) {
    Promise.resolve().then(fn)
}
