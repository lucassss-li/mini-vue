import { isObject, isString } from '../../shared/index'

export const TEXT = Symbol('text')

export const enum ShapeFlags {
    ELEMENT = 1,
    COMPONENT = 1 << 1,
}

export function createVNode(type, props = {}, children: any[] = []) {
    const shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT
        : isObject(type)
        ? ShapeFlags.COMPONENT
        : 0
    console.log(shapeFlag, type)

    const vNode = {
        type,
        props,
        children,
        shapeFlag,
    }
    return vNode
}

export function createTextVNode(content) {
    return createVNode(TEXT, {}, [content])
}
