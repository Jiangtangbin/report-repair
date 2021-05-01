<script lang="ts">
import { Prop, Watch, Inject, Component, Vue } from 'vue-property-decorator';
import ZRender from 'zrender';
import { events } from '@/config/map';
import calcWorker from '@/workers/marker.worker';
import { run } from '@/utils/worker';

type Datum = any;
type IconInfo = ({ image: string; originalSize: Size; size: Size; offset?: Size });
type Size = { width: number; height: number; };
type Intersection = { minX: number; minY: number; maxX: number; maxY: number; instance: any };
type InstanceOption = { points: Map<string, PointOption>; numeric: Map<string, NumericOption>; labels: Map<string, { instance: any; }> };
type PointOption = { x: number; y: number; index: number; iconInfo: Required<IconInfo>; instance: any };
type NumericOption = { indexs: number[]; x: number; y: number; instance: any; } & Size;
type ShowMarker = { index: number; lng?: string | number; lat?: string | number; };

// 需要保存的数据，不放 data 里，防止被劫持
let i = 0;
const instanceInfo: Dictionary<InstanceOption> = {};
const BUBBLE_SHOW_MARKER = 'showMarker';
const hasWorker = !!window.Worker;

/**
 * @description: 自定义 marker 渲染组件 -> 用来渲染大批量数量
 * 触发事件 events
 * $emit(event, data, i, event) 只能触发 ZRender 提供的事件
 * @param {Datum} data: 提供的参数
 * @param {Number} i: 该标点的下标
 * @param {ZRender.event} event: ZRender 包装后的 event 对象
 * $emit('clickNumber', datum, index) 点击重复数字时触发
 * @param {Datum[]} datum: 重复的标点信息集合
 * @param {Array} index: 重复的标点下标
 * @param {ZRender.event} event: ZRender 包装后的 event 对象
 * $emit(BUBBLE_SHOW_MARKER, datum) 显示的标点
 * @param {ShowMarker[]} datum: 显示的标点, 重复标点提供了重复经纬度
 */
@Component({
    /* eslint-disable no-empty-function */
    render() {},
    /* eslint-enable no-empty-function */
})
export default class HMarker extends Vue {
    // 数据源
    @Prop({ type: Array, default: () => ([]) })
    datum!: Datum[];
    // 返回图片，与图片大小和 offset 值
    @Prop({ type: Function, required: true })
    getIconInfo!: (data: Datum) => IconInfo;
    // 经纬度转换成像素后，绝对值少于该间距值的不显示，防止间距过短，显示效果差的问题
    @Prop({ type: Number, default: 10 })
    space!: number;
    // 是否显示 label
    @Prop(Boolean)
    label?: boolean;
    // label 为真时，显示的字段
    @Prop({ type: String, default: 'title' })
    showKey!: string;
    // 图片定位的位置（顶部，中心点或底部）
    @Prop({ type: String, default: 'bottom' })
    y!: 'top' | 'center' | 'bottom';
    // 提示的组件 id
    @Prop({ type: Number, default: 30000 })
    threshold!: number;
    // 提示的组件 id
    @Prop({ type: String, default: 'notice' })
    noticeId!: number | string;
    // 提示信息
    @Prop({ type: String, default: 'h.tips.pointCalc' })
    noticeContent!: string;

    i = i; // 判断当前的下标，数据不保存至内部，防止被劫持，影响性能
    events: string[] = []; // 需要绑定的事件
    workStop: (() => void) | null = null;
    noticeInstance = false;

    // getInstance 函数返回 ZRender 实例
    @Inject('parentInfo')
    parentInfo!: { size: Size, pixel: { x: number; y: number; }, getInstance: any, map: baiduMap['map']; BMap: baiduMap['BMap'] }; 

    // 获取实例
    get instance() {
        return this.parentInfo.getInstance().instance;
    }
    // 获取提示 Name
    get finalNoticeId() {
        const { noticeId, i } = this;
        return `${noticeId}-${i}`;
    }
    // 是否启用 worker 优化
    get enWorker(): boolean {
        const { threshold, datum } = this;
        return hasWorker && datum.length > threshold;
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
        instanceInfo[this.i] = { points: new Map(), numeric: new Map(), labels: new Map() };
        // 初始存在 map 对象，则地图已渲染，且进行一次绘制
        this.parentInfo.map && this.showPoint();
        this.parentInfo.$on('draw', this.showPoint);
    }
    beforeDestroy() {
        this.destroyCanvas();
        this.workStop && this.workStop();
        this.toggleNotice(false);
        this.parentInfo.$off('draw', this.showPoint);
    }

    // 数据发生改变时，重绘标点
    @Watch('datum')
    datumUpdate() {
        this.draw();
    }
    // label 发生改变时重回 label
    @Watch('label')
    labelChange(val?: boolean) {
        const { i } = this;
        if (!instanceInfo[i]) return;
        const { labels, points } = instanceInfo[i];
        labels.forEach(v => this.instance.remove(v.instance));
        labels.clear();
        val && points.forEach(v => {
            this.genLabel(v);
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
    // 重置 instanceInfo 数据
    reset() {
        const { i } = this;
        if (instanceInfo[i]) {
            const { points, numeric, labels } = instanceInfo[i];
            points.clear();
            numeric.clear();
            labels.clear();
        }
    }
    // 清空画布
    clearCanvas() {
        const { i } = this;
        if (instanceInfo[i]) {
            const { points, numeric, labels } = instanceInfo[i];
            points.forEach(v => this.instance.remove(v.instance));
            numeric.forEach(v => this.instance.remove(v.instance));
            labels.forEach(v => this.instance.remove(v.instance));
        }
    }
    //显示标点
    showPoint() {
        const {
            parentInfo: { map, BMap, pixel, size: { width, height }},
            datum,
            space,
            i,
            label,
            enWorker,
        } = this;
        if (!instanceInfo[i]) return;
        this.reset();
        const wholeDatum = datum.map((v, index) => {
            const point = new BMap.Point(v.lng, v.lat);
            const px = map.pointToOverlayPixel(point);
            return {
                x: Math.floor(px.x - pixel.x),
                y: Math.floor(px.y - pixel.y),
                index,
                space,
                width,
                height,
                iconInfo: this.genIconInfo(datum[index]),
            };
        });
        this.workStop && this.workStop();
        if (enWorker) {
            const result = run(calcWorker, wholeDatum);
            this.workStop = result.worker.stop;
            this.toggleNotice(true);
            // 清空报警圈
            this.bubbleShowMarkers();
            result
                .then(({ numeric, points }) => {
                    Object.assign(instanceInfo[i], {
                        points,
                        numeric,
                    });
                    this.batchGenPoint(points, label);
                    this.batchGenNumeric(numeric);
                    this.bubbleShowMarkers();

                    this.toggleNotice(false);
                })
                .catch(() => {
                    this.toggleNotice(false);
                });
        } else {
            // 防止增加条件后，处于阈值以下时，提示不消失
            this.toggleNotice(false);
            const { numeric, points } = calcWorker(wholeDatum);
            Object.assign(instanceInfo[i], {
                points,
                numeric,
            });
            this.batchGenPoint(points, label);
            this.batchGenNumeric(numeric);
            this.bubbleShowMarkers();
        }
    }
    /**
     * @description: 批量生成标点
     * @param {Map} points: 需生成的标点数据
     * @param {Boolean} label: 是否需要生成 label
     */
    batchGenPoint(points: InstanceOption['points'], label?: boolean) {
        points.forEach((v) => {
            this.genPoint(v);
            label && this.genLabel(v);
        });
    }
    /**
     * @description: 批量生成标点上方的数字
     * @param {Map} data: 需生成的标点数据
     */
    batchGenNumeric(points: InstanceOption['numeric']) {
        points.forEach((v) => {
            this.genNumeric(v);
        });
    }
    /**
     * @description: 生成标点
     * @param {Object} option: 保存的标点信息
     */
    genPoint(option: PointOption) {
        const { x, y, iconInfo, index } = option;
        const marker = this.genMarker(x, y, index, iconInfo);

        this.instance.add(marker);
        option.instance = marker;
    }
    // 生成 marker 实例
    genMarker(x: number, y: number, index: number, { offset, originalSize, size, image }: Required<IconInfo>) {
        const { events, datum } = this;
        let img = new ZRender.Image({
            style: {
                image,
                x: x - size.width / 2 - Math.abs(offset.width || 0),
                y: y - this.getYSite(size.height) - Math.abs(offset.height || 0),
                ...originalSize,
            },
            z: 10,
            draggable: false,
        });
        // 为图片绑定事件
        events.every(k => {
            img.on(k, (ev: ZRender['event']) => {
                if (ev.event.type === 'mousedown') {
                    if (datum[index].dragging) {
                        img.draggable = datum[index].dragging; // 在这里添加允许拖拽，就不用刷新这个 marker 了
                        ev.stop();
                    }
                }
                this.$emit(k, datum[index], datum[index].field, ev);
            });
            return true;
        });
        const clipPath = new ZRender.Rect({
            shape: { x: x - size.width / 2, y: y - this.getYSite(size.height), ...size },
        });
        img.setClipPath(clipPath);
        return img;
    }
    // 生成图片信息与 offset 值
    genIconInfo(data: Datum): Required<IconInfo> {
        const o = this.getIconInfo(data);
        return { offset: { width: 0, height: 0 }, ...o };
    }
    /**
     * @description: 生成重复 marker 的数字
     * @param {PointOption} option: 重复标点数据
     */
    genNumeric(option: NumericOption) {
        const { datum } = this;
        const { x, y, width, height, indexs } = option;
        // 由于 x 不是初始的坐标(改为了图标中心点, 产生了位移)，所有 x 要减等于 width / 2;
        const rect = new ZRender.Rect({
            shape: { x: x - width / 2, y: y - height - 20, width, height: 20 },
            style: {
                text: indexs.length,
                textFill: 'white',
                textBackgroundColor: 'rgba(41, 70, 144, 0.5)',
                textPadding: 6,
                textBorderRadius: 34,
                fill: 'rgba(0, 0, 0, 0)',
            },
            z: 11,
        });
        this.$listeners.hasOwnProperty('clickNumber') &&
            rect.on('click', (ev: ZRender['event']) => this.$emit('clickNumber', indexs.map(i => datum[i]), indexs[0], ev));

        this.instance.add(rect);
        option.instance = rect;
    }
    /**
     * @description: 生成 label，基于渲染的标点生成，无需做边界判断
     * @param {Object} option: 保存的标点信息
     */
    genLabel(option: PointOption) {
        const { i, showKey, datum } = this;
        const { x, y, index, iconInfo: { size }} = option;
        const { labels } = instanceInfo[i];
        const text = datum[index][showKey];
        if (!text) return;
        const rect = new ZRender.Rect({
            shape: { x: x - size.width / 2, y: y - this.getYSite(size.height), ...size },
            style: {
                text,
                textFill: 'white',
                textPosition: 'right',
                textBackgroundColor: 'rgba(41, 70, 144, 0.5)',
                textBorderRadius: 5,
                textPadding: [4, 10],
                textBorderColor: 'rgba(0, 204, 255, 0.3)',
                textBorderWidth: 1,
                fill: null,
            },
            silent: true,
            z: 20,
        });
        this.instance.add(rect);
        labels.set(`${x}${y}`, { instance: rect });
    }
    /**
     * @description: 获取图标垂直显示的位置
     * @param {Number} num: 图片大小
     */
    getYSite(num: number) {
        const { y } = this;
        return y === 'bottom'
            ? num
            : y === 'center'
                ? num / 2
                : 0;
    }
    /**
     * @description: 触发父级，返回显示的标点
     */
    bubbleShowMarkers() {
        const { $listeners, i } = this;
        if ($listeners.hasOwnProperty(BUBBLE_SHOW_MARKER) && instanceInfo[i]) {
            const { numeric, points } = instanceInfo[i];
            this.$emit(BUBBLE_SHOW_MARKER, numeric, points);
        }
    }
    /**
     * @description: 生成提示组件
     * @param {Boolean} status: 打开(关闭)提示组件
     */
    toggleNotice(status = true) {
        const { noticeInstance, finalNoticeId, noticeContent } = this;
        if (status === noticeInstance) return;

        this.noticeInstance = status;
        if (status) {
            this.$Notice.info({
                name: finalNoticeId,
                title: this.$te(noticeContent) ? this.$t(noticeContent) as string : noticeContent,
                duration: 0,
                onClose: () => {
                    this.noticeInstance = false;
                },
            });
        }
        else {
            this.$Notice.close(finalNoticeId);
        }
    }
}
</script>