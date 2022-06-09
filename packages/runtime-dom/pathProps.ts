import { camelCaseToKebabCase, isString, toRawType } from '../shared/index'

export const pathProps = (el, props) => {
    for (const key in props) {
        if (key === 'class') {
            pathClass(el, props[key])
        } else if (key === 'style') {
            pathStyle(el, props[key])
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

const pathClass = (el, options) => {
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

const pathStyle = (el, options) => {
    if (isString(options)) {
        el.style.cssText = options
    } else {
        for (const key in options) {
            el.style.setProperty(camelCaseToKebabCase(key), options[key])
        }
    }
}
