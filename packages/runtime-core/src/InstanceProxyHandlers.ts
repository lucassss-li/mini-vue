import { hasOwn } from '../../shared/index'
const publicPropertiesMap = {
    $el: i => i.vNode.el,
    $slots: i => i.slots,
    $props: i => i.props,
}

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
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
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
