import { hasOwn } from '../../shared/index'

export const instanceProxyHandlers = {
    get({ _: instance }, key) {
        const publicThis = instance.proxy
        const { setupState, data, methods, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key]
        }
        if (hasOwn(data, key)) {
            return data[key]
        }
        if (hasOwn(methods, key)) {
            return methods[key].bind(publicThis)
        }
        if (hasOwn(props, key)) {
            return props[key]
        }
    },
    set({ _: instance }, key: string, value: any) {
        const { setupState, data } = instance
        if (hasOwn(setupState, key)) {
            setupState[key] = value
            return true
        } else if (hasOwn(data, key)) {
            data[key] = value
            return true
        }
        return true
    },
}
