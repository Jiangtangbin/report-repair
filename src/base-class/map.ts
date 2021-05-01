import { Prop, Component, Vue } from 'vue-property-decorator';
import { markerLabelOpts, originalSize, size, markerRightMenu, iconY, iconX, offlinePosition } from '@/config/map';
// import { planDistribution, eraseAlarm } from '@/config/api';
import { planDistribution } from '@/config/api';
import { isArray, isBoolean } from '@/utils/index';
import get from 'lodash/get';
import { i18n } from '@/locale/index';

const spriteIcon = require('@/assets/images/map/map-sprite.png');
// 为设备大小类做的特殊处理
const specCondition = ['category', 'sub_category'];
const dimKey = ['name', 'username', 'orgname', 'fullname', 'flag', 'code', 'address', 'director_name', 'point', 'tag', 'work', 'mobile', 'work_address'];

type PointsDatum = {
    numeric: Map<string, { x: number; y: number; indexs: number[]; }>;
    points: Map<string, { x: number; y: number; index: number }>;
};
type AlarmDatum = { x: number; y: number; };

/**
 * @description: 条件筛选
 * @param {Object} data: 待筛选的数据
 * @param {String} k: 检索的 key
 * @param {String|String[]} v: 检索的值
 * @return {Boolean}
 */
function MatchCondition(data: Dictionary<any>, k: string, v: any | any[]): boolean {
    // 不存在属性时, 通过匹配
    if (!data.hasOwnProperty(k)) return true;
    if (isArray(v)) {
        const value = data[k];
        return v.length
            ? isArray(value)
                ? v.some(j => value.includes(j))
                : v.includes(data[k])
            : true;
    }
    else {
        const value = isArray(data[k]) ? data[k] : data[k].toString();
        return v === undefined || v === '' || (dimKey.includes(k) ? value.indexOf(v) !== -1 : value.toString() === v.toString());
    }
}

/**
 * @description: 多维度条件匹配
 * @param {Object} data: 待匹配的数据
 * @param {Array} conditions: 待匹配的条件集合
 * @param {Boolean} flag?: 前置条件不符合时的返回值(非 boolean 值返回)
 */
function matchMultipleCondition(data: Dictionary<any>, flag?: boolean) {
    return function isMatchDimensionConditions(condition: Dictionary<any>, ...args: Dictionary<any>[]): boolean {
        const status = Object.entries(condition).every(([k, v]) => MatchCondition(data, k, v));
        return args.length
            ? status
                // @ts-ignore
                ? isMatchDimensionConditions.apply(null, args)
                : isBoolean(flag) ? flag : status
            : status;
    };
}

// 条件匹配
export function isMatchCondition(data: Dictionary<any>, condition: Dictionary<any>): boolean {
    const keys = Object.entries(condition);
    if (!keys.length) return true;
    // 默认条件匹配
    const a = keys.every(([k, v]) => {
        // 如果是特殊条件，通过匹配
        if (specCondition.includes(k)) return true;
        return MatchCondition(data, k, v);
    });
    // 为设备大小类做的匹配，只需任意满足一个条件
    let b;
    if (a) {
        for (let i = 0; i < specCondition.length; ++i) {
            const key = specCondition[i];
            // 如果是数组且长度为 0 的情况下，跳过验证
            if (!condition.hasOwnProperty(key) || (isArray(condition[key]) && !condition[key].length)) continue;
            b = MatchCondition(data, key, condition[key]);
            if (b) break;
        }
    }

    return a && (b === undefined || b);
}

// 是否匹配多维度条件 -> 逐级匹配，以最后一层为准
function isMatchMultipleCondition(data: Dictionary<any>, conditions: Dictionary<any>[][], flag?: boolean): boolean {
    return conditions.length
        // @ts-ignore
        ? conditions.some(v => matchMultipleCondition(data, flag)(...v))
        : true;
}

// 地图内部组件抽离时引入过渡函数
@Component
export default class MapMiddleware extends Vue {
    load?(): void;

    reload = (this.$parent as any).realod;
    preventChildrenRender = (this.$parent as any).preventChildrenRender;
    mapInit = false;
    map: null | baiduMap['map'] = null;
    BMap: null | baiduMap['BMap'] = null;

    mounted() {
        const map = (this.$parent as any).map;
        map ? this.ready() : this.$parent.$on('ready', this.ready);
    }
    beforeDestroy() {
        this.BMap = this.map = null;
    }

    ready() {
        let $parent: Vue | null = this.$parent;
        const BMap = this.BMap = ($parent as any).BMap;
        const map = this.map = ($parent as any).map;
        this.mapInit = true;
        this.load && this.load();
        this.$emit('ready', { BMap, map });
        $parent = null;
    }
}

// 供单独的模块调用
@Component
export class Base extends Vue {
    // 数据源
    @Prop({ type: [Object, Array], default: () => ({}) })
    data!: Dictionary<any> | Dictionary<any>[];
    /**
     * @description: 筛选条件 -> { sub_category: ['videoin', 'smoke'], isonline: 1 }
     */
    @Prop({ type: Object, default: () => ({}) })
    condition!: Dictionary<any>;
    /**
     * @description: 多维度筛选条件 -> [[{ sub_category: 'videoin' }, { isonline: 1 }]]
     */
    @Prop({ type: Array, default: () => ([]) })
    prefixCondition!: Dictionary<any>[][];
    // label 是否显示
    @Prop(Boolean)
    label?: boolean;
    // label 配置
    @Prop({ type: Object, default: () => markerLabelOpts })
    labelOptions!: Dictionary<any>;
    // 聚合容差
    @Prop({ type: Number, default: 40 })
    space!: number;

    usableMarkers!: Dictionary<any>[];
    BMap!: baiduMap['BMap'];
    spriteIcon = spriteIcon;
    size = size;
    originalSize = originalSize;
    iconY = iconY;
    iconX = iconX;
    temporaryAlarmMarkers: PointsDatum = { numeric: new Map(), points: new Map() };

    get getViewportPoints() {
        const { usableMarkers, BMap } = this;
        return usableMarkers.map(item => new BMap.Point(item.lng, item.lat));
    }
    get alarmMarkers(): AlarmDatum[] {
        const { usableMarkers, temporaryAlarmMarkers: { numeric, points }} = this;
        const result: AlarmDatum[] = [];
        // 直接显示标点的下标
        const unpolymerizedIndex: Set<number> = new Set();
        numeric.forEach(v => {
            const isalarm = v.indexs.some((i, j) => {
                j === 0 && unpolymerizedIndex.add(i);
                return Boolean(usableMarkers[i] && usableMarkers[i].isalarm);
            });
            isalarm && result.push({ x: v.x, y: v.y });
        });
        points.forEach(v => {
            if (!unpolymerizedIndex.has(v.index)) {
                usableMarkers[v.index] &&
                    usableMarkers[v.index].isalarm &&
                    result.push({ x: v.x, y: v.y });
            }
        });
        return result;
    }

    /**
     * @description: 条件筛选
     * @param {Object} data: 待筛选的数据
     * @param {Object} condition: 筛选条件集合
     */
    isMatchCondition(data: Dictionary<any>, condition: Dictionary<any>): boolean {
        return isMatchCondition(data, condition);
    }
    /**
     * @description: 多维度条件筛选
     * @param {Object} data: 待筛选的数据
     * @param {Object} condition: 筛选条件集合
     */
    isMatchMultipleCondition(data: Dictionary<any>, condition: Dictionary<any>[][]): boolean {
        return isMatchMultipleCondition(data, condition, true);
    }
    /**
     * @description: 获取右键菜单
     * @param {String} data: 右键菜单
     * @param {String} ...需要获取的菜单子级
     * @returns {Array}
     */
    getRight(data: Dictionary<any> | Dictionary<any>[], ...args: string[]): Dictionary<any>[] {
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
        result = result.filter(v => v.value !== 'dragging');
        return result;
    }
    /**
     * @description: 生成报警中的标点
     * @param {Map} numeric: 标点上方的数字实例信息
     * @param {Map} points: 标点实例信息
     */
    genAlarmPoint(numeric: PointsDatum['numeric'], points: PointsDatum['points']) {
        this.temporaryAlarmMarkers = {
            numeric,
            points,
        };
    }
}

// 地图右键菜单事件
@Component
export class MapRightEvent extends Vue {
    // 地图 id (供离线地图使用，在线地图为 1)
    @Prop({ type: Number, default: 1 })
    mapid!: number;

    rangeInfo = offlinePosition;
    markerRightMenu = markerRightMenu;

    /**
     * @description: 判断右键菜单是否能够渲染
     * @param {Object} menu: 右键的菜单项
     * @param {Object} data: 判断的数据
     *
     * @return {Boolean}
     */
    hasRendering(menu: { require?: any, requireValue?: any }, data: Record<string, any>) {
        if (!menu.hasOwnProperty('require')) return true;
        return menu.hasOwnProperty('requireValue')
            ? menu.requireValue === data[menu.require]
            : data[menu.require];
    }
    /**
     * @description: 消警
     * @param {string} type: 消警的类型
     * @param {Array} unique: 消警的唯一值;
     * @param {Object} data: 需消警的对象
     */
    // async clearAlarm<T extends number | string>(type: T extends string ? 1 : 2 | 3 | 4 | 5 | 6 | 7, unique: T) {
    //     const { type: types } = await eraseAlarm({ type, unique });
    //     return !types;
    // }
    /**
     * @description: 右键菜单处理, 处理地图类操作
     * @param {String} type: 点击的类型
     * @param {Object} data: 点击对象的数据
     */
    rightHandle(type: string, data: Dictionary<any>) {
        switch (type) {
            case 'dragging':
                data.dragging = true;
                // data.pointBack = { lng: data.lng, lat: data.lat };
                break;
            default:
                console.log('触发其它类型');
                return false;
        }
    }
    // 移动事件
    movePoint(data: Datum, type: string, ev: ZRender['event']) {
        // 如果是右键触发的不响应
        if (ev.event.button === 2) return false;
        // 如果没有开启移动则不响应
        if (!data.dragging) return false;
    }
    // 抬起事件
    liftPoint(data: Datum, type: string, ev: ZRender['event']) {
        // 如果是右键触发的不响应
        if (ev.event.button === 2) return false;
        // 如果没有开启移动则不响应
        if (!data.dragging) return false;
        const { $el, map, BMap, $Message } = this;
        const { top, left } = $el.getBoundingClientRect();
        const { rangeInfo: { bounds: { sw, ne }}} = this;
        const putPoint = map.pixelToPoint(new BMap.Pixel(ev.event.x - left, ev.event.y - top));
        const bounds = new BMap.Bounds(new BMap.Point(sw.lng, sw.lat), new BMap.Point(ne.lng, ne.lat));
        const isContainer = bounds.containsPoint(putPoint);
        if (!isContainer) {
            this.$emit('deleteSuccess');
            return $Message.info(this.$t('h.tips.pointNotInRange'));
        }
        this.markerDragend(data, type, putPoint);
    }
    /**
     * @description: 拖拽标点
     * @param {Object} data: 操作的对象 -> p.s data 存在 pointBack 数据，移动失败可据此返回
     * @param {String} type: 操作的标点类型
     * @param {Object} point: 移动的经纬度
     */
    async markerDragend(data: Dictionary<any>, type: string, { lng, lat }: any) {
        const params = {
            map_id: data.map_id,
            marker_type: type,
            flag: type === 'd' ? data.flag : data.id,
            lng,
            lat,
        };
        const { type: types } = await planDistribution(params);
        if (!types) {
            Object.assign(data, { lng, lat, dragging: false });
            this.$Message.success(i18n.t('h.map.dragSuccess') as string);
        } else {
            this.$Message.info(i18n.t('h.map.dragFail') as string);
        }
    }
}