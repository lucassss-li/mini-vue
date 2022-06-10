import { h } from '../../../../dist/vue-esm.js'
import componentA from './componentA.js'
import componentB from './componentB.js'
export default {
    render() {
        return h('div', {}, [
            h('h1', {}, ['hi', h('div', {}, ['lucas'])]),
            h(componentA),
            h(componentB),
        ])
    },
}
