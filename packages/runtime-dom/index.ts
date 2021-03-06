import { createRenderer } from '../runtime-core/src/render'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
const renderOptions = { ...nodeOps, patchProp }

let render
function ensureRenderer() {
    return render || (render = createRenderer(renderOptions))
}
export function createApp(rootComponent) {
    const app = ensureRenderer().createApp(rootComponent)
    return app
}
