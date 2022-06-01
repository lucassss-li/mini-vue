export const ITERATE_KEY = Symbol('iterate')

type Options = {
    lazy?: boolean
    scheduler?: (...args) => any
}

const fnToDeps = new Map()

function cleanup() {
    if (!activeFn) return
    const fnDeps = fnToDeps.get(activeFn)
    if (!fnDeps) return
    fnDeps.forEach(deps => deps.delete(activeFn))
}

let activeFn: null | ((...argv) => any) = null
export function effect(fn, options: Options = {}) {
    const { lazy, scheduler } = options
    const _fn = (flag = false) => {
        ;(_fn as any).parentFn = activeFn
        activeFn = _fn
        cleanup()
        const res = !flag && scheduler ? scheduler() : fn()
        activeFn = (_fn as any).parentFn
        return res
    }
    if (!lazy) {
        _fn(true)
    }
    return () => {
        return _fn(true)
    }
}

const targetToKeyDepsMap = new Map()

export function track(target: any, key: string | symbol) {
    if (!activeFn) return
    let deps = targetToKeyDepsMap.get(target)
    if (!deps) {
        deps = new Map()
        targetToKeyDepsMap.set(target, deps)
    }
    let dep = deps.get(key)
    if (!dep) {
        dep = new Set()
        deps.set(key, dep)
    }
    let fnDeps = fnToDeps.get(activeFn)
    if (!fnDeps) {
        fnDeps = new Set()
        fnToDeps.set(activeFn, fnDeps)
    }
    fnDeps.add(dep)
    dep.add(activeFn)
}

export function trigger(target: any, key: string | symbol) {
    const fns: any[] = []
    const deps = targetToKeyDepsMap.get(target)
    if (!deps) {
        return
    }
    addEffects(deps, Array.isArray(target) ? 'length' : ITERATE_KEY, fns)
    addEffects(deps, key, fns)
    fns.forEach(fn => fn())
}

function addEffects(deps, key, fns) {
    const dep = deps.get(key)
    dep && fns.push(...dep.values())
}
