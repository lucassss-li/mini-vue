export const isObject = (val: unknown) =>
    val !== null && typeof val === 'object'

export const toRawType = (val: unknown) =>
    Object.prototype.toString.call(val).slice(8, -1)

export const hasOwn = (target: unknown, prop: string | symbol) =>
    Object.prototype.hasOwnProperty.call(target, prop)

export const isString = (val: unknown) => toRawType(val) === 'String'
export const isFunction = (val: unknown) => toRawType(val) === 'Function'

export const camelCaseToKebabCase = (str: string): string =>
    str.replace(/\B([A-Z]+)\B/g, subStr => `-${subStr.toLowerCase()}`)
