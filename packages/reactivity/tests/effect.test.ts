import { effect } from '../src/effect'
import { reactive, toRaw } from '../src/reactive'

describe('reactivity/effect', () => {
    it('happy path', () => {
        const ob = reactive({ foo: 1 })
        let dummy
        effect(() => {
            dummy = ob.foo
        })
        expect(dummy).toBe(1)
        ob.foo = 2
        expect(dummy).toBe(2)
    })
    it('more than one reactive', () => {
        const ob = reactive({ foo: 1 })
        let dummy
        const fn = jest.fn()
        effect(() => {
            fn()
            dummy = ob.foo
        })
        expect(dummy).toBe(1)
        expect(fn).toBeCalledTimes(1)
        ob.foo = 2
        expect(dummy).toBe(2)
        expect(fn).toBeCalledTimes(2)
        const ob2 = reactive({ foo: 1 })
        ob2.foo
        ob2.foo = 3
        expect(fn).toBeCalledTimes(2)
    })
    it('should observe multiple properties', () => {
        let dummy
        const counter = reactive({ num1: 0, num2: 0 })
        effect(() => (dummy = counter.num1 + counter.num1 + counter.num2))

        expect(dummy).toBe(0)
        counter.num1 = counter.num2 = 7
        expect(dummy).toBe(21)
    })
    it('should handle multiple effects', () => {
        let dummy1, dummy2
        const counter = reactive({ num: 0 })
        effect(() => (dummy1 = counter.num))
        effect(() => (dummy2 = counter.num))

        expect(dummy1).toBe(0)
        expect(dummy2).toBe(0)
        counter.num++
        expect(dummy1).toBe(1)
        expect(dummy2).toBe(1)
    })
    it('should observe nested properties', () => {
        let dummy
        const counter = reactive({ nested: { num: 0 } })
        effect(() => (dummy = counter.nested.num))

        expect(dummy).toBe(0)
        counter.nested.num = 8
        expect(dummy).toBe(8)
    })
    it('should observe delete operations', () => {
        let dummy
        const obj = reactive({ prop: 'value' })
        effect(() => (dummy = obj.prop))

        expect(dummy).toBe('value')
        // @ts-ignore
        delete obj.prop
        expect(dummy).toBe(undefined)
    })
    it('should observe has operations', () => {
        let dummy
        const obj = reactive<{ prop: string | number }>({ prop: 'value' })
        effect(() => (dummy = 'prop' in obj))

        expect(dummy).toBe(true)
        // @ts-ignore
        delete obj.prop
        expect(dummy).toBe(false)
        obj.prop = 12
        expect(dummy).toBe(true)
    })
    it('should observe properties on the prototype chain', () => {
        let dummy
        const counter = reactive({ num: 0 })
        const parentCounter = reactive({ num: 2 })
        Object.setPrototypeOf(counter, parentCounter)
        effect(() => (dummy = counter.num))

        expect(dummy).toBe(0)
        // @ts-ignore
        delete counter.num
        expect(dummy).toBe(2)
        parentCounter.num = 4
        expect(dummy).toBe(4)
        counter.num = 3
        expect(dummy).toBe(3)
    })
    it('should observe has operations on the prototype chain', () => {
        let dummy
        const counter = reactive({ num: 0 })
        const parentCounter = reactive({ num: 2 })
        Object.setPrototypeOf(counter, parentCounter)
        effect(() => (dummy = 'num' in counter))

        expect(dummy).toBe(true)
        // @ts-ignore
        delete counter.num
        expect(dummy).toBe(true)
        // @ts-ignore
        delete parentCounter.num
        expect(dummy).toBe(false)
        counter.num = 3
        expect(dummy).toBe(true)
    })
    it('should observe inherited property accessors', () => {
        let dummy, parentDummy, hiddenValue: any
        const obj = reactive<{ prop?: number; child: 1 }>({ child: 1 })
        const parent = reactive({
            set prop(value) {
                hiddenValue = value
            },
            get prop() {
                return hiddenValue
            },
            parent: 1,
        })
        Object.setPrototypeOf(obj, parent)
        effect(() => (dummy = obj.prop))
        effect(() => (parentDummy = parent.prop))

        expect(dummy).toBe(undefined)
        expect(parentDummy).toBe(undefined)
        obj.prop = 4
        expect(hiddenValue).toBe(4)
        expect(dummy).toBe(4)
        expect(parentDummy).toBe(undefined)
        parent.prop = 2
        expect(dummy).toBe(2)
        expect(parentDummy).toBe(2)
    })
    it('should observe function call chains', () => {
        let dummy
        const counter = reactive({ num: 0 })
        effect(() => (dummy = getNum()))

        function getNum() {
            return counter.num
        }

        expect(dummy).toBe(0)
        counter.num = 2
        expect(dummy).toBe(2)
    })
    it('should observe iteration', () => {
        let dummy
        const list = reactive(['Hello'])
        effect(() => (dummy = list.join(' ')))

        expect(dummy).toBe('Hello')
        list.push('World!')
        expect(dummy).toBe('Hello World!')
        list.shift()
        expect(dummy).toBe('World!')
    })
    it('should observe implicit array length changes', () => {
        let dummy
        const list = reactive(['Hello'])
        effect(() => (dummy = list.join(' ')))

        expect(dummy).toBe('Hello')
        list[1] = 'World!'
        expect(dummy).toBe('Hello World!')
        list[3] = 'Hello!'
        expect(dummy).toBe('Hello World!  Hello!')
    })
    it('should observe sparse array mutations', () => {
        let dummy
        const list = reactive<string[]>([])
        list[1] = 'World!'
        effect(() => (dummy = list.join(' ')))

        expect(dummy).toBe(' World!')
        list[0] = 'Hello'
        expect(dummy).toBe('Hello World!')
        list.pop()
        expect(dummy).toBe('Hello')
    })
    it('should observe enumeration', () => {
        let dummy = 0
        const numbers = reactive<Record<string, number>>({ num1: 3 })
        effect(() => {
            dummy = 0
            for (const key in numbers) {
                dummy += numbers[key]
            }
        })

        expect(dummy).toBe(3)
        numbers.num2 = 4
        expect(dummy).toBe(7)
        delete numbers.num1
        expect(dummy).toBe(4)
    })
    it('should observe function valued properties', () => {
        // eslint-disable-next-line
        const oldFunc = () => {}
        // eslint-disable-next-line
        const newFunc = () => {}

        let dummy
        const obj = reactive({ func: oldFunc })
        effect(() => (dummy = obj.func))

        expect(dummy).toBe(oldFunc)
        obj.func = newFunc
        expect(dummy).toBe(newFunc)
    })
    it('should observe chained getters relying on this', () => {
        const obj = reactive({
            a: 1,
            get b() {
                return this.a
            },
        })

        let dummy
        effect(() => (dummy = obj.b))
        expect(dummy).toBe(1)
        obj.a++
        expect(dummy).toBe(2)
    })
    it('should observe methods relying on this', () => {
        const obj = reactive({
            a: 1,
            b() {
                return this.a
            },
        })

        let dummy
        effect(() => (dummy = obj.b()))
        expect(dummy).toBe(1)
        obj.a++
        expect(dummy).toBe(2)
    })
    it('should not observe set operations without a value change', () => {
        let hasDummy, getDummy
        const obj = reactive({ prop: 'value' })

        const getSpy = jest.fn(() => (getDummy = obj.prop))
        const hasSpy = jest.fn(() => (hasDummy = 'prop' in obj))
        effect(getSpy)
        effect(hasSpy)

        expect(getDummy).toBe('value')
        expect(hasDummy).toBe(true)
        obj.prop = 'value'
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(hasSpy).toHaveBeenCalledTimes(1)
        expect(getDummy).toBe('value')
        expect(hasDummy).toBe(true)
    })
    it('should not observe raw mutations', () => {
        let dummy
        const obj = reactive<{ prop?: string }>({})
        effect(() => (dummy = toRaw(obj).prop))

        expect(dummy).toBe(undefined)
        obj.prop = 'value'
        expect(dummy).toBe(undefined)
    })
    it('should not run multiple times for a single mutation', () => {
        let dummy
        const obj = reactive<Record<string, number>>({})
        const fnSpy = jest.fn(() => {
            for (const key in obj) {
                dummy = obj[key]
            }
            dummy = obj.prop
        })
        effect(fnSpy)

        expect(fnSpy).toHaveBeenCalledTimes(1)
        obj.prop = 16
        expect(dummy).toBe(16)
        expect(fnSpy).toHaveBeenCalledTimes(3)
    })
    it('lazy', () => {
        const obj = reactive({ foo: 1 })
        let dummy
        const runner = effect(() => (dummy = obj.foo), { lazy: true })
        expect(dummy).toBe(undefined)

        expect(runner()).toBe(1)
        expect(dummy).toBe(1)
        obj.foo = 2
        expect(dummy).toBe(2)
    })
    it('scheduler', () => {
        let dummy
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler },
        )
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)
        // manually run
        run()
        // should have run
        expect(dummy).toBe(2)
    })
    it('should allow nested effects', () => {
        const nums = reactive({ num1: 0, num2: 1, num3: 2 })
        const dummy: any = {}

        const childSpy = jest.fn(() => (dummy.num1 = nums.num1))
        const childeffect = effect(childSpy)
        const parentSpy = jest.fn(() => {
            dummy.num2 = nums.num2
            childeffect()
            dummy.num3 = nums.num3
        })
        effect(parentSpy)

        expect(dummy).toEqual({ num1: 0, num2: 1, num3: 2 })
        expect(parentSpy).toHaveBeenCalledTimes(1)
        expect(childSpy).toHaveBeenCalledTimes(2)
        // this should only call the childeffect
        nums.num1 = 4
        expect(dummy).toEqual({ num1: 4, num2: 1, num3: 2 })
        expect(parentSpy).toHaveBeenCalledTimes(1)
        expect(childSpy).toHaveBeenCalledTimes(3)
        // this calls the parenteffect, which calls the childeffect once
        nums.num2 = 10
        expect(dummy).toEqual({ num1: 4, num2: 10, num3: 2 })
        expect(parentSpy).toHaveBeenCalledTimes(2)
        expect(childSpy).toHaveBeenCalledTimes(4)
        // this calls the parenteffect, which calls the childeffect once
        nums.num3 = 7
        expect(dummy).toEqual({ num1: 4, num2: 10, num3: 7 })
        expect(parentSpy).toHaveBeenCalledTimes(3)
        expect(childSpy).toHaveBeenCalledTimes(5)
    })
})
