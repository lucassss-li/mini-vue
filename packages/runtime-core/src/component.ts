import { isObject, isFunction } from '../../shared/index'
import { applyOptions } from './componentOptions'
import { instanceProxyHandlers } from './InstanceProxyHandlers'

export function createComponentInstance(vnode) {
    const instance: any = { type: vnode.type, vnode }
    instance.ctx = { _: instance }
    return instance
}

export function setupComponent(instance) {
    const setupResult = setupStatefulComponent(instance)
    return setupResult
}

function setupStatefulComponent(instance) {
    const component = instance.type
    instance.proxy = new Proxy(instance.ctx, instanceProxyHandlers)
    const { setup } = component
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    } else {
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
