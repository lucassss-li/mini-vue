import { render } from './render'
import { createVNode } from './vnode'

export function createApp(rootComponent) {
    let isMounted = false
    return {
        mount(root) {
            if (!isMounted) {
                const vnode = createVNode(rootComponent)
                render(vnode, root)
                isMounted = true
            }
        },
    }
}
