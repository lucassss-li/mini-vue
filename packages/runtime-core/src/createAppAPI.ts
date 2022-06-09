import { createVNode } from './vnode'

export function createAppAPI(render) {
    return function createApp(rootComponent) {
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
}
