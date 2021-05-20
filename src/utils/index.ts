type StorageType = 'localStorage' | 'sessionStorage';

const oneMinuteMS = 60 * 1000; // 一分钟有多少毫秒
const oneHoursMS = 60 * oneMinuteMS; // 一个小时有多少毫秒
const oneDayMS = 24 * oneHoursMS; // 一天有多少毫秒

function prefix(str: number | string, separator = 0) {
    return str.toString().replace(/^\d{1}$/, `${separator}${str}`);
}

export interface IMatchOption<T> {
    label?: any;
    title?: any;
    value?: any;
    children?: T[];
    [index: string]: any;
}

export type FormatDateOption = {
    separator?: string;
    type?: 'all' | 'date' | 'time';
    sep?: string;
};

// 判断平台
export const isPc = (): boolean => !/AppleWebKit.*Mobile.*/.test(navigator.userAgent);

// 判断是否是微信浏览器
export function isWeixin(): boolean {
    return window.navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;
}

// 判断类型
export function typeOf(data: any): string {
    return Object.prototype.toString.call(data).slice(8, -1);
}

// 是否是对象
export function isObject(data: any): data is Record<any, any> {
    return typeOf(data) === 'Object';
}

// 是否是数组
export function isArray(data: any): data is any[] {
    return typeOf(data) === 'Array';
}

// 是否是 Null
export function isNull(data: any): data is null {
    return typeOf(data) === 'Null';
}

// 是否是 File
export function isFile(data: any): data is File {
    return typeOf(data) === 'File';
}

// 是否是 Blob
export function isBlob(data: any): data is Blob {
    return typeOf(data) === 'Blob';
}

// 是否是 boolean
export function isBoolean(data: any): data is boolean {
    return typeof data === 'boolean';
}

// 是否是数字
export function isNumber(data: any): data is number {
    return typeof data === 'number';
}

// 是否是字符串
export function isString(data: any): data is string {
    return typeof data === 'string';
}

// // 是否是 Bigint 类型
// export function isBigint(data: any): data is bigint {
//     return typeof data === 'bigint';
// }

// 是否是函数
export function isFunction(data: any): data is Function {
    return typeof data === 'function';
}

// 是否是 undefined
export function isUndefined(data: any): data is undefined {
    return typeof data === 'undefined';
}

/**
 * @description: 添加存储内容到指定的类型
 * @param {String|Number} key: 添加的键
 * @param {any} value: 添加的值
 * @param {StorageType} type: 存储的类型
 */
export function setStorage(key: number | string, value: any, type: StorageType = 'localStorage'): void {
    window[type].setItem(key.toString(), JSON.stringify(value));
}

/**
 * @description: 获取指定的存储内容
 * @param {String|Number} key: 添加的键
 * @param {StorageType} type: 存储的类型
 * @return String | Object
 */
export function getStorage(key: number | string, type: StorageType = 'localStorage'): any {
    try {
        const result = window[type].getItem(key.toString());
        return result
            ? JSON.parse(result)
            : '';
    } catch (error) {
        console.log('error: 读取本地存储数据失败 ', key);
        return '';
    }
}

/**
 * @description: 删除指定类型中存储的值
 * @param {String|Number} key: 添加的键
 * @param {StorageType} type: 存储的类型
 */
export function removeStorage(key: string, type: StorageType = 'localStorage'): void {
    window[type].removeItem(key);
}

/**
 * @description: 对指定字符串进行加密
 * @param {String} code: 加密信息
 * @return String
 */
export function compile(code: string): string {
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
        c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    return escape(c);
}

/**
 * @description: 对密码进行解密
 * @param {String} originCode: 加密信息
 * @return String
 */
export function unCompile(originCode: string): string {
    const code = unescape(originCode);
    let c = String.fromCharCode(code.charCodeAt(0) - code.length);
    for (let i = 1; i < code.length; i++) {
        c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    }
    return c;
}

/**
 * 获取数组的交集, 自动取小值遍历
 * @param {Array} source: 数据源一
 * @param {Array} data: 数据源二
 * @return Array
 */
export function intersection<T>(source: T[], data: T[]): T[] {
    return source.length > data.length ? data.filter(val => source.includes(val)) : source.filter(val => data.includes(val));
}

/**
 * 获取数组的并集
 * @param {Array} source: 数据源一
 * @param {Array} data: 数据源二
 * @return Array
 */
export function union<T>(source: T[], data: T[]): T[] {
    return Array.from(new Set(source.concat(data)));
}

/**
 * 获取数组的差集
 * @param {Array} source: 待排查的数据源
 * @param {Array} data: 数据源二
 * @return Array
 */
export function difference<T>(source: T[], data: T[]): T[] {
    const difference = [];
    for (const item of source) {
        data.includes(item) || difference.push(item);
    }
    return difference;
}

/**
 * 判断是否是数组的子集
 * @param {Array} source: 父集
 * @param {Array} data: 子集
 * @returns {Boolean}
 */
export function subset<T>(source: T[], data: T[]): boolean {
    return data.every(val => source.includes(val));
}

/**
 * @description: 根据提供的 value 生成随机数 -> value 不变, 随机数不变
 * @param {Number|String} value
 * @param {Number} max: 最大值
 * @param {Number} mix: 最小值
 * @return {Number}
 */
export function genUniqueRandom(value: number | string, _max?: number, _min?: number) {
    const max = _max || 1;
    const min = _min || 0;
    const seed = `${value}`.replace(/\D/g, matchs => matchs.charCodeAt(0).toString());
    const num = (Number(seed) * 9301 + 49297) % 233280;
    const rnd = num / 233280.0;
    return Math.round(min + rnd * (max - min));
}

/**
 * @description: 递归, 并执行回调
 * @param {Array} data: 数据源
 * @param {Function} callback: 执行的回调
 */
export function recursion<T extends IMatchOption<T>>(data: T[], callback: (v: T) => void) {
    return data.some(v => {
        callback(v);
        if (v.children && v.children.length) recursion(v.children, callback);
        return false;
    });
}

/**
 * @description: 向下查找匹配条件的值
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 */
export function getMatch<T extends IMatchOption<T>, K extends keyof T>(sources: T[], value: Pick<T, K>): T | undefined {
    for (const v of sources) {
        for (const [k, val] of Object.entries(value)) {
            if (v[k] === val) return v;
            if (v.children && v.children.length) {
                const result = getMatch(v.children, value);
                if (result) return result;
            }
        }
    }
}

/**
 * @description: 向下查找是否存在提供的值
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 * @return {Boolean}
 */
export function isMatch<T extends IMatchOption<T>, K extends keyof T>(sources: T[], value: Pick<T, K>): boolean {
    return !!getMatch(sources, value);
}

/**
 * @description: 寻找匹配条件值并执行回调
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 * @param {Function} callback: 执行的回调
 * @return {Boolean}
 */
export function carryChained<T extends IMatchOption<T>, K extends keyof T>(sources: T[], value: Pick<T, K>, callback: (data: T, isDeep?: boolean) => void): boolean | undefined {
    const conditions = Object.entries(value);
    for (const v of sources) {
        const status = conditions.every(([k, val]) => val === v[k]);
        if (status) {
            callback(v, true);
            return true;
        }
        if (v.children && v.children.length) {
            const result = carryChained(v.children, value, callback);
            if (result) {
                callback(v);
                return true;
            }
        }
    }
}

/**
 * @description: 去重
 * @param {Array} data: 待去重的对象
 * @param {Array} reference: 去重参考的数组
 * @param {String} key: 唯一值的键
 * @return {Array}
 */
export function uniq<T extends object>(data: T[], reference: T[], key: keyof T) {
    return data.filter(v => !reference.some(r => r[key] === v[key]));
}

/**
 * @description: 获取指定值的深度(树形结构)
 * @param {Array} data: 数据源
 * @param {String} value: 带查找的值
 * @param {String} key: 待查找的键
 * @return {Number}
 */
export function getDepth<T extends IMatchOption<T>, K extends keyof T>(data: T[], key: K, value: T[K]): number | undefined {
    if (!isArray(data)) return;
    for (const item of data) {
        if (item[key] === value) return 0;
        if (item.children && item.children.length) {
            const r = getDepth(item.children, key, value);
            if (r !== undefined) return r + 1;
        }
    }
}

/**
 * @description: 通过位运算获取选中的值
 * @param {Number} referenceValue: 位运算参考的值
 * @return {Array}
 */
export function getCheckedOfBitOperation(referenceValue: number): number[] {
    const result: number[] = [];
    if (!referenceValue) return result;
    for (let i = 1; i <= referenceValue; i *= 2) {
        i & referenceValue && result.push(i);
    }
    return result;
}

/**
 * @description: 时间格式化
 * @param {String|Number} timestamp: 时间戳，可选，默认当前时间，时间戳格式为 linux 自动转换成 js 时间戳的格式
 * @param {String} separator: 时间分隔符，默认 -
 * @param {String} type: all|date|time 返回所有|日期|时间
 * @return {String}
 */
export function formatDate(timestamp?: number | string, { separator = '-', type = 'all', sep = ' ' } = ({} as FormatDateOption)): string {
    const formatTimestamp = timestamp && timestamp.toString().length <= 10 ? `${timestamp}100` : timestamp;
    const _date = formatTimestamp ? new Date(Number(formatTimestamp)) : new Date();
    const date = [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()].map(date => prefix(date)).join(separator);
    const time = `${prefix(_date.getHours())}:${prefix(_date.getMinutes())}:${prefix(_date.getSeconds())}`;
    return type === 'all' ? `${date}${sep}${time}` : type === 'date' ? date : time;
}

/**
 * @description: 自定义时间格式化
 * @param {Number} val: 分钟数，必填
 * @param {String} type: +, - 默认 +
 * @param {String} separator: 时间分隔符，默认 -
 * @return {String}
 */
export function customFormatDate(val: number, type = '+', separator = '-', sep = ' '): string {
    const _date = new Date();
    type === '+' ? _date.setMinutes(_date.getMinutes() + val) : _date.setMinutes(_date.getMinutes() - val);
    const date = [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()].map(date => prefix(date)).join(separator);
    const time = `${prefix(_date.getHours())}:${prefix(_date.getMinutes())}:${prefix(_date.getSeconds())}`;
    return `${date}${sep}${time}`;
}

/**
 * @description: 时间转时间戳
 * @param {String} time: 时间
 * @return {Number}
 */
export function getTimesTamp(time: string): number {
    return new Date(time).getTime() / 1000;
}

/**
 * @description: 返回距离最近 N 天的日期(格式化后的)
 * @param {Number} day: 表示取最近 N 天
 * @return {String}
 */
export function getRecentDate(day: number, option?: FormatDateOption): string {
    const _day = isNaN(day) ? 7 : day;
    return formatDate(Date.now() - _day * oneDayMS, option);
}

/**
 * @description: 缓存函数
 * @param {Function} calcFunc: 执行函数
 * @param {Boolean} isAbandon: 执行函数是否舍弃第一个参数(即标记参数)
 */
export function cacheCalc<T extends(...args: any) => any>(calcFunc: T, isAbandon?: boolean) {
    const caches: Dictionary<any> = {};
    return function cacheFunc(this: any, sign: number | string, ...args: Tail<T>): ReturnType<T> {
        if (caches[sign]) return caches[sign];
        const result = calcFunc.apply(this, isAbandon ? args : [sign].concat(args));
        result !== undefined && (caches[sign] = result);
        return result;
    };
}

/**
 * @description: 由 A 点到 B 点的过渡函数
 * @param {Number} start: A 点
 * @param {Number} end: B 点
 * @param {Number} step: 执行次数
 * @param {Function} callback: 执行回调，返回 false 则停止执行动画
 */
export function animateTo(start: number, end: number, step: number, callback: (value: number) => any) {
    // 达到临界点时不在执行
    if (start === end) return;
    let d = start + step > end ? end : start + step;
    if (start > end) {
        d = start - step > end ? start - step : end;
    }
    const status = callback(d);
    if (status !== false) window.requestAnimationFrame(() => animateTo(d, end, step, callback));
}

/**
 * @description: 下载文件流(兼容IE10)
 * @param {Blob} blob: 待下载的数据流文件
 * @param {string} fileName: 文件名称
 */
export function downLoadFile(blob: Blob, fileName: string) {
    if (window.navigator.msSaveOrOpenBlob) { // IE10
        navigator.msSaveBlob(blob, fileName);
    } else {
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob); // 创建一个指向该参数对象的URL
        link.download = fileName;
        link.click(); // 触发下载
        URL.revokeObjectURL(link.href); // 释放通过 URL.createObjectURL() 创建的 URL
    }
}

/**
 * @description: 将驼峰命名转换为短横线命名
 * @param {String} str: 待转换的字符
 */
export function kebabCase(str: string): string {
    if (!isString(str)) return '';
    return str.replace(/[A-Z]/g, (a) => `-${a.toLocaleLowerCase()}`);
}

/**
 * @description: 为空校验（数组、字符串）
 * @param {String | Array} o: 待校验目标
 * @return {Boolean}
 */
export function isEmpty(o: any) {
    if (!o) return true;
    return !o.length;
}

/**
 * @description: 为空校验（对象）
 * @param {Object} o: 待校验目标
 * @return {Boolean}
 */
export function isEmptyObject(o: object) {
    return Object.keys(o).length === 0;
}

/**
 * @description: 数组数据前移、后移
 * @param {Array} target: 目标数组
 * @param {Number} n: 移动数值，负数前移，正数后移
 * @return {Array}
 */
export function changeArrayDataPosition(target: any, n: number) {
    if (Math.abs(n) > target.length) n = n % target.length;
    return target.slice(-n).concat(target.slice(0, -n));
}