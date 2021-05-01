<script lang="ts">
import { Prop, Watch, Inject, Component, Vue } from 'vue-property-decorator';
import ZRender from 'zrender';
import { events } from '@/config/map';

type Datum = any;
type PolyLineOption = [number, number];
type Size = { width: number; height: number; };
type InstanceOption = { points: Map<string, any>; };
type PossiblePath = API.Location[] | API.Location[][] | Path<API.Location[][]> | Path<API.Location[]>;
type Path<T> = { coordinate: T; properties: { text?: string; [index: string]: any; }; };

// 需要保存的数据，不放在 vue 实例里面，防止被劫持
let i = 0;
const instanceInfo: Dictionary<InstanceOption> = {};

/**
 * @description: 自定义折线渲染组件
 * 触发事件 events
 * $emit(event, data, i, event) 只能触发 ZRender 提供的事件
 * @param {Datum} data: 提供的参数
 * @param {Number} i: 该标点的下标
 * @param {ZRender.event} event: ZRender 包装后的 event 对象
 */
@Component({
    /* eslint-disable no-empty-function */
    render() {},
    /* eslint-enable no-empty-function */
})
export default class HPolyline extends Vue {
    // 经纬度
    @Prop({ type: [Array, Object], default: () => ([]) })
    path!: PossiblePath;
    // 参考 https://ecomfe.github.io/zrender-doc/public/api.html#zrenderpolyline
    @Prop({ type: Object, default: () => ({ lineWidth: 5, stroke: 'rgba(0, 162, 255, 0.5)' }) })
    styles!: Dictionary<any>;
    // 填充颜色
    @Prop({ type: String })
    strokeColor?: string;
    // ZRender 实例的公共属性
    @Prop({ type: Object, default: () => ({}) })
    opts!: Record<string, any>;
    // 形状
    @Prop({ type: Object, default: () => ({}) })
    shape!: Record<string, any>;
    // 是否闭合 -> 给 polygon 使用
    @Prop({ type: Boolean })
    isClosing?: boolean;

    i = i; // 判断当前的下标，数据不保存至内部，防止被劫持，影响性能
    events: string[] = []; // 需要绑定的事件

    // getInstance 函数返回 ZRender 实例
    @Inject('parentInfo')
    parentInfo!: Vue & { size: Size, pixel: { x: number; y: number; }, getInstance: any, map: baiduMap['map']; BMap: baiduMap['BMap'] };

    // 获取实例
    get instance() {
        return this.parentInfo.getInstance().instance;
    }
    /**
     * @description: 将 path 处理成指定格式做兼容
     * [[{lng, lat}]], [{lng, lat}]
     * [{properties: [{lng, lat}], properties: {}}]
     * [{properties: [{lng, lat}, {lng, lat}], properties: {}}]
     */
    get finalPath(): Path<API.Location[][]> {
        const { path } = this;
        if (!Array.isArray(path)) {
            // 直接是对象时，数据可能是 { coordinate: API.Location[]; }，也可能是 { coordinate: API.Location[][]; }
            return Array.isArray(path.coordinate[0])
                ? path
                : { ...path, coordinate: [path.coordinate] };
        }
        if (path.length && path[0].coordinate) {
            return path.reduce((prev, v) => {
                v.properties && (prev.properties = v.properties);
                v.coordinate && (prev.coordinate.push(v.coordinate));
                return prev;
            }, ({ coordinate: [], properties: {}} as any));
        }
        const _path: Path<API.Location[][]> = { coordinate: path as API.Location[][], properties: {}};

        if (path.length && !Array.isArray(path[0])) {
            _path.coordinate = [path as API.Location[]];
        }
        return _path;
    }

    created() {
        this.i = i;
        i++;
        const evs: string[] = [];
        Object.keys(this.$listeners).every(k => {
            events.includes(k) && evs.push(k);
            return true;
        });
        this.events = evs;
        instanceInfo[this.i] = { points: new Map() };
        // 初始存在 map 对象，则地图已渲染，且进行一次绘制
        this.parentInfo.map && this.showPoint();
        this.parentInfo.$on('draw', this.showPoint);
    }
    beforeDestroy() {
        this.destroyCanvas();
        this.parentInfo.$off('draw', this.showPoint);
    }

    // 中心点或半径发生改变时触发
    @Watch('path')
    locationUpdate() {
        this.draw();
    }
    // 绘制颜色发生改变时触发
    @Watch('strokeColor')
    strokeColorChange() {
        const { i, strokeColor, parentInfo: { map }} = this;
        if (!map) return;
        const { points } = instanceInfo[i];
        points.forEach(po => {
            po.setStyle({
                stroke: strokeColor,
            });
        });
    }

    // 数据发生变化时触发，同时清空当前所有实例
    draw() {
        if (!this.parentInfo.map) return;
        this.clearCanvas();
        this.showPoint();
    }
    // 销毁 canvas 实例
    destroyCanvas() {
        const { i } = this;
        if (instanceInfo[i]) {
            this.clearCanvas();
            delete instanceInfo[i];
        }
    }
    // 清空画布
    clearCanvas() {
        const { i } = this;
        if (instanceInfo[i]) {
            const { points } = instanceInfo[i];
            points.forEach(po => {
                this.instance.remove(po);
            });
        }
    }
    //显示标点
    showPoint() {
        const {
            parentInfo: { map, BMap, pixel },
            finalPath: { coordinate, properties = {}},
        } = this;

        coordinate.every((path, i) => {
            const _path = path.map(v => {
                const point = new BMap.Point(v.lng, v.lat);
                const px = map.pointToOverlayPixel(point);
                return [Math.floor(px.x - pixel.x), Math.floor(px.y - pixel.y)];
            });
            if (_path.length) {
                // properties 不存在则使用默认颜色
                this.genPoint(_path, i, properties || { fillColor: 'rgba(0, 0, 0, 0)', strokeColor: '#77eefd' });
            }
            return true;
        });
    }
    /**
     * @description: 生成折线
     * @param {Array} path: 折线点集合
     * @param {Number} index: 当前折线点的下标
     * @param {Object}
     */
    genPoint(path: PolyLineOption[], index: number, properties: Record<string, any>) {
        const { i } = this;
        const { points } = instanceInfo[i];
        // 生成实例
        const po = this.genInstance(path, properties);
        this.instance.add(po);
        points.set(`polyline${index}`, po);
    }
    // 生成实例
    genInstance(points: PolyLineOption[], properties: Record<string, any>) {
        const { opts, styles, shape, strokeColor, isClosing, events } = this;
        const _opts = {
            ...opts,
            style: { ...styles, ...JSON.parse(JSON.stringify({ stroke: strokeColor })), ...this.formatStyles(properties) },
            shape: { points, smooth: 0.5, ...shape },
            z: 0,
        };
        const ins = isClosing
            ? new ZRender.Polygon(_opts)
            : new ZRender.Polyline(_opts);
        // 为圆绑定事件
        events.every(k => {
            ins.on(k, (ev: ZRender['event']) => this.$emit(k, ev));
            return true;
        });
        return ins;
    }
    /**
     * @description: 格式化外部传递的属性
     * @param {Object} styles: 样式信息
     */
    formatStyles({ fillColor, strokeColor, strokeStyle, ...args }: Record<string, any>): Record<string, any> {
        const result = args;
        fillColor && (result.fill = fillColor);
        strokeColor && (result.stroke = strokeColor);
        strokeStyle && (result.lineDash = strokeStyle === 'dashed' ? [5, 5] : strokeStyle);
        return result;
    }
}
</script>