import { camelCaseToKebabCase, isString, toRawType } from '../shared/index'

export const patchProp = (el, key, value, preValue) => {
    if (key === 'class') {
        patchClass(el, value)
    } else if (key === 'style') {
        patchStyle(el, value)
    } else {
        if (key.startsWith('on')) {
            patchEvent(el, key, value, preValue)
        } else {
            if (value) {
                el.setAttribute(key, value)
            } else {
                el.removeAttribute(key)
            }
        }
    }
}

const patchClass = (el, options) => {
    const type = toRawType(options)
    switch (type) {
        case 'String': {
            el.className = options
            break
        }
        case 'Array': {
            for (const className of options) {
                el.classList.add(className)
            }
            break
        }
        case 'Object': {
            for (const className in options) {
                options[className] && el.classList.add(className)
            }
            break
        }
    }
}

const patchStyle = (el, options) => {
    if (isString(options)) {
        el.style.cssText = options
    } else {
        for (const key in options) {
            el.style.setProperty(camelCaseToKebabCase(key), options[key])
        }
    }
}

const patchEvent = (el, key, value, preValue) => {
    const eventName = key.slice(2).toLowerCase()
    el.removeEventListener(eventName, preValue)
    el.addEventListener(eventName, value)
}
