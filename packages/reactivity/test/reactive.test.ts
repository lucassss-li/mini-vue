import { isReactive, reactive } from '../src/reactive'

describe('reactivity/reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
        expect('foo' in observed).toBe(true)
        expect(Object.keys(observed)).toEqual(['foo'])
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })
    it('nested reactives', () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [{ bar: 2 }],
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })
    test('proto', () => {
        const obj = {}
        const reactiveObj = reactive(obj)
        expect(isReactive(reactiveObj)).toBe(true)
        // read prop of reactiveObject will cause reactiveObj[prop] to be reactive
        // @ts-ignore
        const prototype = reactiveObj['__proto__']
        expect(isReactive(prototype)).toBe(false)
        const otherObj = { data: ['a'] }
        expect(isReactive(otherObj)).toBe(false)
        const reactiveOther = reactive(otherObj)
        expect(isReactive(reactiveOther)).toBe(true)
        expect(reactiveOther.data[0]).toBe('a')
    })
    it('collection', () => {
        const map = new Map()
        const cmap = reactive(map)
        expect(isReactive(cmap)).toBe(true)
        cmap.set('key', {})
    })
})
