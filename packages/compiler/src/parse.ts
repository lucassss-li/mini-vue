import { NodeTypes } from './ast'

export function parse(template) {
    const context = createContext(template)
    return createRoot(parseChildren(context))
}

export function createContext(template) {
    const context = {
        source: template,
        options: {
            delimiters: ['{{', '}}'],
        },
        advance: function (step) {
            this.source = this.source.slice(step)
        },
        ancestors: [],
    }
    context.advance = context.advance.bind(context)
    return context
}

function createRoot(children) {
    return {
        type: NodeTypes.ROOT,
        children,
    }
}

function parseChildren(context) {
    const nodes: any[] = []
    while (!isEnd(context)) {
        const { source, options } = context
        let node
        if (source.startsWith(options.delimiters[0])) {
            node = parseInterpolation(context)
        } else if (source.match(/^<[a-z]+>/)) {
            node = parseElement(context)
        } else if (source.match(/^<[a-z]+\/>/)) {
            node = parseSingleElement(context)
        }
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}

function isEnd(context) {
    const { source, ancestors } = context
    const closeTag = ancestors.length && ancestors[ancestors.length - 1]
    if (closeTag && source.startsWith('</')) {
        if (source.startsWith(`</${closeTag}>`)) {
            return true
        } else {
            throw new Error('no matched endTag')
        }
    }
    return !context.source
}

function parseInterpolation(context) {
    const { options, advance } = context
    const [start, end] = options.delimiters
    advance(start.length)
    const match = context.source.match(new RegExp(`(.*?)${end}`))
    advance(match[0].length)
    return {
        type: NodeTypes.INTERPOLATION,
        expression: match[1],
    }
}

function parseText(context) {
    const { options, advance } = context
    const [start] = options.delimiters
    const match = context.source.match(new RegExp(`((.*?)(${start}|<))|(.*)`))
    const content = match[2] || match[4]
    advance(content.length)
    return {
        type: NodeTypes.TEXT,
        content,
    }
}

function parseElement(context) {
    const { advance, ancestors } = context
    const tag = context.source.match(/^<([a-z]+)>/)[1]
    ancestors.push(tag)
    advance(tag.length + 2)
    const node = {
        type: NodeTypes.ELEMENT,
        tag,
        children: parseChildren(context),
    }
    if (!context.source.startsWith(`</${ancestors[ancestors.length - 1]}>`)) {
        throw new Error('no matched endTag')
    }
    advance(tag.length + 3)
    ancestors.pop()
    return node
}

function parseSingleElement(context) {
    const { advance } = context
    const tag = context.source.match(/^<([a-z]+)\/>/)[1]
    advance(tag.length + 3)
    return {
        type: NodeTypes.SINGLE_ELEMENT,
        tag,
    }
}
