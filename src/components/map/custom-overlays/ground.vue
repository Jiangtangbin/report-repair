<template>
    <overlay @initialize="initialize" @draw="draw"></overlay>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import Overlay from '@/components/map/overlays/overlay.vue';

type Bounds = { sw: { lng: number; lat: number; }, ne: { lng: number; lat: number; } };

// 自定义 ground 组件
@Component({
    components: {
        Overlay,
    },
})
export default class HGround extends Vue {
    /**
     * 百度容器列表 -> 层级看后面的数值
     * floatPane: 信息窗口内容层 800
     * floatShadow: 信息窗口阴影层 600
     * markerPane: 标注层 400
     * markerMouseTarget: 标注点击区域层 700
     * labelPane: 文本标注层 500
     * mapPane: 矢量图层 200 -> 该层为最低，会被一张无层级的 svg 给覆盖，需自己重置层级
     */
    @Prop({ type: String, default: 'mapPane' })
    pane!: baiduMap['Pane'];
    // 图片显示的范围
    @Prop({ type: Object, required: true })
    bounds!: Bounds;
    // 图片地址
    @Prop({ type: String, default: '' })
    imageURL!: string;

    canvas: HTMLElement | null = null;
    img: ImageElement | null = null;

    beforeDestroy() {
        this.destroyCanvas();
    }

    @Watch('imageURL')
    imageChange(val: string) {
        if (!this.img) return;
        this.img.setAttribute('src', val);
    }

    // 组件初始化方法
    initialize({ map, BMap }: baiduMap) {
        this.map = map;
        this.BMap = BMap;
        return this.genCanvas();
    }
    // 组件绘制方法
    draw() {
        const { map, BMap, bounds: { sw, ne }} = this;
        const swPixel = map.pointToOverlayPixel(new BMap.Point(sw.lng, sw.lat));
        const nePixel = map.pointToOverlayPixel(new BMap.Point(ne.lng, ne.lat));
        const pixel = this.pixel = map.pointToOverlayPixel(new BMap.Point(sw.lng, ne.lat));
        // 设置宽高度
        this.canvas!.style.width = `${nePixel.x - swPixel.x}px`;
        this.canvas!.style.height = `${swPixel.y - nePixel.y}px`;
        // 设置定位
        this.canvas!.style.left = `${pixel.x}px`;
        this.canvas!.style.top = `${pixel.y}px`;
    }
    // 生成 canvas 实例
    genCanvas() {
        const { map, imageURL, pane } = this;
        const canvas = this.canvas = document.createElement('div');
        canvas.style.cssText = `position: absolute; left: 0; top: 0; width: 0; height: 0;`;
        const img = this.img = document.createElement('img');
        img.src = imageURL;
        img.style.cssText = 'width: 100%;';
        canvas.appendChild(img);
        map.getPanes()[pane].appendChild(canvas);
        return canvas;
    }
    // 销毁 canvas 实例
    destroyCanvas() {
        this.canvas = this.img = null;
    }
}
</script>