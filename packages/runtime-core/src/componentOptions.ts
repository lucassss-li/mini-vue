import { reactive } from '../../index'
import { isFunction, isObject } from '../../shared/index'

export const applyOptions = instance => {
    const options = instance.type
    const { data, methods } = options
    if (isFunction(data)) {
        instance.data = reactive(data())
    } else {
        console.log('data option should be a function that return an object')
    }
    if (isObject(methods)) {
        instance.methods = methods
    } else {
        instance.methods = {}
    }
}
