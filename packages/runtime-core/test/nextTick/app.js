import { h, nextTick, ref } from '../../../../dist/vue-esm.js'
export default {
    setup() {
        const count = ref(1)
        function add() {
            count.value++
            console.log(count.value)
            nextTick(() => {
                console.log(document.querySelector('#dd').textContent)
            })
        }
        return {
            count,
            add,
        }
    },
    render() {
        return h('div', { onClick: this.add, id: 'dd' }, this.count.value)
    },
}
