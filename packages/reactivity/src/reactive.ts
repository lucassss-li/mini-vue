import { baseHandlers } from './baseHandlers'
import { collectionHandlers } from './collectionHandlers'

import { isObject, toRawType } from './index'

export const skipKeys = new Set<string | symbol>(['__proto__'])

export const enum ReactiveFlags {
    IS_REACTIVE = 'is_reactive',
    RAW = '__v_raw',
}
export type Target = {
    [ReactiveFlags.IS_REACTIVE]?: boolean
    [ReactiveFlags.RAW]?: any
}

const enum TargetType {
    INVALID = 0,
    COMMON = 1,
    COLLECTION = 2,
}

function getTargetType(target: unknown) {
    switch (toRawType(target)) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}

export const reactiveMap = new WeakMap<Target, any>()

export function reactive<T extends object>(
    target: T,
): { [K in keyof T]: T[K] } {
    if (!isObject(target)) {
        return target
    }
    if (isReactive(target)) {
        return target
    }
    if (reactiveMap.has(target)) {
        return reactiveMap.get(target)
    }
    const type = getTargetType(target)
    const proxy = new Proxy(
        target,
        type === TargetType.COMMON ? baseHandlers : collectionHandlers,
    )
    reactiveMap.set(target, proxy)
    return proxy
}

export const isReactive = (val): boolean => {
    return !!(val as Target)[ReactiveFlags.IS_REACTIVE]
}

export const toRaw = (target: unknown) => {
    const raw = (target as Target)[ReactiveFlags.RAW]
    return raw ? toRaw(raw) : target
}
