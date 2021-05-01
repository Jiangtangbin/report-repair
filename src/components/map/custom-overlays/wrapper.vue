<template>
    <overlay @initialize="initialize" @draw="draw">
        <slot />
    </overlay>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import Overlay from '@/components/map/overlays/overlay.vue';
import ZRender from 'zrender';

type Datum = { lng: string; lat: string; color?: string; radius?:number; speed?: number; [index: string]: string | number | undefined; };

// render 实例，不放在 vue 实例里面，防止被劫持
let i = 0;
const zRenderInstance: Dictionary<{ instance: ZRender, ctx: any; }> = {};

/**
 * @description: 自定义标点等需要响应事件的组件容器
 * 此组件不接收事件
 */
@Component({
    components: {
        Overlay,
    },
    provide() {
        return { parentInfo: this };
    },
})
export default class HWrapper extends Vue {
    /**
     * 百度容器列表 -> 层级看后面的数值
     * floatPane: 信息窗口内容层 800
     * floatShadow: 信息窗口阴影层 600
     * markerPane: 标注层 400
     * markerMouseTarget: 标注点击区域层 700
     * labelPane: 文本标注层 500
     * mapPane: 矢量图层 200 -> 该层为最低, 会被一张无层级的 svg 给覆盖, 需自己重置层级
     */
    @Prop({ type: String, default: 'labelPane' })
    pane!: baiduMap['Pane'];
    @Prop({ type: [Number, String], default: 2 })
    zIndex!: string | number;

    i = i; // 判断当前的下标，数据不保存至内部，防止被劫持，影响性能
    map: baiduMap['map'] | null = null;
    BMap: baiduMap['BMap'] | null = null;
    canvas: HTMLCanvasElement | null = null; // 绘制的 canvas 容器
    size: { width: number; height: number; } = { width: 0, height: 0 }; // 用来做边界判断,超出则不绘制
    pixel: { x: number; y: number; } = { x: 0, y: 0 }; // canvas 元素的 position 值

    created() {
        this.i = i;
        i++;
    }

    // 获取 ZRender 实例
    getInstance() {
        return zRenderInstance[this.i];
    }
    // 组件初始化方法
    initialize({ map, BMap }: baiduMap) {
        this.map = map;
        this.BMap = BMap;
        const canvas = this.genCanvas();
        setTimeout(() => {
            const size = this.size = map.getSize();
            canvas.width = size.width;
            canvas.height = size.height;
            this.$emit('initialize');
        });
        return canvas;
    }
    // 组件绘制方法
    draw() {
        const { map, BMap } = this;
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        // 这两个值可能为 null
        if (!(sw && ne)) return;
        const pixel = this.pixel = map.pointToOverlayPixel(new BMap.Point(sw.lng, ne.lat));
        this.clearCanvas();
        this.canvas!.style.left = pixel.x + 'px';
        this.canvas!.style.top = pixel.y + 'px';
        this.$emit('draw');
    }
    // 生成 canvas 实例
    genCanvas() {
        const { map, pane, zIndex, i } = this;
        const canvas = this.canvas = document.createElement('canvas');
        canvas.style.cssText = `position:absolute;left:0;top:0;z-index:${zIndex};`;
        // 调整 fill 规则，增加奇偶空心效果
        const originCtx = canvas.getContext('2d');
        if (originCtx) {
            const originFill = originCtx.fill;
            originCtx.fill = function fill() {
                originFill.call(this, 'evenodd');
            };
        }
        const size = this.size = map.getSize();
        canvas.width = size.width;
        canvas.height = size.height;
        map.getPanes()[pane].appendChild(canvas);
        const instance = ZRender.init(canvas);
        const ctx = ZRender.util.getContext();
        zRenderInstance[i] = { instance, ctx };
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
    // 清空画布
    clearCanvas() {
        const { i } = this;
        if (zRenderInstance[i]) {
            const { instance } = zRenderInstance[i];
            instance.clear();
        }
    }
}
</script>