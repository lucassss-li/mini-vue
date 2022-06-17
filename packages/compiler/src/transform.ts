import { NodeTypes } from './ast'

export function transform(root, options) {
    const context = createContext(root, options)
    traverseNode(root, context)
}

function createContext(root, { transforms = [] } = {}) {
    return { root, transforms }
}

function traverseNode(node, context) {
    const { transforms } = context
    for (let i = 0; i < transforms.length; i++) {
        transforms[i](node, context)
    }
    switch (node.type) {
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context)
            break
        default:
            break
    }
}

function traverseChildren(parent, context) {
    for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i]
        traverseNode(child, context)
    }
}
