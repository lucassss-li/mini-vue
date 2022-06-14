import { h, inject } from '../../../../dist/vue-esm.js'

export default {
    setup() {
        const count = inject('count', 'default10')
        const noProvide = inject('noProvide', 'default value')
        return { count, noProvide }
    },
    render() {
        return h('div', {}, [
            h('div', {}, `count:${this.count}`),
            h('div', {}, `count:${this.noProvide}`),
        ])
    },
}
