export const nodeOps = {
    createElement: tag => document.createElement(tag),
    append: (parent, child, anchor) => parent.insertBefore(child, anchor),
    createTextNode: content => document.createTextNode(content),
    remove: el => el.remove(),
}
