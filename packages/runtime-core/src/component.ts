import { isObject, isFunction } from '../../shared/index'
import { applyOptions } from './componentOptions'
import { instanceProxyHandlers } from './InstanceProxyHandlers'

let currentInstance

export const getCurrentInstance = () => currentInstance
const setCurrentInstance = instance => (currentInstance = instance)

export function createComponentInstance(vnode, parentComponent) {
    const instance: any = {
        type: vnode.type,
        vnode,
        props: {},
        provides: parentComponent
            ? Object.create(parentComponent.provides)
            : {},
        parent: parentComponent,
    }
    instance.ctx = { _: instance }
    return instance
}

export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)
    const setupResult = setupStatefulComponent(instance)
    return setupResult
}

function initProps(instance, rawProps) {
    instance.props = Object.assign(instance.props, rawProps)
}

function setupStatefulComponent(instance) {
    const component = instance.type
    instance.proxy = new Proxy(instance.ctx, instanceProxyHandlers)
    const { setup } = component
    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup()
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    } else {
        instance.setupState = {}
        finishComponentSetup(instance)
    }
}

function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        // TODO:setup return function
    } else if (isObject(setupResult)) {
        instance.setupState = setupResult
    } else {
        console.log('setup() should return an object')
    }
    finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
    const component = instance.type
    applyOptions(instance)
    if (component.render) {
        instance.render = component.render
    } else {
        console.log('编译模板成渲染函数')
    }
}

export function renderComponentRoot(instance) {
    const { render } = instance
    const result = render.call(instance.proxy)
    return result
}
