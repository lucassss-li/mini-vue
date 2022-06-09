export function createComponentInstance(vnode) {
    return { type: vnode.type, vnode }
}

export function setupComponent(instance) {
    const setupResult = setupStatefulComponent(instance)
    return setupResult
}

function setupStatefulComponent(instance) {
    const component = instance.type
    const { setup } = component
    if (setup) {
        const setupResult = setup()
        handleSetupResult(setupResult)
    }
    finishComponentSetup(instance)
}

function handleSetupResult(setupResult) {
    console.log('handleSetupResult')
}
function finishComponentSetup(instance) {
    const component = instance.type
    if (component.render) {
        instance.render = component.render
    } else {
        console.log('编译模板成渲染函数')
    }
}

export function renderComponentRoot(instance) {
    const { render } = instance
    const result = render()
    return result
}
