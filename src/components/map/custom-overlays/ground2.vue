<template>
    <overlay @initialize="initialize"></overlay>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import Overlay from '@/components/map/overlays/overlay.vue';
import { userModule } from '../../../store';

const range = {
    3: 0.1,
    4: 0.2,
    5: 0.3,
    6: 0.4,
    7: 0.5,
    8: 0.6,
    9: 0.7,
    10: 0.8,
    11: 0.9,
    12: 1,
    13: 1.1,
    14: 1.2,
    15: 1.3,
    16: 1.4,
    17: 1.5,
    18: 1.6,
    19: 1.7,
};

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
    // 中心点
    @Prop({ type: Object, required: true })
    position!: { lng: string; lat: string; };
    // 图片显示的范围
    @Prop({ type: Object, default: () => range })
    scale!: typeof range;
    // 图片地址
    @Prop({ type: String, default: '' })
    imageURL!: string;

    canvas: HTMLElement | null = null;
    img: ImageElement | null = null;
    groundOverlayOptions = {         
        opacity: 0.8, // 设置图层透明度
        displayOnMinLevel: 10, // 设置图层显示的最小级别
        displayOnMaxLevel: 14, // 设置图层显示的最大级别
    }

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
        const dom =  this.genCanvas();
        this.autoScale();
        this.setImgScale();
        return dom;
    }
    // 生成 canvas 实例
    genCanvas() {
        const { map, imageURL, pane } = this;
        const canvas = this.canvas = document.createElement('div');
        canvas.style.cssText = `position:absolute;left:0;top:0;width:0;height:0;`;
        const img = this.img = document.createElement('img');
        img.src = imageURL;
        canvas.appendChild(img);
        map.getPanes()[pane].appendChild(canvas);
        return canvas;
    }
    // 自动缩放图片
    autoScale() {
        const { map } = this;
        if (!map) return;
        map.addEventListener('zoomend', this.setImgScale);
    }
    // 设置图片的缩放
    setImgScale() {
        const { scale } = this;
        if (!(this.map && this.img)) return;
        const zoom = this.map.getZoom();
        const ratio = scale[zoom];
        let parentWidth = this.$parent.$el.offsetWidth;
        let parentHeight = this.$parent.$el.offsetHeight;
        if (this.img.width && this.img.height) {
            let left = (parentWidth - this.img.width) / 2;
            let top = (parentHeight - this.img.height) / 2;
            this.img.style.transform = `translate(${left}px, ${top}px) scale(${ratio})`;
        } else {
            // 进入页面恢复上一次 zoom 时，会导致 img 不存在，延迟执行
            setTimeout(() => {
                let left = (parentWidth - this.img.width) / 2;
                let top = (parentHeight - this.img.height) / 2;
                this.img.style.transform = `translate(${left}px, ${top}px) scale(${ratio})`;
            }, 200);
        }
    }
    // 销毁 canvas 实例
    destroyCanvas() {
        this.canvas = this.img = null;
        this.map && this.map.removeEventListener('zoomend', this.setImgScale);
    }
}
</script>