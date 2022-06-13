import { h, ref } from '../../../../dist/vue-esm.js'

const list = [
    [
        h('div', { key: 'a', name: 'a1' }, 'a'),
        h('div', { key: 'c', name: 'c1' }, 'c'),
        h('div', { key: 'b', name: 'b1' }, 'b'),
        h('div', { key: 'd', name: 'd1' }, 'd'),
    ],
    [
        h('div', { key: 'a', name: 'a2' }, 'a'),
        h('div', { key: 'b', name: 'b2' }, 'b'),
        h('div', { key: 'c', name: 'c2' }, 'c'),
        h('div', { key: 'e', name: 'e2' }, 'e'),
        h('div', { key: 'd', name: 'd2' }, 'd'),
    ],
]

export default {
    setup() {
        const count = ref(0)
        return {
            count,
        }
    },
    data() {
        return {
            color: 'red',
        }
    },
    methods: {
        change() {
            this.count.value = this.count.value === 1 ? 0 : 1
        },
    },
    render() {
        return h(
            'div',
            {
                class: this.color,
                style: {
                    fontSize: `40px`,
                },
                onClick: this.change,
            },
            list[this.count.value],
        )
    },
}
