import { h, provide } from '../../../../dist/vue-esm.js'
import component from './component.js'

export default {
    setup() {
        provide('count', 1)
        return {}
    },
    render() {
        return h(
            'div',
            {
                class: 'red',
                style: {
                    fontSize: `40px`,
                },
            },
            [h(component)],
        )
    },
}
