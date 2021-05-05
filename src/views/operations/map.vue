<template>
    <div class="map-container">
        <map-title class="map-title" />
        <main class="map-main">
            <loading :loading="loading" class="loading" type="B" />
            <div :style="{ right: !fullScreen ? '580px' : '90px' }" class="map-operations d-v-c">
                <map-search
                    :value.sync="search.value"
                    :keyword.sync="search.keyword"
                    class="map-operations__control map-operations__box"
                    :placeholder="$t('h.map.addressSearch')"
                />
                <span class="map-operations__control" :title="$t('h.map.checkAddress')"><svg-icon @click="openUsualList" class="full-screen-icon" icon-class="star-fill" /></span>
                <span class="map-operations__control" :title="!fullScreen ? $t('h.map.exitChart') : $t('h.map.checkChart')"><svg-icon @click="toggleFullScreen" class="full-screen-icon" :icon-class="!fullScreen ? 'fullscreenAlt' : 'fullscreenExit'" /></span>
            </div>
            <div class="map-main__scope">
                <bm-map v-on="$listeners" v-bind="mapStyles" @ready="onReady" :zoom="zoom">
                    <map-type :map-types="mapType" anchor="BMAP_ANCHOR_TOP_RIGHT" />
                    <h-wrapper>
                        <slot name="wrapper" />
                        <template v-for="(item, key) of data">
                            <component
                                v-if="item && item.length"
                                v-bind="$attrs"
                                @markerChange="markerChange"
                                @handle="markerHandle(...arguments, getPointKey(key))"
                                :is="`view-${getPointKey(key)}`"
                                :key="key"
                                :data="item"
                                :label="label"
                                :field="key"
                                :condition="condition && condition[key]"
                                :prefix-condition="prefixCondition && prefixCondition[key]"
                                :ref="key"
                                :isInfoWindow="getInfoWindowStatus(key, getPointKey(key))"
                            />
                        </template>
                    </h-wrapper>
                </bm-map>
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import BmMap from '@/components/map/index.vue';
import MapTitle from './components/title.vue';
import MapSearch from '@/components/common/location-search.vue';
import MapType from '@/components/map/controls/map-type.vue';
import HWrapper from '@/components/map/custom-overlays/wrapper.vue';
import theme from '@/config/map-theme';
import dynamicImport from '@/utils/component-dynamic-import';
import { componentName } from '@/config/map';
import { autoViewport } from '@/config/environment';
import { customOnJSON } from '@/config/map';
import { userModule } from '@/store/index';
import { MapLayout } from '@/mixins/map';

@Component({
    inheritAttrs: false,
    components: {
        BmMap,
        HWrapper,
        MapType,
        MapTitle,
        MapSearch,
        ViewO: () => dynamicImport(() => import('@/components/point-views/org.vue')),
    },
})
export default class Maps extends MapLayout {
    map: baiduMap['map'] | null = null;
    BMap: baiduMap['BMap'] | null = null;
    onMapStyle = { styleJson: customOnJSON() };
    // 是否自适应地图
    autoViewport: boolean = autoViewport;
    // 是否全屏
    fullScreen = false;

    // 地图中心点
    get mapConfig() {
        const { center, zoom } = userModule;
        return { center, zoom };
    }
    
    @Watch('data')
    pointsChange() {
        const { autoViewport, map } = this;
        if (!(autoViewport && map)) return;
        this.$nextTick(() => {
            const markers: baiduMap['point'][] = [];

            Object.values(this.points()).some(v => {
                markers.push(...v);
                return false;
            });
            markers.length && map.setViewport(markers);
        });
    }

    // 地图加载完成事件
    onReady({ map, BMap }: baiduMap) {
        this.map = map;
        this.BMap = BMap;
        // 此处延迟执行, 防止被 vue-baidu-map 内部重置 center 覆盖
        setTimeout(this.pointsChange, 1000);
        // 圈选范围
        this.appointRange('长沙市', map, BMap);
        // 防止标点组件的 ready 事件多次触发
        this.$emit('mapReady', { map, BMap });
        if (map.setMapStyleV2) {
            const { center } = this;
            if (isString(center)) {
                const point = map.getCenter();
                map.setCenter(point);
            }
            map.setMapStyleV2 && map.setMapStyleV2({ styleJson: theme });
        }
        // map.addEventListener('click', this.clickHandle);
        // map.addEventListener('mousemove', this.moveHandle);
        // map.addEventListener('rightclick', this.mapRightHandle);
        // this.$on('hook:beforeDestroy', () => {
        //     map.removeEventListener('click', this.clickHandle);
        //     map.removeEventListener('mousemove', this.moveHandle);
        //     map.removeEventListener('rightclick', this.mapRightHandle);
        // });
    }
    /**
     * @description: 标点数量发生改变
     * @param {Number} cnt: 当前显示的标点数量
     * @param {String} field: 当前标点数量发生变化的类型
     */
    markerChange(cnt: number, field: string) {
        this.$emit('markerChange', cnt, field);
        // this.pointsChange();
    }
    /**
     * @description 标点点击事件
     * @param {Object} data: 点击的标点信息
     * @param {String} key: 标点的 key
     * @param {String} field: 点击的标点类型
     */
    markerHandle(data: Record<string, any>, key: string, field: string) {
        this.$emit('handle', data, key, field);
    }
    // 获取标点展示的类型
    getPointKey(type: string) {
        const result = componentName.find(([reg]) => reg.test(type));
        return result ? result[1] : type;
    }
    // 收集展示标点
    points(): Record<API.PointType, any[]> {
        const result = {} as Record<API.PointType, any[]>;
        // @ts-ignore
        Object.entries(this.$refs).some(([k, v]: ['d' | 'copyPoint', any[]]) => {
            if (k === 'copyPoint' || !(v && v.length)) return false;
            result[k as 'd'] = (v as any)[0].getViewportPoints;
            return false;
        });
        return result;
    }
    /**
     * @description: 指定圈选的范围
     * @param {String} address: 地址
     * @param {Object | any} map: 地图对象
     * @param {Object | any} BMap: 地图对象
     */
    appointRange(address: string, map:any, BMap: any) {
        const bdary = new BMap.Boundary();
        bdary.get(address, (rs: any) =>  { // 获取行政区域
            const count = rs.boundaries.length; // 行政区域的点有多少个
            for (let i = 0; i < count; i++) {
                let ply = new BMap.Polyline(rs.boundaries[i], {strokeWeight: 4, strokeColor: '#02fff6'}); // 建立多边形覆盖物
                map.addOverlay(ply); // 添加覆盖物
                map.setViewport(ply.getPath()); // 调整视野
            }
        });
    }
}
</script>