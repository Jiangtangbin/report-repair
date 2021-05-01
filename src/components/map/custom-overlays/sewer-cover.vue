<script lang="ts">
import { Prop, Watch, Inject, Component, Vue } from 'vue-property-decorator';
import ZRender from 'zrender';
import { events } from '@/config/map';

type Datum = any;
type IconInfo = ({ image: string; originalSize: Size; size: Size; offset?: Size });
type Size = { width: number; height: number; };
type InstanceOption = { points: Map<string, PointOption>; };
type PointOption = { x: number; y: number; text: any; marker: any };

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
export default class HSewerCover extends Vue {
    // 数据源
    @Prop({ type: Array, default: () => ([]) })
    datum!: Datum[];
    // 返回图片，与图片大小和 offset 值
    @Prop({ type: Function, required: true })
    getIconInfo!: (data: Datum) => IconInfo;
    // 经纬度转换成像素后，绝对值少于该间距值的不显示，防止间距过短，显示效果差的问题
    @Prop({ type: Number, default: 0 })
    space!: number;
    // 显示在图片上的文字
    @Prop({ type: String, default: 'code' })
    showKey!: string;

    i = i; // 判断当前的下标，数据不保存至内部，防止被劫持，影响性能
    events: string[] = []; // 需要绑定的事件

    // getInstance 函数返回 ZRender 实例
    @Inject('parentInfo')
    parentInfo!: { size: Size, pixel: { x: number; y: number; }, getInstance: any, map: baiduMap['map']; BMap: baiduMap['BMap'] };

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
        this.parentInfo.map && this.showPoint();
        this.parentInfo.$on('draw', this.showPoint);
    }
    beforeDestroy() {
        this.destroyCanvas();
        this.parentInfo.$off('draw', this.showPoint);
    }

    @Watch('datum')
    datumUpdate() {
        this.draw();
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
            const { points } = instanceInfo[i];
            points.clear();
        }
    }
    // 清空画布
    clearCanvas() {
        const { i } = this;
        if (instanceInfo[i]) {
            const { points } = instanceInfo[i];
            points.forEach(v => {
                this.instance.remove(v.marker);
                v.text && this.instance.remove(v.text);
            });
        }
    }
    //显示标点
    showPoint() {
        const { parentInfo: { map, BMap, pixel }, datum } = this;
        this.reset();
        datum.every((v, i) => {
            const point = new BMap.Point(v.lng, v.lat);
            const px = map.pointToOverlayPixel(point);
            this.genPoint(Math.floor(px.x - pixel.x), Math.floor(px.y - pixel.y), i);
            return true;
        });
    }
    /**
     * @description: 生成标点
     * @param {Number} x: 坐标点 x
     * @param {Number} y: 坐标点 y
     * @param {Number} index: 当前点下标
     */
    genPoint(x: number, y: number, index: number) {
        const { parentInfo: { size: { width, height }}, i, space, datum } = this;
        if (!instanceInfo[i] || x < 0 || y < 0 || x > width || y > height) {
            return;
        }
        const { points } = instanceInfo[i];
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const repeatObj = points.get(`${x}${y}`) ||
            [...points].find(([k, pixel]) => (Math.abs(pixel.x - x) <= space && Math.abs(pixel.y - y) <= space));
        /* eslint-enable @typescript-eslint/no-unused-vars */
        // 存在重合时不再渲染
        if (repeatObj) {
            return;
        }
        const iconInfo = this.genIconInfo(datum[index]);
        const marker = this.genMarker(x, y, index, iconInfo);
        const text = this.genText(x, y, index, iconInfo);
        this.instance.add(marker);
        text && this.instance.add(text);
        points.set(`${x}${y}`, { x, y, marker, text });
    }
    // 生成 marker 实例
    genMarker(x: number, y: number, index: number, { offset, originalSize, size, image }: Required<IconInfo>) {
        const { events, datum } = this;
        const img = new ZRender.Image({
            style: {
                image,
                x: x - size.width / 2 - Math.abs(offset.width || 0),
                y: y - size.height - Math.abs(offset.height || 0),
                ...originalSize,
            },
            z: 8,
        });
        // 为图片绑定事件
        events.every(k => {
            img.on(k, (ev: ZRender['event']) => this.$emit(k, datum[index], index, ev));
            return true;
        });
        const clipPath = new ZRender.Rect({ shape: { x: x - size.width / 2, y: y - size.height, ...size }});
        img.setClipPath(clipPath);
        return img;
    }
    // 生成图片信息与 offset 值
    genIconInfo(data: Datum): Required<IconInfo> {
        const o = this.getIconInfo(data);
        return { offset: { width: 0, height: 0 }, ...o };
    }
    // 生成井盖编号
    genText(x: number, y: number, index: number, { size }: Required<IconInfo>) {
        const { datum, showKey } = this;
        return isNaN(datum[index][showKey])
            ? null
            : new ZRender.Rect({
                shape: { x: x - size.width / 2, y: y - size.height, ...size },
                style: {
                    text: datum[index][showKey],
                    textFill: 'white',
                    textOffset: [0, -2],
                    fill: null,
                },
                silent: true,
                z: 9,
            });
    }
}
</script>