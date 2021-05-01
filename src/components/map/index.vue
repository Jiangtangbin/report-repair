<template>
    <baidu-map v-bind="attrs" v-on="$listeners" :ak="ak" class="bm-outer">
        <slot />
        <bm-view class="bm-view"><slot name="outside" /></bm-view>
    </baidu-map>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaiduMap from 'vue-baidu-map/components/map/Map.vue';
import BmView from 'vue-baidu-map/components/map/MapView.vue';
import { BMapAk as ak } from '@/config/index';

@Component({
    inheritAttrs: false,
    components: {
        BaiduMap,
        BmView,
    },
})
export default class BMap extends Vue {
    private ak = ak;

    get attrs() {
        return { ...this.$attrs, scrollWheelZoom: true, continuousZoom: true, mapClick: false };
    }
}
</script>

<style scoped lang="scss">
    .bm-outer {
        width: 100%; height: 100%;
        flex: auto;
        position: relative;
        .bm-view {
            width: 100%; height: 100%;
            min-height: inherit; max-height: inherit;
            flex: auto;
            @include utils-pierce(anchorBL) {
                display: none;
            }
        }
    }
</style>