export const isObject = (val: unknown) =>
    val !== null && typeof val === 'object'

export const toRawType = (value: unknown): string => {
    return Object.prototype.toString.call(value).slice(8, -1)
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
    val: object,
    key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key)
