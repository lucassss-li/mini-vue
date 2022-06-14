import { getCurrentInstance } from './component'
export function provide(key, value) {
    const { provides } = getCurrentInstance()
    provides[key] = value
}
export function inject(key, defaultValue) {
    const { provides } = getCurrentInstance()
    return key in provides ? provides[key] : defaultValue
}
