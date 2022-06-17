import { parse } from '../src/parse'
import { transform } from '../src/transform'

describe('compiler/transform', () => {
    it('happy path', () => {
        const nodes: any[] = []
        const plugin = (node, context) => nodes.push(node)
        const ast = parse(
            '<div>{{message}}hi,<span>world</span>{{message}}</div>',
        )
        transform(ast, { transforms: [plugin] })
        expect(nodes.length).toBe(7)
    })
})
