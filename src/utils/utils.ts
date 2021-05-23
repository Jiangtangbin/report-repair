import { isArray, formatDate, isObject, getDepth } from '.';
import { conferenceMessageTemp } from '@/config/index';
import get from 'lodash/get';
import { EChartOption } from 'echarts';
import { isNumber, isString } from '@/utils/index';
import { i18n } from '@/locale/index';

type ChartData = { valueAxis: string[]; series: number[][]; legend: string[] };
type ChartData2 = { valueAxis: string[]; series: { value: string | number; name: string; }[][]; legend: string[]; cateAxis: string[] };
type CanvasOptions = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    format?: string;
    dpi?: number
};

type locationType = 'lng' | 'lat';
type PrintHTML = HTMLElement | HTMLCanvasElement | Element;
// 获取倒计时的类型
type CountDownType = 'day' | 'hours' | 'minutes' | 'second';
type CountDownOption = { type?: CountDownType };

const oneMinuteMS = 60 * 1000; // 一分钟有多少毫秒.
const oneHoursMS = 60 * oneMinuteMS; // 一个小时有多少毫秒.
const oneDayMS = 24 * oneHoursMS; // 一天有多少毫秒.

/**
 * @description: 对图表数据进行转换
 * @param {Array} data: 数据源[{ dimension: "important", name: "重点消防单位", cnt: 1 }]
 * @return {Object} Data
 */
export function chartFormat(data: ResponseChart.ChartDatum[]): ChartData {
    const result: ChartData = { valueAxis: [], series: [], legend: [] };
    if (!isArray(data)) return result;

    return data.length && data[0].children && data[0].children.length
        // 存在 children 且 children.length >= 1 时
        ? data.reduce((prev, cur, i) => {
            prev.valueAxis.push(cur.name);
            if (i === 0) {
                prev.legend.push(...cur.children!.map(v => v.name));
                prev.series.push(...Array.from({ length: cur.children!.length }, () => ([])));
            }
            cur.children!.some((v, j) => {
                prev.series[j] && prev.series[j].push(isString(v.cnt) ? v.cnt : Number(v.cnt));
                return false;
            });
            return prev;
        }, result)
        : data.reduce((prev, cur, i) => {
            // 单个的时候不处理 legend，自动取 seriesName
            prev.valueAxis.push(cur.name);
            i === 0 && prev.series.push([]);
            prev.series[0].push(isString(cur.cnt) ? cur.cnt : Number(cur.cnt));
            return prev;
        }, result);
}

// 对图表 tips 进行处理
export function formatter(data: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]): string {
    // 只要是数组则取 lineText，barText 除了 pie 暂时还未碰到这种可能，后期得持续关注
    const formatFunc = isArray(data) ? lineText : barText;
    const prefix = isArray(data) ? get(data, '[0].axisValue') : '';
    return isArray(data)
        ? prefix + data.reduce((prev, cur) => (prev + formatFunc(cur)), '')
        : prefix + formatFunc(data);
}

export function lineText(data: EChartOption.Tooltip.Format): string {
    return `<br /><span style="display:inline-block; margin-right:5px; border-radius:10px; width:10px; height:10px; background-color:${data.color};"></span>${data.seriesName}: ${data.value} ${get(data, 'data.name', '')}`;
}

export function barText(data: EChartOption.Tooltip.Format): string {
    return `${data.seriesName}<br /><span style="display:inline-block; margin-right:5px; border-radius:10px; width:10px; height:10px; background-color:${data.color};"></span>${data.name}: ${isNumber(data.value) && isNaN(data.value) ? 0 : data.value}`;
}

// 设置轴 valueAxis 最大值
export function setMax(data: { max: number; min: number; }) {
    return Number((data.max === data.min
        ? data.max && data.max + (data.max / 2)
        : data.max && data.max + (data.max - data.min) * 0.2
    ).toFixed(2));
}

// 设置轴 valueAxis 最小值(数据存在负值的情况下取负值，否则最小值取 0)
export function setMin(data: { max: number; min: number; }) {
    return Math.max(
        Math.min(0, data.min), // 防止数据最小值是负数的情况.
        Number((data.min === data.max
            ? data.min && data.min / 2
            : data.min && data.min - (data.max - data.min) * 0.2
        ).toFixed(2))
    );
}

/**
 * @description: 合并后台传递的图表数据
 * @param {Array} title: 首层的标题数组
 * @param {...Array} data: 需合并的数据
 */
export function mergeData<T extends ResponseChart.ChartDatum>(title: string[], ...args: T[][]) {
    const max = args.length;
    const a: Dictionary<T[]> = {};
    args.every((data, i) => {
        data.every(data => {
            const k = data.dimension!;
            a[k] = a[k] || [];
            // i 大于 0 且该类数据的下标([i - 0])不存在数据时，补充数据
            if (i > 0 && !(a[k][i - 1])) a[k].push({ ...args[i][0], dimension: k, name: title[i] || args[i][0].name, cnt: 0 });
            a[k][i] = title[i] ? { ...data, name: title[i] } : data;
            return true;
        });
        return true;
    });
    return Object.entries(a).map(([k, values]) => {
        const cnt = values.reduce((count, v) => (count + v.cnt), 0);
        // 如果 values.length 小于提供的数据时，补充数据
        const children = values.length >= max
            ? values
            : Array.from({ length: max }, (v, i) => values[i] || ({ ...args[i][0], dimension: k, name: title[i] || args[i][0].name, cnt: 0 }));
        return {
            name: k,
            dimension: k,
            cnt,
            children,
        };
    });
}

/**
 * 解析后台传过来的数据
 * @param {Array} souce: 数据源
 * @param {Object} dataType: 图表某些数据的映射表
 * @return {Object} { series: series 数据(二维数组), cateAxis: 类目轴数据, valueAxis: 数据轴数据, legend: [] }
 */
export function parseChartData(source: ResponseDevice.SenseData[], dataType: API.Response['SenseDataType']): ChartData2 {
    const legend = Object.keys(source[0].sense);
    const result: ChartData2 = { cateAxis: [], series: [], legend: [], valueAxis: [] };
    legend.some(code => {
        const { name, danwei } = dataType[code] || { name: i18n.t('h.common.unknown'), danwei: i18n.t('h.common.unknown') };
        result.legend.push(name);
        result.valueAxis.push(danwei);
        return false;
    });
    source.some(item => {
        result.cateAxis.push(formatDate(item.timestamp, { sep: '\n' }));
        legend.filter((code, j) => {
            Object.values(item.sense).some((value, i) => {
                // 风向值转换，并且加入转义单位
                if (code === 'A10000008') result.valueAxis[j] = getWindDirection(Number(value) / 10);
                result.series[i]
                    ? result.series[i].push({ value, name: result.valueAxis[i] })
                    : result.series.push([{ value, name: result.valueAxis[i] }]);
                return false;
            });
            return false;
        });
    });
    return result;
}

/**
 * 兼容低版本使用摄像头 navigator.mediaDevices
 */
export function cameraLow() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) return;
    // 不存在 mediaDevices 对象时
    if (!navigator.mediaDevices) (navigator as Dictionary<any>).mediaDevices = {};
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            const getUserMedia = (navigator as Dictionary<any>).webkitGetUserMedia || (navigator as Dictionary<any>).mozGetUserMedia;
            // 不支持摄像头时
            if (!getUserMedia) return Promise.reject(new Error('The getusermedia function is not implemented in this browser'));
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }
}

/**
 * 通过 canvas 生成 url
 * @param {Blob|String|DOM} file: Blob DOM 元素
 * @param {Boolean} isUrl: 是否返回 base64
 * @param {Object} params2: 其它参数 ({width: 图片宽度, height: 图片高度x: 绘制的起点, y: 绘制的起点, format: 转换的格式, dpi: 清晰度})
 */
export function canvasConvert<T extends boolean>(file: HTMLImageElement | HTMLVideoElement, isUrl: T, { x = 0, y = 0, width, height, format, dpi } = {} as CanvasOptions): string | Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width || file.width;
    canvas.height = height || file.height;
    context && context.drawImage(file, x, y);
    return isUrl ? canvas.toDataURL(format, dpi) : new Promise(resolve => canvas.toBlob(resolve, format, dpi));
}

/**
 * 百度逆地址解析
 * @param {Object|String} target: 待解析的值，对象则必须是地图的坐标对象
 * @param {Object} BMap: 地图构造器
 */
export async function geocoder<T extends baiduMap['point'] | string>(target: T, BMap: baiduMap['BMap']): Promise<T extends string ? baiduMap['point'] : baiduMap['addressInfo']> {
    const geo = new BMap.Geocoder();
    if (isObject(target)) {
        return new Promise(resolve => geo.getLocation(target, resolve));
    } else {
        return new Promise(resolve => geo.getPoint(target, resolve));
    }
}

// 风向值 -> [风向区间, 风向区间, 风向偏移计算值, 风向值];
export const windDirection = [
    [0, 45, 45, 'h.chart.northeastNortherly'],
    [45, 45, 45, 'h.chart.northeasterly'],
    [45, 90, 45, 'h.chart.northeastEasterly'],
    [90, 90, 45, 'h.chart.easterly'],
    [90, 135, 135, 'h.chart.southeastEasterly'],
    [135, 135, 135, 'h.chart.southeasterly'],
    [135, 180, 135, 'h.chart.southeastSoutherly'],
    [180, 180, 135, 'h.chart.southerly'],
    [180, 225, 225, 'h.chart.southwestSoutherly'],
    [225, 225, 225, 'h.chart.southwesterly'],
    [225, 270, 225, 'h.chart.southwestWesterly'],
    [270, 270, 225, 'h.chart.westerly'],
    [270, 315, 315, 'h.chart.northwestWesterly'],
    [315, 315, 315, 'h.chart.northwesterly'],
    [315, 360, 315, 'h.chart.northwestNortherly'],
    [0, 0, 315, 'h.chart.northerly'],
    [360, 360, 360, 'h.chart.northerly'],
] as const;

/**
 * @description: 根据风向数值获取翻译的值
 * @param {Number} num: 风向数值
 * @returns {String}
 */
export function getWindDirection(num: number | string): string {
    const _num = Number(num);
    if (!isNumber(_num)) return num as string;
    for (const [start, end, offset, str] of windDirection) {
        // 两者相等时风向是正的, 无偏移值
        if (_num === start && _num === end) return i18n.t(str) as string;
        if (_num > start && _num < end) return `${i18n.t(str)} ${Math.abs(offset - _num).toFixed(1)}°`;
    }
    return num.toString();
}

const region = ['province', 'city', 'area', 'county', 'street'];
const device = ['category', 'sub_category'];
/**
 * @description: 对行政区域|设备大小类格式化
 * @param {Object} data: 待处理的参数值
 * @param {Object} source: region | device 的数据源
 */
export const formatParameter = (() => {
    const multipleDepthKey = {
        region: (index: number) => region[index],
        device: (index: number) => device[index],
    };
    // 获取指定的属性层级 depth 所对应的名称
    function getDepthKey(source: Dictionary<any[]>, key: string, value: any): string | undefined {
        if (!source.hasOwnProperty(key)) return '';
        const i = getDepth(source[key], 'value', value);
        return isNumber(i) && multipleDepthKey[key as 'region']
            ? multipleDepthKey[key as 'region'](i)
            : '';
    }
    return function formatParameter(data: Dictionary<any>, source: Dictionary<any[]>) {
        const keys = Object.keys(data);
        ['region', 'device'].some(k => {
            if (keys.includes(k)) {
                if (isArray(data[k])) {
                    data[k].forEach((v: any) => {
                        const key = getDepthKey(source, k, v);
                        key && (data[key] = [...(data[key] || []), v]);
                    });
                }
                else {
                    const key = getDepthKey(source, k, data[k]);
                    key && (data[key] = data[k]);
                }
                delete data[k];
            }
            return false;
        });
        return data;
    };
})();

/**
 * @description: 对行政区域|设备大小类数据回填
 * @param {String} key: region | device
 */
export function getParameterKey(key: string) {
    return region.includes(key)
        ? 'region'
        : device.includes(key)
            ? 'device'
            : key;
}

/**
 * @description: 对会议人员参与提示进行格式化处理
 * @param {Object} data: 需格式的对象 { op: 操作人, obj: 操作对象, event: 执行方法 }
 * @param {Boolean} isFlag: 是否需要返回标签标记
 */
export function formatConferenceTemp(data: { op: string; obj: string; event: string; }, isFlag: boolean) {
    if (!(data.op && data.event && conferenceMessageTemp.hasOwnProperty(data.event))) return '';
    return conferenceMessageTemp[data.event as 'start'].replace(/<%=\s(\w+)\s%>/g, (reg: string, $1: string) => {
        return isFlag
            ? `<span class="conference__person ${$1 === 'op' ? 'conference__person--op' : 'conference__person--obj'}">${data[$1 as 'op']}</span>`
            : data[$1 as 'op'];
    });
}

/**
 * @description: 获取右键菜单
 * @param {String} data: 右键菜单
 * @param {String} 需要获取的菜单子级
 * @returns {Array}
 */
export function getRight(data: Dictionary<any> | Dictionary<any>[], ...args: (string | number)[]): Dictionary<any>[] {
    let result: any[] = [];
    try {
        for (let i = args.length; i; i--) {
            if (isNaN(Number(args[i - 1]))) {
                const path = args.slice(0, i).join('.');
                const s = get(data, `${path}.default`) || get(data, path);
                if (s) {
                    result = s;
                    break;
                }
            }
        }
    } catch (error) {
        console.error('菜单出错', data, ...args);
        result = [];
    }
    result = result.filter(v => v.value !== 'dragging' && v.value !== 'delete');
    return result;
}

/**
 * @description: 打印 canvas
 */
export function printCanvas(canvas: PrintHTML | PrintHTML[], cssText = '*:not(html):not(body):not(.print-dom) { display: none; }') {
    const styleTag = appendStyle(cssText);
    const frag = document.createDocumentFragment();
    let doms = ([] as PrintHTML[]).concat(canvas).map(v => {
        v.className += 'print-dom';
        frag.appendChild(v);
        return v;
    });
    document.body.appendChild(frag);
    window.print();
    removeHeadTag(styleTag);
    doms.every(v => {
        document.body.removeChild(v);
        return true;
    });
    doms = [];
}

/**
 * @description: 动态新增 css 样式
 * @param {String} text: 待新增的样式
 */
export function appendStyle(text: string) {
    const style: HTMLStyleElement = document.createElement('style');
    style.setAttribute('type', 'text/css');
    // @ts-ignore
    if (style.styleSheet) {
        // IE
        // @ts-ignore
        style.styleSheet.cssText = text;
    }
    else {
        const textNode = document.createTextNode(text);
        style.appendChild(textNode);
    }
    let heads = document.getElementsByTagName('head');
    if (heads.length) {
        heads[0].appendChild(style);
    }
    else {
        document.documentElement.appendChild(style);
    }
    return style;
}

/**
 * @description: 移除头部内的标签
 * @param {HTMLElement} tag: 待移除的标签
 */
export function removeHeadTag(tag: HTMLElement) {
    let heads = document.getElementsByTagName('head');
    if (heads.length) {
        heads[0].removeChild(tag);
    }
    else {
        document.documentElement.removeChild(tag);
    }
}

/**
 * 行政区域合并，将行政区域合并为一个字段
 */
export const mergeRegion = (() => {
    type Region = 'province_name' | 'city_name' | 'area_name' | 'county_name' | 'street_name';
    const listGather = ['province_name', 'city_name', 'area_name', 'county_name', 'street_name'];
    return (data: Partial<Record<Region, string>>) => {
        return listGather.reduce((t: string, k) => (t + (data[k as Region] || '')), '');
    };
})();

/**
 * 返回倒计时
 * @param {Number} timestamp: 时间戳
 * @param {Object} params1: { type: 获取至(day | hours | minutes | second) }
 */
export function getCountDown(timestamp: number = Date.now(), { type }: CountDownOption = {}): string {
    const day = ~~(timestamp / oneDayMS);
    const hours = ~~(timestamp / oneHoursMS % 24);
    const minutes = ~~(timestamp / oneMinuteMS % 60);
    const second = ~~(timestamp / 1000 % 60);
    const _day = `${day}${i18n.t('h.common.day')}`;
    const _hours = `${hours}${i18n.t('h.common.hours')}`;
    const _minutes = `${minutes}${i18n.t('h.common.minutes')}`;
    const _second = `${second}${i18n.t('h.common.second')}`;
    if (!type) {
        return `${day ? `${_day}` : ''}${hours ? `${_hours}` : ''}${minutes ? `${_minutes}` : ''}${second ? `${_second}` : ''}`;
    }
    return type === 'day'
        ? _day
        : type === 'hours'
            ? _day + _hours
            : type === 'minutes'
                ? _day + _hours + _minutes
                : _day + _hours + _minutes + _second;
}

/**
 * @description: 行政区域的编码解码
 * @param {Array} data: 待处理的数据
 * @param {Number} type: 1为编码，2为解码
 * @return: 编码返回数组[省,市...]，解码返回对象{ province: 省... }
 */
export const transformRegionCoding = (() => {
    type RegionField = 'city' | 'area';
    type Region = Record<RegionField, string>;
    const listGather: RegionField[] = ['city', 'area'];
    function transformRegionCoding(data: string[]): Region
    function transformRegionCoding(data: Region): string[]
    function transformRegionCoding(data: any) {
        return Array.isArray(data)
            ? listGather.reduce((prev, cur, index) => {
                prev[cur] = data[index] || '';
                return prev;
            }, ({} as Region))
            : listGather.reduce((prev, cur) => {
                data[cur] && prev.push(data[cur]);
                return prev;
            }, ([] as string[]));
    }
    return transformRegionCoding;
})();

/**
 * @description: 隐藏手机号
 * @param {String|Number} mobile: 需隐藏的手机号
 */
export function mobileMask(mobile?: string | number) {
    if (!mobile) return mobile;
    return mobile.toString().replace(/^(\d{3})(\d{4})(\d{4})$/, '$1****$3');
}

/**
 * @description: 隐藏身份证号
 * @param {String|Number} identify: 需隐藏的身份证号
 */
export function mobileIdentify(identify?: string | number) {
    if (!identify) return identify;
    return identify.toString().replace(/^(.{4})(?:\d+)(.{4})$/, '$1******$2');
}

/**
 * @description: 用户名验证
 * @param {String} value: 用户名
 */
export const userNameReg = (value: string, required?: boolean) => {
    const lengthReg = /[\u4e00-\u9fa5]/g;
    let length = 0;
    if (value !== undefined) {
        const extraArr = value.match(lengthReg);
        length = value.length + (extraArr ? extraArr.length : 0);
    }
    const arrErr = [];
    if ((value || required) && (length < 3 || length > 32)) {
        arrErr.push(i18n.t('h.tips.accountVerification'));
    }
    return arrErr;
};

/**
 * @description: 密码验证规则
 * @param {String} value: 密码
 */
export const passwordReg = (value: string, required?: boolean) => {
    // const spaceReg = /^\d|\s+/g;
    // const hanzi = /[\u4e00-\u9fa5]/g;
    const strReg = /^.{6,}$/; // 达到六位即可
    // const strReg = /^(?=[a-zA-Z])(?=.*[0-9])(.{8,16})$/; // 必须由两种类型组成
    let arrErr = [];
    if (value || required) {
        if (!strReg.test(value)) arrErr.push(i18n.t('h.tips.passwordVerification'));
        // if (spaceReg.test(value)) {
        //   arrErr.push('请勿以数字开头或输入空格');
        // } else if (hanzi.test(value)) {
        //   arrErr.push('密码不允许输入汉字');
        // } else if (!strReg.test(value)) {
        //   arrErr.push('密码应由字母和数字构成，在8-16位字符之间，且以字母开头');
        // } else {
        // }
    }
    return arrErr;
};

/**
 * @description:手机号验证规则
 * @param {String} value: 密码
 */
export const mobileReg = (value: string, required: boolean = false, message: string = 'h.tips.mobileVerification') => {
    const arrErr = [];
    if (required || value) {
        const flag = /^1[123456789]\d{9}$/.test(value);
        // const flag = /^0?(13[0-9]|15[012356789]|18[0123456789]|14[57]|17[6783]|170[059]|14[57]|166|19[89])[0-9]{8}$/.test(value);
        // const flag = !!value;
        flag || arrErr.push(i18n.t(message));
    }
    return arrErr;
};

/**
 * @description: 邮箱验证
 * @param {String} value: 待验证的邮箱
 * @param {Boolean} required: 是否是必填项
 * @param {String} message: 错误提示语
 */
export const emailReg = (value: string, required = false, message = 'h.tips.emailVerification') => {
    const arrErr = [];
    if (required || value) {
        const flag = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(value);
        flag || arrErr.push(i18n.t(message));
    }
    return arrErr;
};

/**
 * @description: 车牌号验证
 * @param {String} value: 待验证的车牌号
 * @param {String} message: 验证失败的提示语
 */
export const platenunbersVerify = (() => {
    const reg = /([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{1}(([A-HJ-Z]{1}[A-HJ-NP-Z0-9]{5})|([A-HJ-Z]{1}(([DF]{1}[A-HJ-NP-Z0-9]{1}[0-9]{4})|([0-9]{5}[DF]{1})))|([A-HJ-Z]{1}[A-D0-9]{1}[0-9]{3}警)))|([0-9]{6}使)|((([沪粤川云桂鄂陕蒙藏黑辽渝]{1}A)|鲁B|闽D|蒙E|蒙H)[0-9]{4}领)|(WJ[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼·•]{1}[0-9]{4}[TDSHBXJ0-9]{1})|([VKHBSLJNGCE]{1}[A-DJ-PR-TVY]{1}[0-9]{5})/;
    return (value?: string, message = 'h.tips.carNumberVerification') => {
        return value && !reg.test(value) ? i18n.t(message) : undefined;
    };
})();

/**
 * 身份证号验证
 * @param {String} value: 待验证的手机号
 * @param {String} message: 错误提示语
 */
export const identifyReg = (() => {
    const p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
    const checkCode = (val: string) => {
        const code = val.substring(17);
        if (p.test(val)) {
            let i = 0;
            let sum = 0;
            for (; i < 17; i++) {
                sum += Number(val[i]) * factor[i];
            }
            if (parity[sum % 11].toString() === code.toUpperCase()) {
                return true;
            }
        }
        return false;
    };
    return (value: string, message = 'h.tips.identifyVerification') => {
        const arrErr = [];
        if (value) {
            checkCode(value.toString()) || arrErr.push(i18n.t(message));
        }
        return arrErr;
    };
})();

/**
 * @description: 经纬度验证
 * @param {String} value: 待验证的经|纬度
 * @param {String} type: 验证经|纬度
 * @param {Boolean} required: 是否是必填项
 * @param {String} message: 错误提示语
 */
export function locationReg(value: string | number, type: locationType = 'lng', required = false, message = 'h.tips.locationVerification') {
    const obj = {
        lng: /^[+-]?(((([01]?[0-7]?[0-9])|(0?[0-9]{1,2}))(\.[0-9]{1,6})?)|(180(\.0{1,6})?))$/,
        lat: /^[+-]?(([0-8]?[0-9](\.[0-9]{1,6})?)|(90(\.0{1,6})?))$/,
    };
    const arrErr = [];
    if (required || value) {
        const flag = obj[type].test(value.toString());
        flag || arrErr.push(i18n.t(message));
    }
    return arrErr;
}

/**
 * @description: 格式化手机号
 * @param {String} text: 待格式化的字符串
 * @param {String|Number} placeholder: 占位符
 *
 * @return {String}
 */
export function formatMobile(text: string | number, placeholder: string | number = ' '): string {
    const strText = text.toString();
    if (!text) return strText;
    const r = strText
        .replace(/(\s|,|，|\n)+/g, `${placeholder}`)
        .replace(new RegExp(`^${placeholder}|${placeholder}$`, 'g'), '');
    return r === placeholder
        ? ''
        : r;
}