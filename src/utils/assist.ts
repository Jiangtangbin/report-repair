import Vue from 'vue';
import { recursion, IMatchOption } from './index';

/**
 * @description: 在同一时间内生成唯一请求函数
 * @param {Function} axios: 请求函数
 * @param {String} flag: 唯一标识符
 */
function uniqueRequestFunc() {
    const _requesting: {[key in string]: any} = {};
    function uniqueRequest<T extends() => any>(axios: T, flag: string | number): ReturnType<T> {
        const requesting: Dictionary<ReturnType<T>> = _requesting;
        if (requesting[flag]) return requesting[flag];
        requesting[flag] = axios();
        return requesting[flag];
    }
    uniqueRequest.remove = (flag: string | number) => {
        delete _requesting[flag];
    };
    return uniqueRequest;
}

/**
 * 向上查找组件
 * @param {context} context: vue 实例
 * @param {String} componentName: 组件名称
 * @return {Array} 返回指定名称的父组件
 */
export function findComponentUpward(context: Vue, componentName: string | string[]): Vue | undefined {
    let componentNames: string[];
    if (typeof componentName === 'string') {
        componentNames = [componentName];
    } else {
        componentNames = componentName;
    }
    let parent = context.$parent;
    let name = parent.$options.name;
    while (parent && (!name || componentNames.indexOf(name) < 0)) {
        parent = parent.$parent;
        if (parent) name = parent.$options.name;
    }
    return parent;
}

/**
 * 向上查找组件
 * @param {context} context: vue 实例
 * @param {String} componentName: 组件名称
 * @return {Array} 父组件集合
 */
export function findComponentsUpward(context: Vue, componentName: string): Vue[] {
    let parents = [];
    const parent = context.$parent;
    if (parent) {
        if (parent.$options.name === componentName) parents.push(parent);
        return parents.concat(findComponentsUpward(parent, componentName));
    } else {
        return [];
    }
}

/**
 * @description: 为 view-design-cascader 处理数据
 * @param {Array} data: 数据源
 */
export function disposeCascader<T extends IMatchOption<T>>(data: T[]) {
    if (Array.isArray(data)) {
        recursion(data, v => {
            v.label = v.name;
            v.title = v.name;
            v.hasOwnProperty('value') || (v.value = v.code);
        });
    }
}

export const uniqueRequest = uniqueRequestFunc();