import { h } from '../../../../dist/vue-esm.js'
export default {
    render() {
        return h('div', { msg: this.msg, num: this.num, onClick: this.show }, [
            this.num,
        ])
    },
    data() {
        return {
            num: 1,
        }
    },
    methods: {
        show() {
            this.num++
            this.msg++
            console.log(this)
        },
    },
    setup() {
        return { msg: 10 }
    },
}
