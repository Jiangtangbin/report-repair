<script lang="ts">
import { Prop, Watch, Inject, Component, Vue } from 'vue-property-decorator';
import ZRender from 'zrender';
import { events } from '@/config/map';

type Datum = any;
type Size = { width: number; height: number; };
type InstanceOption = { points: Map<'control' | 'circle', any | [any, any]>; };

// 需要保存的数据，不放在 vue 实例里面，防止被劫持
let i = 0;
const instanceInfo: Dictionary<InstanceOption> = {};

/**
 * @description: 自定义井盖渲染组件
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
export default class HCircle extends Vue {
    // 经纬度
    @Prop({ type: Object, required: true })
    center!: API.Location;
    // 半径
    @Prop({ type: Number, required: true })
    radius!: number;
    // 是否可编辑
    @Prop(Boolean)
    editing?: boolean;
    // 圆样式 -> lineWidth, lineDash, lineDashOffset, fill, stroke, opacity
    // 参考 https://ecomfe.github.io/zrender-doc/public/api.html#zrenderdisplayable
    @Prop({ type: Object, default: () => ({ fill: 'rgba(0, 162, 255, 0.5)' }) })
    styles!: Dictionary<any>;
    // 圆为可编辑时，控制方块的大小
    @Prop({ type: Object, default: () => ({ width: 11, height: 11 }) })
    controlSize!: Size;

    i = i; // 判断当前的下标，数据不保存至内部，防止被劫持，影响性能
    insetCenter = this.center; // 内部维护中心点和半径以及外部控制点的坐标，以便编辑后重绘是最新的状态
    insetRadius = this.radius;
    r = 0;
    insideCoordinates: { x: number, y: number } | null = null;
    outsideCoordinates: { x: number, y: number } | null = null;
    events: string[] = []; // 需要绑定的事件
    isMouseDown = false; // 用来判断圆可编辑时，鼠标是否按下

    @Inject('parentInfo')
    parentInfo!: { size: Size, pixel: { x: number; y: number; }, getInstance: any, map: baiduMap['map']; BMap: baiduMap['BMap'] }; // getInstance 函数返回 ZRender 实例

    // 获取实例
    get instance() {
        return this.parentInfo.getInstance().instance;
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
        if (this.parentInfo.map) {
            this.showPoint();
            this.bindEvents();
        } else {
            this.parentInfo.$on('initialize', this.bindEvents);
        }
        this.parentInfo.$on('draw', this.showPoint);
    }
    beforeDestroy() {
        this.unbindEvents();
        this.destroyCanvas();
        this.parentInfo.$off('draw', this.showPoint);
    }

    // 中心点或半径发生改变时触发
    @Watch('center.lng')
    @Watch('center.lat')
    locationUpdate() {
        const { center: { lng, lat }} = this;
        this.insetCenter = { lng, lat };
        this.draw();
    }
    @Watch('radius')
    datumUpdate(val: number) {
        this.insetRadius = val;
        this.draw();
    }
    // 圆可编辑事件更新
    @Watch('editing')
    editingChange(val: boolean) {
        if (val) {
            this.bindEvents();
            this.draw();
        }
        else {
            this.unbindEvents();
            this.destroyControl();
        }
    }

    // 外部调用获取中心点与半径
    getCircleInfo() {
        const { insetCenter, insetRadius } = this;
        return { center: insetCenter, radius: insetRadius };
    }
    // 外部调用获取半径
    getRadius() {
        const { insetRadius } = this;
        return insetRadius;
    }
    // 外部调用获取中心点
    getCenter() {
        const { insetCenter } = this;
        return insetCenter;
    }
    // 获取圆形的 Bounds 范围
    getBounds() {
        const { parentInfo: { BMap, map }, insetCenter, r } = this;
        if (!(BMap && map)) return null;
        const px = map.pointToPixel(insetCenter);
        const sw = map.pixelToPoint(new BMap.Pixel(px.x - r, px.y + r));
        const ne = map.pixelToPoint(new BMap.Pixel(px.x + r, px.y - r));
        return new BMap.Bounds(sw, ne);
    }
    // 为可编辑圆绑定事件
    bindEvents() {
        const { editing, parentInfo: { BMap }, insetCenter: { lng, lat }} = this;
        this.insetCenter = new BMap.Point(lng, lat);
        if (!editing) return;
        this.instance.on('mousemove', this.setStatus);
        this.instance.on('mouseup', this.setStatus);
    }
    // 为可编辑圆绑定事件
    unbindEvents() {
        this.instance.off('mousemove', this.setStatus);
        this.instance.off('mouseup', this.setStatus);
    }
    // 设置
    setStatus(ev: ZRender['event']) {
        switch (ev.type) {
            case 'mousemove':
                this.isMouseDown && ev.stop();
                break;
            case 'mouseup':
                this.isMouseDown = false;
                break;
            default:
                break;
        }
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
    // // 重置 instanceInfo 数据
    // reset() {
    //     const { i } = this;
    //     if (instanceInfo[i]) {
    //         const { points } = instanceInfo[i];
    //         points.clear();
    //     }
    // }
    // 清空画布
    clearCanvas() {
        const { i } = this;
        if (instanceInfo[i]) {
            const { points } = instanceInfo[i];
            points.has('circle') && this.instance.remove(points.get('circle'));
            points.has('control') && points.get('control').some((v: any) => this.instance.remove(v));
        }
    }
    //显示标点
    showPoint() {
        const { parentInfo: { map, BMap, pixel }, insetCenter: { lng, lat }, insetRadius } = this;
        const point = new BMap.Point(lng, lat);
        const edgePoint = this.getRadiusPoint(Number(lng), Number(lat), insetRadius);
        const px = map.pointToOverlayPixel(point);
        const edgePx = map.pointToOverlayPixel(edgePoint);
        const r = Math.abs(px.y - edgePx.y);
        this.r = r;
        this.genPoint(Math.floor(px.x - pixel.x), Math.floor(px.y - pixel.y), r);
    }
    // 获取半径所对应的经纬度
    getRadiusPoint(lng: number, lat: number, radius: number) {
        const { parentInfo: { BMap }} = this;
        let c = [];
        let d = radius / 6378800;
        let e = Math.PI / 180 * lat;
        let f = Math.PI / 180 * lng;
        let g = 0;
        for (; 360 > g; g += 9) {
            const i = Math.PI / 180 * g;
            let k = Math.asin(Math.sin(e) * Math.cos(d) + Math.cos(e) * Math.sin(d) * Math.cos(i));
            const point = new BMap.Point(((f - Math.atan2(Math.sin(i) * Math.sin(d) * Math.cos(e), Math.cos(d) - Math.sin(e) * Math.sin(k)) + Math.PI) % (2 * Math.PI) - Math.PI) * (180 / Math.PI), k * (180 / Math.PI));
            c.push(point);
        }
        return c[0];
    }
    /**
     * @description: 生成标点
     * @param {Number} x: 坐标点 x
     * @param {Number} y: 坐标点 y
     * @param {Number} r: 半径
     */
    genPoint(x: number, y: number, r: number) {
        const { parentInfo: { size: { width, height }}, i, editing } = this;
        // 圆任意一个角在可视区内即渲染
        const LM = x - r; // 左中
        const RM = x + r; // 右中
        const TC = y - r; // 上中
        const BC = y + r; // 下中
        if (!instanceInfo[i] || RM <= 0 || BC <= 0 || LM >= width || TC >= height) {
            return;
        }
        const { points } = instanceInfo[i];
        // 生成实例
        const circle = this.genCircle(x, y, r);
        this.instance.add(circle);
        points.set('circle', circle);
        editing && this.genControl(x, y, r);
    }
    // 生成圆实例
    genCircle(cx: number, cy: number, r: number) {
        const { styles, events } = this;
        const circle = new ZRender.Circle({
            shape: { cx, cy, r },
            style: styles,
            z: 0,
        });
        this.insideCoordinates = { x: cx, y: cy };
        // 为圆绑定事件
        events.every(k => {
            circle.on(k, (ev: ZRender['event']) => this.$emit(k, ev));
            return true;
        });
        return circle;
    }
    // 生成控制按钮，圆为可编辑时
    genControl(x: number, y: number, r: number) {
        const { i, controlSize: { width, height }} = this;
        if (!instanceInfo[i]) return;
        const { points } = instanceInfo[i];
        const center = new ZRender.Rect({
            shape: {
                x: x - width / 2,
                y: y - height / 2,
                width,
                height,
            },
            style: { fill: 'white' },
            draggable: true,
            z: 100,
        })
            .on('mousedown', () => {
                this.isMouseDown = true;
            })
            .on('mousemove', (ev: ZRender['event']) => {
                if (this.isMouseDown) {
                    this.insetCenter = new this.parentInfo.BMap.Point();
                    this.updateCircle({ x1: ev.offsetX, y1: ev.offsetY }, ev);
                }
            });
        const _x = x + r;
        const _y = y;
        this.outsideCoordinates = { x: _x, y: _y };
        const edge = new ZRender.Rect({
            shape: {
                x: _x - width / 2,
                y: _y - height / 2,
                width,
                height,
            },
            style: { fill: 'white' },
            draggable: true,
            z: 100,
        })
            .on('mousedown', () => {
                this.isMouseDown = true;
            })
            .on('mousemove', (ev: ZRender['event']) => {
                if (this.isMouseDown) {
                    this.updateCircle({ x2: ev.offsetX, y2: ev.offsetY }, ev);
                }
            });
        this.instance.add(center);
        this.instance.add(edge);
        points.set('control', [center, edge]);
    }
    // 销毁控制按钮
    destroyControl() {
        const { i } = this;
        if (!instanceInfo[i]) return;
        const { points } = instanceInfo[i];
        const [inside, outside] = points.get('control');
        this.instance.remove(inside);
        this.instance.remove(outside);
    }
    /**
     * @description: 控制圆与外控制点的样式
     * @param {Object} site: 中心点与外部控制点的像素坐标，允许只传一个点的坐标
     */
    updateCircle(site: { x1?: number, y1?: number, x2?: number, y2?: number }, ev: ZRender['event']) {
        const { i, parentInfo: { map, BMap }, outsideCoordinates } = this;
        const { points } = instanceInfo[i];
        const circle = points.get('circle')!;
        const x1 = site.x1 !== undefined ? site.x1 : circle.shape.cx;
        const y1 = site.y1 !== undefined ? site.y1 : circle.shape.cy;
        const x2 = site.x2 !== undefined ? site.x2 : outsideCoordinates!.x;
        const y2 = site.y2 !== undefined ? site.y2 : outsideCoordinates!.y;
        const point1 = map.overlayPixelToPoint(new BMap.Pixel(x1, y1));
        const point2 = map.overlayPixelToPoint(new BMap.Pixel(x2, y2));
        // 计算两点之间的距离
        const r = Math.abs(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
        // 设置半径，中心点以及外部控制点的位置
        this.insetCenter = map.pixelToPoint(new BMap.Pixel(x1, y1));
        this.insetRadius = map.getDistance(point1, point2);
        this.r = r;
        site.x2 !== undefined && site.y2 !== undefined
            ? (this.outsideCoordinates = { x: x2, y: y2 })
            : this.insideCoordinates = { x: x1, y: y1 };

        circle.setShape({ cx: x1, cy: y1, r });
        this.$listeners.lineupdate && this.$emit('lineupdate', Object.assign(ev, { target: this }));
    }
}
</script>