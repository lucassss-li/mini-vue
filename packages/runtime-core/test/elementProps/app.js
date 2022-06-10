import { h } from '../../../../dist/vue-esm.js'
export default {
    render() {
        return h(
            'div',
            {
                name: 'lucas',
                class: 'red',
                style: 'font-size:30px',
                onClick: () => {
                    console.log('click')
                },
            },
            [
                'div',
                h(
                    'h1',
                    {
                        class: ['green'],
                        style: { background: 'red' },
                        onMouseMove: () => {
                            console.log('mouse move')
                        },
                    },
                    [
                        'hi',
                        h(
                            'div',
                            {
                                class: { blue: true },
                                style: { fontStyle: 'italic' },
                            },
                            ['lucas'],
                        ),
                    ],
                ),
            ],
        )
    },
}
