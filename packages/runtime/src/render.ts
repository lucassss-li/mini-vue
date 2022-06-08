import { isObject } from '../../shared/index'
import {
    createComponentInstance,
    renderComponentRoot,
    setupComponent,
} from './component'
import { createTextVNode, ShapeFlags, TEXT } from './vnode'

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    const { type, shapeFlag } = vnode
    switch (type) {
        case TEXT: {
            processText(vnode, container)
            break
        }
        default: {
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if (shapeFlag & ShapeFlags.COMPONENT) {
                processComponent(vnode, container)
            }
        }
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container)
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
    const subTree = renderComponentRoot(instance)
    patch(subTree, container)
}

function processElement(vnode, container) {
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
    const { type, props, children } = vnode
    const element = document.createElement(type)
    container.append(element)
    processChildren(children, element)
}

function processChildren(children, container) {
    for (let child of children) {
        if (!isObject(child)) {
            child = createTextVNode(child)
        }
        patch(child, container)
    }
}

function processText(vnode, container) {
    container.textContent = vnode.children[0]
}
