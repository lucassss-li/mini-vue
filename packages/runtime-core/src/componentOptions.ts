import { reactive } from '../../index'
import { isFunction, isObject } from '../../shared/index'

export const applyOptions = instance => {
    const options = instance.type
    const { data, methods } = options
    if (isFunction(data)) {
        instance.data = reactive(data())
    } else {
        instance.data = {}
    }
    if (isObject(methods)) {
        instance.methods = methods
    } else {
        instance.methods = {}
    }
}
