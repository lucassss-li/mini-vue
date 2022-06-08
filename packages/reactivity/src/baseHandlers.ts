import { ITERATE_KEY, track, trigger } from './effect'
import {
    reactive,
    ReactiveFlags,
    reactiveMap,
    skipKeys,
    toRaw,
} from './reactive'
import { isRef } from './ref'

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
        if (isRef(val)) {
            return val.value
        }
        return reactive(val)
    },
    set(target, key: string | symbol, value: any, receiver) {
        const oldValue = Reflect.get(target, key, receiver)
        const rawValue = toRaw(value)
        let res
        if (isRef(oldValue)) {
            res = oldValue.value = rawValue
        } else {
            if (oldValue === rawValue) return rawValue
            res = Reflect.set(target, key, rawValue, receiver)
        }
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
