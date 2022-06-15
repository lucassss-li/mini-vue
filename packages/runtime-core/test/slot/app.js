import { h } from '../../../../dist/vue-esm.js'
const Component = {
    render() {
        return h('div', {}, ['component    ', this.$slots.default()])
    },
}
export default {
    render() {
        return h(
            Component,
            {},
            { default: () => 'default slot', header: () => 'header slot' },
        )
    },
}
