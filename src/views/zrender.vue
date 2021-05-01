<template>
    <div class="zrender">
        <canvas class="mspaint" width="1348" height="968" ref="mspaint" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ZRender from 'zrender';

@Component({
    components: {
    },
})
export default class ZRenderPage extends Vue {
    $refs!: {
        mspaint: HTMLElement;
    }

    instance: ZRender | null = null;
    ctx: any = null;

    created() {
        this.$nextTick(() => {
            this.instance = ZRender.init(this.$refs.mspaint);
            const ctx = this.$refs.mspaint.getContext('2d');
            if (ctx) {
                const originFill = ctx.fill;
                ctx.fill = function fill() {
                    originFill.call(this, 'evenodd');
                };
            }
            this.ctx = ZRender.util.getContext();
            this.drawPolygon();
            this.drawPolyline();
        });
    }

    drawPolygon() {
        if (!this.instance) return;
        const pol = new ZRender.Polygon({
            draggable: true,
            shape: {
                points: [[335, 92], [395, 654], [131, 368], [437, 262], [479, 696], [307, 442], [335, 92]],
            },
            style: {
                stroke: 'green',
                fill: 'pink',
            },
        });
        this.instance.add(pol);
    }
    drawPolyline() {
        if (!this.instance) return;
        const pol = new ZRender.Polyline({
            draggable: true,
            shape: {
                points: [[825, 92], [885, 654], [621, 368], [927, 262], [969, 696], [797, 442], [825, 92]],
            },
            style: {
                stroke: 'green',
                fill: 'pink',
            },
        });
        this.instance.add(pol);
    }
}
</script>

<style scoped lang="scss">
    .zrender {
        width: 100vw;
        height: 100vh;
    }
</style>