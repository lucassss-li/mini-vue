import { effect } from '../src/effect'
import { reactive } from '../src/reactive'
import { isRef, ref } from '../src/ref'

describe('reactivity/ref', () => {
    it('happy path', () => {
        const num = ref(1)
        let dummy = 0
        expect(num.value).toBe(1)
        effect(() => {
            dummy = num.value
        })
        num.value = 2
        expect(dummy).toBe(2)
    })
    it('should hold a value', () => {
        const a = ref(1)
        expect(a.value).toBe(1)
        a.value = 2
        expect(a.value).toBe(2)
    })
    it('should be reactive', () => {
        const a = ref(1)
        let dummy
        let calls = 0
        effect(() => {
            calls++
            dummy = a.value
        })
        expect(calls).toBe(1)
        expect(dummy).toBe(1)
        a.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
        // same value should not trigger
        a.value = 2
        expect(calls).toBe(2)
    })
    it('should make nested properties reactive', () => {
        const a = ref({
            count: 1,
        })
        let dummy
        effect(() => {
            dummy = a.value.count
        })
        expect(dummy).toBe(1)
        a.value.count = 2
        expect(dummy).toBe(2)
    })
    it('should work like a normal property when nested in a reactive object', () => {
        const a = ref(1)
        const obj = reactive({
            a,
            b: {
                c: a,
            },
        })

        let dummy1 = 0
        let dummy2 = 0

        effect(() => {
            dummy1 = obj.a
            dummy2 = obj.b.c
        })

        a.value++
        expect(dummy1).toBe(2)
        expect(dummy2).toBe(2)
        obj.a++
        expect(dummy1).toBe(3)
        expect(dummy2).toBe(3)
        obj.b.c++
        expect(dummy1).toBe(4)
        expect(dummy2).toBe(4)
    })
})
