import { isObject, isString } from '../../shared/index'

export const TEXT = Symbol('text')

export const enum ShapeFlags {
    ELEMENT = 1,
    COMPONENT = 1 << 1,
    TEXT_CHILDREN = 1 << 2,
    ARRAY_CHILDREN = 1 << 3,
}

export function createVNode(type, props = {}, children: any[] = []) {
    let shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT
        : isObject(type)
        ? ShapeFlags.COMPONENT
        : 0
    shapeFlag |= Array.isArray(children)
        ? ShapeFlags.ARRAY_CHILDREN
        : ShapeFlags.TEXT_CHILDREN
    const vNode = {
        type,
        props,
        children,
        shapeFlag,
        key: (<any>props)?.key,
    }
    return vNode
}

export function createTextVNode(content) {
    return createVNode(TEXT, {}, [content])
}
