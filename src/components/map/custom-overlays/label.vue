<template>
    <overlay @initialize="initialize" @draw="draw"></overlay>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import Overlay from '@/components/map/overlays/overlay.vue';
import ZRender from 'zrender';

type Datum = { lng: string; lat: string; color?: string; radius?:number; speed?: number; [index: string]: string | number | undefined; };

// render 实例，不放在 vue 实例里面，防止被劫持
let i = 0;
const zRenderInstance: Dictionary<{ instance: ZRender, ctx: any; points: Map<number | string, any>; position: Map<string, [number, number]> }> = {};

/**
 * @description: 标点的 label 组件
 * 此组件不接收事件
 * color(颜色)，radius(半径)，speed(速度) 可由数据内部传递，也可由组件传递，优先
 */
@Component({
    components: {
        Overlay,
    },
})
export default class HLabel extends Vue {
    // 数据源 -> 需要包含 lng, lat 以及指定的显示 key 字段
    @Prop({ type: Array, default: () => ([]) })
    datum!: Datum[];
    // 显示的 title 字段
    @Prop({ type: String, default: 'title' })
    showKey!: string;

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
        canvas.style.cssText = 'position:absolute;left:0;top:0;';
        const size = this.size = map.getSize();
        canvas.width = size.width;
        canvas.height = size.height;
        map.getPanes().labelPane.appendChild(canvas);
        const instance = ZRender.init(canvas);
        const ctx = ZRender.util.getContext();
        zRenderInstance[i] = { instance, ctx, points: new Map(), position: new Map() };
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
        const { map, BMap, pixel } = this;
        this.canvas!.style.left = pixel.x + 'px';
        this.canvas!.style.top = pixel.y + 'px';
        this.clearCanvas();
        datum.every((v, i) => {
            const point = new BMap.Point(v.lng, v.lat);
            const px = map.pointToOverlayPixel(point);
            this.genPoint(Math.floor(px.x - pixel.x), Math.floor(px.y - pixel.y), this.getText(v), i);
            return true;
        });
    }
    // 清空画布
    clearCanvas() {
        const { size: { width, height }, i } = this;
        if (zRenderInstance[i]) {
            const { ctx, instance, points, position } = zRenderInstance[i];
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';
            points.forEach(v => instance.remove(v.stopAnimation()));
            points.clear();
            position.clear();
        }
    }
    /**
     * @description: 生成标点
     * @param {Number} x: 坐标点 x
     * @param {Number} y: 坐标点 y
     * @param {String} title: 显示的文字
     * @param {Number} index: 当前点下标
     */
    genPoint(x: number, y: number, title: string, index: number) {
        const { size: { width, height }, i } = this;
        if (!zRenderInstance[i] || !title || x < 0 || y < 0 || x > width || y > height) {
            return;
        }
        const { instance, points, ctx } = zRenderInstance[i];
        const w = ctx.measureText(title).width;
        const h = parseInt(ctx.font, 10) * 1.1;
        console.log(ctx.font, w, h);
        if (!title) return;
        // 文字
        const text = new ZRender.Rect({
            shape: {
                r: [2],
                x: x - w / 2,
                y: y - h / 2,
                width: w,
                height: h,
            },
            style: {
                text: title,
                textFill: 'pink',
                fill: 'black',
                textPosition: 'left',
            },
        });
        const sss = new ZRender.Circle({
            shape: {
                cx: x,
                cy: y,
                r: 5,
            },
            style: {
                fill: 'violet',
            },
        });
        instance.add(text);
        instance.add(sss);
        points.set(`${x}${y}-${index}`, text);
    }
    // 获取圆信息
    getText(data: Datum) {
        const { showKey } = this;
        return data[showKey];
    }
}
</script>