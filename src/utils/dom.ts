/**
 * 设置标题
 * @param {String} title: 标题名称
 */
export default function setTitle(title: string = '广告机平台') {
    window.document.title = title;
}

/**
 * @description: 获取元素 offset 值
 * @param {Element } el
 */
export function getOffset(el: HTMLElement) {
    const box = el.getBoundingClientRect();
    const body = document.body;
    const clientTop = el.clientTop || body.clientTop || 0;
    const clientLeft = el.clientLeft || body.clientLeft || 0;
    const scrollTop = window.pageYOffset || el.scrollTop;
    const scrollLeft = window.pageXOffset || el.scrollLeft;
    return {
        top: box.top + scrollTop - clientTop,
        left: box.left + scrollLeft - clientLeft,
    };
}

/**
 * @description: 驼峰改为大小写
 * @param {String} name
 */
export const camelCase = (() => {
    const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    const MOZ_HACK_REGEXP = /^moz([A-Z])/;
    return function camelCase(name: string) {
        return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).replace(MOZ_HACK_REGEXP, 'Moz$1');
    };
})();

/**
 * @description: 获取元素的样式
 * @param {Element|HTMLElement} element: 元素
 * @param styleName 
 */
export function getStyle<T extends keyof CSSStyleDeclaration>(element: HTMLElement, styleName: string) {
    if (!element || !styleName) return null;
    let _styleName = camelCase(styleName) as T;
    if (_styleName === 'float') {
        _styleName = 'cssFloat' as T;
    }
    try {
        const computed = document.defaultView!.getComputedStyle(element, '');
        return element.style[_styleName] || computed ? computed[_styleName] : null;
    } catch (e) {
        return element.style[_styleName];
    }
}