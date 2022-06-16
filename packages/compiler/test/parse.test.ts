import { NodeTypes } from '../src/ast'
import { createContext, parse } from '../src/parse'

describe('compiler/parse', () => {
    test('context', () => {
        const context = createContext('lucas')
        context.advance(2)
        expect(context.source.length).toBe(3)
    })
    test('interpolation', () => {
        const ast = parse('{{message}}')
        expect(ast).toStrictEqual({
            type: NodeTypes.ROOT,
            children: [
                {
                    type: NodeTypes.INTERPOLATION,
                    expression: 'message',
                },
            ],
        })
    })
    test('text', () => {
        const ast = parse('hello world')
        expect(ast).toStrictEqual({
            type: NodeTypes.ROOT,
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: 'hello world',
                },
            ],
        })
    })
    test('element', () => {
        const ast = parse('<div></div>')
        expect(ast).toStrictEqual({
            type: NodeTypes.ROOT,
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'div',
                    children: [],
                },
            ],
        })
    })
    test('complex', () => {
        const ast = parse('<div>hi,{{message}}</div>')
        expect(ast).toStrictEqual({
            type: NodeTypes.ROOT,
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'div',
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: 'hi,',
                        },
                        {
                            type: NodeTypes.INTERPOLATION,
                            expression: 'message',
                        },
                    ],
                },
            ],
        })
    })
    test('complex2', () => {
        const ast = parse(
            '<div>{{message}}hi,<span>world</span>{{message}}</div>',
        )
        expect(ast).toStrictEqual({
            type: NodeTypes.ROOT,
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'div',
                    children: [
                        {
                            type: NodeTypes.INTERPOLATION,
                            expression: 'message',
                        },
                        {
                            type: NodeTypes.TEXT,
                            content: 'hi,',
                        },
                        {
                            type: NodeTypes.ELEMENT,
                            tag: 'span',
                            children: [
                                {
                                    type: NodeTypes.TEXT,
                                    content: 'world',
                                },
                            ],
                        },
                        {
                            type: NodeTypes.INTERPOLATION,
                            expression: 'message',
                        },
                    ],
                },
            ],
        })
    })
    test('no matched endTag', () => {
        expect(() => parse('<div><div></div>')).toThrow('no matched endTag')
    })
})
