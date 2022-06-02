import { activeFn } from './effect'
import { reactive } from './reactive'

function isObject(val: any): val is object {
    return typeof val === 'object'
}

const RefSymbol = Symbol()

export class RefImp<T = any> {
    [RefSymbol]: true
    public dep?: Set<(...args) => any> = undefined
    public readonly __v_isRef = true
    constructor(private _value?: T) {}
    get value() {
        refTrack(this)
        if (isObject(this._value)) {
            return reactive(this._value)
        } else {
            return this._value
        }
    }
    set value(newValue: any) {
        const oldValue = this._value
        this._value = newValue
        if (oldValue !== newValue) {
            refTrigger(this)
        }
    }
}
export function ref<T>(rawValue?: T): RefImp<T> {
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
    return val[RefSymbol]
}
