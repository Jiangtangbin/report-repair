<template>
    <overlay @initialize="initialize" @draw="draw"></overlay>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import Overlay from '@/components/map/overlays/overlay.vue';
import ZRender from 'zrender';

type Datum = ({ lng: string; lat: string; } | { x: string; y: string; }) & { color?: string; radius?:number; speed?: number; [index: string]: string | number | undefined; };
type Ripple = { pixel: [number, number]; color: string; radius: number; speed: number; };

// render 实例，不放在 vue 实例里面，防止被劫持
let i = 0;
const zRenderInstance: Dictionary<{ instance: ZRender, ctx: any; position: Map<string, Ripple> }> = {};

/**
 * @description: 自定义波纹渲染组件 -> 用来渲染大批量波纹
 * 此组件不接收事件
 * color(颜色)，radius(半径)，speed(速度) 可由数据内部传递，也可由组件传递，优先数据内部配置
 */
@Component({
    components: {
        Overlay,
    },
})
export default class HWave extends Vue {
    // 数据源
    @Prop({ type: Array, default: () => ([]) })
    datum!: Datum[];
    // 偏移量
    @Prop({ type: Object, default: () => ({ width: 0, height: 0 }) })
    offset!: { width: number; height: number; };
    // 颜色值
    @Prop({ type: String, default: 'rgba(255, 0, 0, 0.5)' })
    color!: string;
    // 半径
    @Prop({ type: Number, default: 80 })
    radius!: number;
    // 速度
    @Prop({ type: Number, default: 3000 })
    speed!: number;
    // 经纬度转换成像素后，绝对值少于该间距值的不显示，防止间距过短，显示效果差的问题
    @Prop({ type: Number, default: 20 })
    space!: number;

    i = i; // 判断当前的下标，数据不保存至内部，防止被劫持，影响性能
    map: baiduMap['map'] | null = null;
    BMap: baiduMap['BMap'] | null = null;
    canvas: HTMLCanvasElement | null = null; // 绘制的 canvas 容器
    size: { width: number; height: number; } = { width: 0, height: 0 }; // 用来做边界判断，超出则不绘制
    pixel: { x: number; y: number; } = { x: 0, y: 0 }; // canvas 元素的 position 值

    created() {
        this.i = i;
        i++;
    }
    beforeDestroy() {
        this.destroyCanvas();
    }

    @Watch('radius')
    @Watch('datum')
    datumUpdate() {
        if (!this.map) return;
        this.showPoint(this.datum);
    }

    // 组件初始化方法
    initialize({ map, BMap }: baiduMap) {
        this.map = map;
        this.BMap = BMap;
        return this.genCanvas();
    }
    // 组件绘制方法
    draw() {
        const { map, BMap, datum } = this;
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        // 这两个值可能为 null
        if (!(sw && ne)) return;
        this.pixel = map.pointToOverlayPixel(new BMap.Point(sw.lng, ne.lat));
        if (datum.length > 0) {
            this.showPoint(datum);
        }
    }
    // 生成 canvas 实例
    genCanvas() {
        const { map, i } = this;
        const canvas = this.canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
        const size = this.size = map.getSize();
        canvas.width = size.width;
        canvas.height = size.height;
        map.getPanes().labelPane.appendChild(canvas);
        const instance = ZRender.init(canvas);
        const ctx = ZRender.util.getContext();
        zRenderInstance[i] = { instance, ctx, position: new Map() };
        return this.canvas;
    }
    // 销毁 canvas 实例
    destroyCanvas() {
        const { i } = this;
        if (zRenderInstance[i]) {
            let { instance } = zRenderInstance[i];
            this.clearCanvas();
            instance.dispose();
            delete zRenderInstance[i];
        }
        this.canvas = null;
    }
    //显示标点
    showPoint(datum: Datum[]) {
        const { map, BMap, pixel, i } = this;
        if (!zRenderInstance[i]) return;
        this.canvas!.style.left = pixel.x + 'px';
        this.canvas!.style.top = pixel.y + 'px';
        this.clearCanvas();
        datum.every((v, i) => {
            let x = v.x;
            let y = v.y;
            const isSite = Boolean(x && y);
            if (!isSite) {
                const point = new BMap.Point(v.lng, v.lat);
                const px = map.pointToOverlayPixel(point);
                x = Math.floor(px.x - pixel.x);
                y = Math.floor(px.y - pixel.y);
            }
            this.genSource(x, y, i, isSite);
            return true;
        });
        const { position, instance } = zRenderInstance[i];
        this.batchGenPoint(position, instance);
    }
    // 清空画布
    clearCanvas() {
        const { i } = this;
        if (zRenderInstance[i]) {
            const { instance, position } = zRenderInstance[i];
            instance.clear();
            position.clear();
        }
    }
    /**
     * @description: 生成标点
     * @param {Number} x: 坐标点 x
     * @param {Number} y: 坐标点 y
     * @param {Number} index: 当前点下标
     * @param {Boolean} uncalculating: 无需内部判断边界
     */
    genSource(x: number, y: number, index: number, uncalculating?: boolean) {
        const { size: { width, height }, i, datum, space } = this;
        if (!zRenderInstance[i]) return;
        const { color, radius, speed } = this.getCircleInfo(datum[index]);
        const { position } = zRenderInstance[i];
        if (
            !uncalculating &&
            // 计算是否处于边界内
            (x < 0 || y < 0 || x > width || y > height)
        ) {
            // 判断是否处于边界内，无需内部判断的话直接跳过
            return;
        }
        if (!uncalculating) {
            // 判断是否重合，无需内部判断的话直接跳过
            let isRepeat: boolean = position.has(`${x}${y}`);
            if (!isRepeat) {
                position.forEach(({ pixel: [oldX, oldY] }) => {
                    if (isRepeat) return;
                    (Math.abs(oldX - x) <= space && Math.abs(oldY - y) <= space) && (isRepeat = true);
                });
            }
            if (isRepeat) return;
        }
        position.set(`${x}${y}`, {
            pixel: [x, y],
            color,
            radius,
            speed,
            index,
        });
    }
    /**
     * @description: 批量生成标点
     * @param {Map} points: 需生成的标点数据
     * @param {ZRender} instance: ZRender 的实例
     */
    batchGenPoint(points, instance) {
        points.forEach(v => {
            this.genPoint(v, instance);
        });
    }
    /**
     * @description: 生成标点
     * @param {Object} option: 已保存的标点信息
     * @param {ZRender} instance: ZRender 的实例
     */
    genPoint(option: Ripple, instance: any) {
        const { offset } = this;
        const { pixel: [x, y], color, radius, speed } = option;
        const cx = x + offset.width;
        const cy = y + offset.height;
        // 波纹动画
        const circle = new ZRender.Circle({
            shape: { cx, cy, r: 0 },
            style: {
                fill: new ZRender.RadialGradient(0.5, 0.5, 0.5, [
                    {
                        offset: 0,
                        color: 'rgba(255, 255, 255, 0)',
                    },
                    {
                        offset: 0.8,
                        color: ZRender.color.modifyAlpha(color, 0.5),
                    },
                    {
                        offset: 1,
                        color,
                    },
                ]),
            },
            z: 5,
            silent: true,
        });
        circle.animate('shape', true)
            .when(speed, {
                r: radius,
            })
            .start();
        circle.animate('style', true)
            .when(speed, {
                opacity: 0,
            })
            .start();
        // 影子波纹
        const circle2 = new ZRender.Circle({
            shape: { cx, cy, r: 0 },
            style: {
                fill: new ZRender.RadialGradient(0.5, 0.5, 0.5, [
                    {
                        offset: 0,
                        color: 'rgba(255, 255, 255, 0)',
                    },
                    {
                        offset: 0.8,
                        color: ZRender.color.modifyAlpha(color, 0.5),
                    },
                    {
                        offset: 1,
                        color,
                    },
                ]),
            },
            z: 5,
            silent: true,
        });
        circle2.animate('shape', true)
            .when(speed, {
                r: radius,
            })
            .delay(1500)
            .start();
        circle2.animate('style', true)
            .when(speed, {
                opacity: 0,
            })
            .delay(1500)
            .start();

        instance.add(circle);
        instance.add(circle2);
    }
    // 获取圆信息
    getCircleInfo(data: Datum) {
        const { color, radius, speed } = this;
        return { color: data.color || color, radius: data.radius || radius, speed: data.speed || speed };
    }
}
</script>