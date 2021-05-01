<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || hide()"
        @on-ok="ok"
        :footer-hide="readonly"
        :title="`${readonly ? $t('h.modal.watch') : $t('h.modal.get')}${$t('h.modal.titles.location')}`"
        width="780px"
        class="modal-location-wrapper"
    >
        <map-search
            v-show="!getImg"
            :keyword.sync="keyword"
            class="modal-location-search"
            :placeholder="$t('h.placeholder.pleaseEnterSearchAddress')"
        />
        <bm-map @ready="onReady" @click="handle" :center="isSlot ? center : {}" :mapStyle="mapStyle" :zoom="zoom" class="bm-map" ref="maps">
             <div v-show="keyword && !getImg" class="bm-local-search" :style="localSearchStyle">
                <h3 class="bm-local-search-title">{{$t('h.modal.searchResult')}}</h3>
                <local-search :keyword="keyword" class="bm-local-search-section" auto-viewport />
            </div>
            <slot />
            <h-ground v-if="getImg" :bounds="rangeInfo.bounds" :imageURL="getImg" />
            <h-marker v-if="point.lng && point.lat" v-on="$listeners" @dragend="handle" :position="point" :dragging="!readonly" />
        </bm-map>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import BmMap from '@/components/map/index.vue';
import HGround from '@/components/map/custom-overlays/ground.vue';
import HMarker from '@/components/map/overlays/marker.vue';
import MapSearch from '@/components/common/location-search.vue';
import LocalSearch from '@/components/map/search/local-search.vue';
import { userModule, appModule } from '@/store/index';
import { BasePopup } from '@/base-class/dynamic-create';
import { offlinePosition, customJSON, customOnJSON } from '@/config/map';

// 父组件需给地图添加事件时，给事件加上 map 前缀，然后会自动将事件绑定到地图上，同理，地图属性也是一样
@Component({
    name: 'LocationHandle',
    components: {
        MapSearch,
        BmMap,
        HGround,
        HMarker,
        LocalSearch,
    },
})
export default class LocationHandle extends BasePopup {
    @Prop(Number)
    lng?: number;
    @Prop(Number)
    lat?: number;
    @Prop(Boolean)
    readonly!: boolean;
    // slot 方式的画圆需要默认的中心点
    @Prop({ type: Boolean, default: () => false })
    isSlot!: boolean;

    get center() {
        const { lng, lat } = this;
        return lng && lat
            ? { lng, lat }
            : userModule.center;
    }
    get zoom() {
        return userModule.zoom;
    }
    get isMobile() {
        return appModule.isMobile;
    }
    get localSearchStyle() {
        return this.isMobile ? { top: '32px' } : { transform: 'translateX(100%)' };
    }
    // 地图层图片地址
    get getImg() {
        return userModule.user.mapimg ? require(`@/assets/images/home-page.png`) : '';
    }

    value = false;
    point = { lng: 0, lat: 0 };
    mapStyle = this.getImg ? { styleJson: customJSON() } : { styleJson: customOnJSON() };
    keyword = '';
    rangeInfo = offlinePosition;
    map?: baiduMap['map'] | null = null;
    BMap?: baiduMap['BMap'] | null = null;
    
    // 窗口打开事件
    prefixFunc() {
        const { point, map, BMap, lng, lat } = this;
        this.keyword = '';
        Object.assign(point, { lng, lat });
        map && BMap && lng && lat && setTimeout(() => {
            map.panTo(new BMap.Point(lng, lat));
        }, 200);
    }

    @Watch('lng')
    lngUpdate(val: number) {
        this.point.lng = val;
    }
    @Watch('lat')
    latUpdate(val: number) {
        this.point.lat = val;
    }

    // 地图加载完成事件
    onReady({ map, BMap }: baiduMap) {
        this.map = map;
        this.BMap = BMap;
        const { lng, lat } = this;
        const bdary = new BMap.Boundary();
        bdary.get('长沙市', (rs: any) =>  { // 获取行政区域
            const count = rs.boundaries.length; // 行政区域的点有多少个
            for (let i = 0; i < count; i++) {
                let ply = new BMap.Polyline(rs.boundaries[i], {strokeWeight: 4, strokeColor: "#02fff6"}); // 建立多边形覆盖物
                map.addOverlay(ply); // 添加覆盖物
                if (lng && lat) {
                    map.panTo(new BMap.Point(lng, lat));
                } else {
                    map.setViewport(ply.getPath()); // 调整视野
                }
            }
        });
    }
    // 点击地图或者拖拽标点时，改变标点的位置
    handle(event: baiduMap['event']) {
        if (this.readonly) return;
        if(this.getImg){
            const { BMap, rangeInfo: { bounds: { sw, ne }}} = this;
            const bounds = new BMap.Bounds(new BMap.Point(sw.lng, sw.lat), new BMap.Point(ne.lng, ne.lat));
            const isContainer = bounds.containsPoint(event.point);
            if (!isContainer) return this.$Message.info(this.$t('h.placeholder.pleaseClickMapLocationAddress'));
            Object.assign(this.point, event.point);
            this.$emit('pointUpdate', event);
        }else {
            Object.assign(this.point, event.point);
            this.$emit('pointUpdate', event);
        }
    }
    // 提交经纬度
    ok() {
        const { point: { lng, lat }} = this;
        this.$emit('success', { lng: Number(lng.toFixed(5)) || undefined, lat: Number(lat.toFixed(5)) || undefined });
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    .modal-location-wrapper {
        @include utils-pierce(ivu-modal-body) {
            padding: 0;
            .modal-location-search {
                position: absolute;
                z-index: 1;
                max-width: 200px;
                top: 60px;
                right: 10px;
            }
            .bm-map {
                height: 100%; min-height: 70vh;
                position: relative;
                .bm-local-search {
                    $title-height: 32px;

                    width: 240px;
                    max-height: 100%;
                    border-radius: 5px;
                    position: absolute;
                    right: 0; top: 0;
                    z-index: 1;
                    overflow: auto;
                    background-color: $--white;
                    &-title {
                        height: $title-height;
                        padding-left: 6px;
                        display: flex;
                        align-items: center;
                        color: #221f1f;
                    }
                    &-section {
                        & > div:first-child {
                            border: {
                                left: none !important; right: none !important;
                            }
                        }
                    }
                }
            }
        }
    }
</style>