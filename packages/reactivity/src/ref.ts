import { activeFn } from './effect'
import { reactive, toRaw } from './reactive'

function isObject(val: any): val is object {
    return typeof val === 'object'
}

const RefSymbol = Symbol()
export class RefImp<T = any> {
    [RefSymbol]: true
    public dep?: Set<(...args) => any> = undefined
    public readonly __v_isRef = true
    constructor(private _value: T) {}
    get value() {
        refTrack(this)
        if (isObject(this._value)) {
            return reactive(this._value) as T
        } else {
            return this._value
        }
    }
    set value(newValue: T) {
        const oldValue = this._value
        this._value = toRaw(newValue)
        if (oldValue !== this._value) {
            refTrigger(this)
        }
    }
}
export function ref<T>(rawValue: T): RefImp<T> {
    return new RefImp<T>(rawValue)
}

function refTrack(ref: RefImp) {
    if (!activeFn) return
    if (!ref.dep) {
        ref.dep = new Set()
    }
    ref.dep.add(activeFn)
}
function refTrigger(ref: RefImp) {
    ref.dep?.forEach(fn => fn())
}

export function isRef(val): boolean {
    return !!(val && val['__v_isRef'])
}

export type UnwrapRefSimple<T> = T extends RefImp<infer V>
    ? UnwrapRefSimple<V>
    : T extends (...args) => any
    ? T
    : T extends object
    ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
    : T

export type UnwrapNestedRefs<T> = { [K in keyof T]: UnwrapRefSimple<T[K]> }
