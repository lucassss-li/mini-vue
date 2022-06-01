import { ITERATE_KEY, track, trigger } from './effect'
import {
    reactive,
    ReactiveFlags,
    reactiveMap,
    skipKeys,
    toRaw,
} from './reactive'

export const baseHandlers = {
    get(target, key: string | symbol, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        } else if (
            key === ReactiveFlags.RAW &&
            receiver === reactiveMap.get(target)
        ) {
            return target
        }
        track(target, key)
        const val = Reflect.get(target, key, receiver)
        if (skipKeys.has(key)) {
            return val
        }
        return reactive(val)
    },
    set(target, key: string | symbol, value: any, receiver) {
        const oldValue = Reflect.get(target, key, receiver)
        const rawValue = toRaw(value)
        if (oldValue === rawValue) return rawValue
        const res = Reflect.set(target, key, rawValue, receiver)
        toRaw(receiver) === target && trigger(target, key)
        return res
    },
    deleteProperty(target, key: string | symbol) {
        const res = Reflect.deleteProperty(target, key)
        trigger(target, key)
        return res
    },
    has(target, key: string | symbol) {
        const res = Reflect.has(target, key)
        track(target, key)
        return res
    },
    ownKeys(target) {
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
    },
}
