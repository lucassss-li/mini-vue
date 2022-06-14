import { effect } from '../../reactivity/src/effect'
import { hasOwn, isObject } from '../../shared/index'
import {
    createComponentInstance,
    renderComponentRoot,
    setupComponent,
} from './component'
import { createAppAPI } from './createAppAPI'
import { queueJob } from './scheduler'
import { createTextVNode, ShapeFlags, TEXT } from './vnode'

export function createRenderer(options) {
    const { createElement, append, patchProp, createTextNode, remove } = options

    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }

    function patch(_vnode, vnode, container, anchor, parentComponent) {
        const { type, shapeFlag } = vnode
        switch (type) {
            case TEXT: {
                processText(vnode, container)
                break
            }
            default: {
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(
                        _vnode,
                        vnode,
                        container,
                        anchor,
                        parentComponent,
                    )
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    processComponent(
                        _vnode,
                        vnode,
                        container,
                        anchor,
                        parentComponent,
                    )
                }
            }
        }
    }
    function processComponent(
        _vnode,
        vnode,
        container,
        anchor,
        parentComponent,
    ) {
        if (_vnode) {
            patchComponent(_vnode, vnode)
            // mountComponent(vnode, container, anchor)
        } else {
            mountComponent(vnode, container, anchor, parentComponent)
        }
    }

    function patchComponent(_vnode, vnode) {
        const instance = (vnode.component = _vnode.component)
        instance.vNode = vnode
        instance.props = vnode.props
        vnode.component.update()
    }

    function mountComponent(vnode, container, anchor, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent)
        vnode.component = instance
        setupComponent(instance)
        setupRenderEffect(instance, container, anchor)
    }

    function setupRenderEffect(instance, container, anchor) {
        instance.update = effect(
            () => {
                const preTree = container.vnode
                const subTree = (container.vnode =
                    renderComponentRoot(instance))
                patch(preTree, subTree, container, anchor, instance)
            },
            {
                scheduler: () => queueJob(instance.update),
            },
        )
    }

    function processElement(_vnode, vnode, container, anchor, parentComponent) {
        if (_vnode) {
            const el = (vnode.el = _vnode.el)
            patchElement(_vnode, vnode, el, anchor, parentComponent)
        } else {
            mountElement(vnode, container, anchor, parentComponent)
        }
    }

    function patchElement(_vnode, vnode, el, anchor, parentComponent) {
        const oldProps = _vnode.props
        const newProps = vnode.props
        patchProps(oldProps, newProps, el)
        patchChildren(_vnode, vnode, el, anchor, parentComponent)
    }

    function patchProps(oldProps, newProps, el) {
        for (const key in newProps) {
            patchProp(el, key, newProps[key], oldProps[key])
        }
        for (const key in oldProps) {
            if (!hasOwn(newProps, key)) {
                patchProp(el, key, null, oldProps[key])
            }
        }
    }

    function patchChildren(_vnode, vnode, container, anchor, parentComponent) {
        const preShapeFlag = _vnode.shapeFlag
        const shapeFlag = vnode.shapeFlag

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(container)
            }
            setElementText(container, vnode.children)
        } else {
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                processChildren(
                    _vnode.children,
                    vnode.children,
                    container,
                    anchor,
                    parentComponent,
                )
            } else {
                unmountChildren(container)
                mountChildren(
                    vnode.children,
                    container,
                    anchor,
                    parentComponent,
                )
            }
        }
    }

    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key
    }

    function processChildren(c1, c2, container, parentAnchor, parentComponent) {
        let i = 0
        let e1 = c1.length - 1
        let e2 = c2.length - 1
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentAnchor, parentComponent)
            } else {
                break
            }
            i++
        }
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentAnchor, parentComponent)
            } else {
                break
            }
            e1--
            e2--
        }
        if (i > e1) {
            if (i <= e2) {
                while (i <= e2) {
                    const nextPos = e2 + 1
                    const anchor = nextPos < c2.length ? c2[nextPos].el : null
                    patch(null, c2[i], container, anchor, parentComponent)
                    i++
                }
            }
        } else if (i > e2) {
            if (i <= e1) {
                while (i <= e1) {
                    remove(c1[i].el)
                    i++
                }
            }
        } else {
            const s1 = i
            const s2 = i
            const toBePatch = e2 - i + 1
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndxMap = Array(toBePatch).fill(0)
            for (let i = s2; i <= e2; i++) {
                keyToNewIndexMap.set(c2[i].key, i)
            }
            for (let i = s1; i <= e1; i++) {
                const preChild = c1[i]
                let newIndex
                if (preChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(preChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(preChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                }
                if (newIndex === undefined) {
                    remove(preChild.el)
                } else {
                    newIndexToOldIndxMap[newIndex - s2] = i + 1
                    patch(
                        preChild,
                        c2[newIndex],
                        container,
                        parentAnchor,
                        parentComponent,
                    )
                }
            }
            const increasingNewIndexSequence = getSequence(newIndexToOldIndxMap)
            let j = increasingNewIndexSequence.length - 1
            for (let i = toBePatch - 1; i >= 0; i--) {
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor =
                    nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
                if (newIndexToOldIndxMap[i] === 0) {
                    patch(null, nextChild, container, anchor, parentComponent)
                } else if (i !== increasingNewIndexSequence[j]) {
                    container.insertBefore(nextChild.el, anchor)
                } else {
                    j++
                }
            }
        }
    }

    function setElementText(el, text) {
        el.textContent = text
    }
    function unmountChildren(container) {
        ;[...container.childNodes].forEach(node => {
            container.removeChild(node)
        })
    }

    function mountElement(vnode, container, anchor, parentComponent) {
        container.vnode = vnode
        const { type, props, children } = vnode
        const element = (vnode.el = createElement(type))
        for (const key in props) {
            patchProp(element, key, props[key])
        }
        append(container, element, anchor)
        mountChildren(children, element, anchor, parentComponent)
    }

    function mountChildren(children, container, anchor, parentComponent) {
        if (Array.isArray(children)) {
            children.forEach(child => {
                processChild(child, container, anchor, parentComponent)
            })
        } else {
            processChild(children, container, anchor, parentComponent)
        }
    }

    function processChild(child, container, anchor, parentComponent) {
        if (!isObject(child)) {
            child = createTextVNode(child)
        }
        patch(null, child, container, anchor, parentComponent)
    }

    function processText(vnode, container) {
        const textNode = createTextNode(vnode.children[0])
        append(container, textNode)
    }

    return {
        render,
        createApp: createAppAPI(render),
    }
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = (u + v) >> 1
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[u] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}
