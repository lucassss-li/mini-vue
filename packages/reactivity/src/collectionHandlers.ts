import { hasOwn } from './index'
import { reactive, ReactiveFlags, toRaw } from './reactive'
import { track, trigger } from './effect'

const instruments = {
    set(this: Map<any, any>, key: any, value: any) {
        const rawTarget = toRaw(this)
        const rawKey = toRaw(key)
        const rawValue = toRaw(value)
        const res = rawTarget.set(rawKey, rawValue)
        trigger(rawTarget, rawKey)
        return res
    },
    has(this: Map<any, any> | Set<any>, key: any) {
        const rawTarget = toRaw(this)
        const rawKey = toRaw(key)
        track(rawTarget, rawKey)
        return rawTarget.has(rawKey, rawKey)
    },
    get(this: Map<any, any>, key: any) {
        const rawTarget = toRaw(this)
        const rawKey = toRaw(key)
        const rawValue = rawTarget.get(rawKey)
        track(rawTarget, rawKey)
        return reactive(rawValue)
    },
    add(this: Set<any>, key: any) {
        const rawTarget = toRaw(this)
        const rawKey = toRaw(key)
        const res = rawTarget.add(rawKey)
        trigger(rawTarget, rawKey)
        return res
    },
    delete(this: Map<any, any> | Set<any>, key: any) {
        const rawTarget = toRaw(this)
        const rawKey = toRaw(key)
        const res = rawTarget.delete(rawKey)
        trigger(rawTarget, rawKey)
        return res
    },
}

export const collectionHandlers = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        } else if (key === ReactiveFlags.RAW) {
            return target
        }
        return Reflect.get(
            hasOwn(instruments, key) && key in target ? instruments : target,
            key,
            receiver,
        )
    },
}
