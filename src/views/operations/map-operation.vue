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
                <span class="map-operations__control" :title="!fullScreen ? $t('h.map.exitChart') : $t('h.map.checkChart')"><svg-icon @click="toggleFullScreen" class="full-screen-icon" :icon-class="!fullScreen ? 'fullscreenAlt' : 'fullscreenExit'" /></span>
            </div>
            <div class="map-main__scope">
                <!-- 下面放左右两侧的图表与中间的统计数据 -->
                <!-- <template v-if="chartArr.length && chartArr[0].length"> -->
                    <!-- <template v-if="showChart">
                        <aside :key="0" class="aside-chart">
                            <template v-for="(item, j) of chartArr[0]">
                                <patch-widget
                                    :key="item.t"
                                    :data="item"
                                    :plat="plat"
                                    :index="0 * 3 + j"
                                    :style="{
                                        'max-height': item[0].hasOwnProperty('window') ? (item[0].window === 2 ? 'calc(66.66% - 0.025rem)' : item[0].window === 3 ? '100%' : 'calc(33.33% - 0.05rem)') : 'calc(33.33% - 0.05rem)',
                                        'min-height': item[0].hasOwnProperty('window') ? (item[0].window === 2 ? 'calc(66.66% - 0.025rem)' : item[0].window === 3 ? '100%' : 'calc(33.33% - 0.05rem)') : 'calc(33.33% - 0.05rem)'
                                    }"
                                    @getAlarmTimeLine="getAlarmTimeLine"
                                    class="aside-chart__widget"
                                />
                            </template>
                        </aside>
                    </template> -->
                <!-- 下面放地图 -->
                <component
                    :is="mainComponent"
                    :center="mapConfig.center"
                    :zoom="mapConfig.zoom"
                    :data="showMarkers"
                    :label="search.label"
                    :condition="genCondition"
                    :prefix-condition="prefixMarkerCondition"
                    :mapStyle="onMapStyle"
                    @markerChange="markerCountChange"
                    @ready="onReady"
                    @zoomend="saveMapInfo"
                    @dragend="saveMapInfo"
                    :auto-viewport="autoViewport"
                >
                    <div v-show="search.value" :style="{ right: !fullScreen ? '580px' : '90px' }" class="bm-local-search">
                        <h3 class="bm-local-search__title">{{$t('h.map.searchResult')}}</h3>
                        <local-search :keyword="search.keyword" class="bm-local-search__section" auto-viewport />
                    </div>
                </component>
                <!-- <template v-if="chartArr.length && chartArr[1].length">
                    <template v-if="showChart">
                        <aside :key="1" class="aside-chart">
                            <template v-for="(item, j) of chartArr[1]">
                                <patch-widget
                                    :key="item.t"
                                    :data="item"
                                    :plat="plat"
                                    :index="1 * 3 + j"
                                    :style="{
                                        'max-height': item[0].hasOwnProperty('window') ? (item[0].window === 2 ? 'calc(66.66% - 0.025rem)' : item[0].window === 3 ? '100%' : 'calc(33.33% - 0.05rem)') : 'calc(33.33% - 0.05rem)',
                                        'min-height': item[0].hasOwnProperty('window') ? (item[0].window === 2 ? 'calc(66.66% - 0.025rem)' : item[0].window === 3 ? '100%' : 'calc(33.33% - 0.05rem)') : 'calc(33.33% - 0.05rem)'
                                    }"
                                    @getAlarmTimeLine="getAlarmTimeLine"
                                    class="aside-chart__widget"
                                />
                            </template>
                        </aside>
                    </template>
                </template> -->
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Select as ISelect, Option as IOption, Checkbox, Tree as ITree } from 'view-design';
import MapTitle from './components/title.vue';
import MapSearch from '@/components/common/location-search.vue';
import LocalSearch from '@/components/map/search/local-search.vue';
import dynamicImport from '@/utils/component-dynamic-import';
import HWrapper from '@/components/map/custom-overlays/wrapper.vue';
import PointView from './components/point-view.vue';
import MapTheme from '@/components/common/map-theme.vue';
import { getYiWuGis as getMarker, getYiWuGisChart as getChart, getDeviceList, getPatrolList, getMonitorList, getFacilityList } from '@/config/api';
import { MapLayout } from '@/mixins/map';
import { offlinePosition, customJSON, customOnJSON, componentName } from '@/config/map';

type AuthField = string;

// 用来存放临时标点 -> { d: { d-category-person: [] }, ...args };
const temporaryStore: Dictionary<any[]> = {};

@Component({
    name: 'map-new',
    components: {
        ISelect,
        IOption,
        Checkbox,
        ITree,
        MapTitle,
        MapSearch,
        LocalSearch,
        HWrapper,
        PointView,
        MapTheme,
        ViewO: () => dynamicImport(() => import('@/components/point-views/org.vue')),
    },
})
export default class Maps extends MapLayout {
    dicts: ResponseMap.YiWuGisChart['dict'] = [];
    rangeInfo = offlinePosition;
    onMapStyle = { styleJson: customOnJSON() };

    created() {
        this.getAuth();
    }

    // plat 发生改变时初始化界面
    @Watch('plat')
    async platChange(val: AuthField) {
        if (val) {
            this.resetDatum();
            this.genMarkerMenu(val);
            this.requestCharts(val);
        }
    }

    // 地图加载完成时触发
    async onReady({ BMap, map }: baiduMap) {
        const { plat } = this;
        this.map = map;
        this.BMap = BMap;
        this.genMarkerMenu(plat);
    }
    /**
     * @description: 请求图表数据, 同时渲染下方的地图标点
     * @param {String} plat: 所属平台
     */
    async requestCharts(plat: string) {
        this.loading = true;
        const { type, data } = await getChart(plat);
        if (!type) {
            const { dict, chart } = data;
            this.$set(this, 'charts', chart);
            this.dicts = dict || [];
        }
        this.loading = false;
    }
    /**
     * @description: 获取标点
     * @param {String} t: 请求的类型
     * @param {Object} parameter: 请求传给后台的参数
     */
    async getMarker(t: string, parameter: Dictionary<any>) {
        const { plat, markers } = this;
        const [point_t, k, v] = t.split('-');
        parameter[k] = v;
        const storeKey = t;
        this.loading = true;
        const { type, data, msg } = await getMarker(parameter);
        if (type) {
            this.loading = false;
            temporaryStore[storeKey] = [];
            return this.$Message.error(`${msg || this.$t('h.tips.getDataError')}, ${this.$t('h.tips.pageRefresh')}`);
        }
        // 终止条件，当前展示 plat 与当前请求 parameter.plat 不同 或者组件已被销毁时，终止请求与赋值
        if (plat !== parameter.plat || this._isDestroyed) return;
        const { list, nextid } = data[point_t as 'd']!;
        temporaryStore[storeKey] = (temporaryStore[storeKey] || []).concat(list);
        if (nextid) {
            await this.getMarker(t, { ...parameter, nextid });
        }
        else {
            this.loading = false;
            if (t === point_t) {
                Object.keys(markers).every(k => {
                    k !== point_t && k.split('-')[0] === point_t && this.$delete(markers, k);
                    return true;
                });
            }
            this.$set(markers, storeKey, temporaryStore[storeKey]);
            this.markerCountChange(temporaryStore[storeKey].length, point_t);
            delete temporaryStore[storeKey];
        }
    }
    /**
     * @description: 设置需要显示的标点
     * @param {String} value: 设置的 key
     * @param {Boolean} status: 标点显示状态
     */
    setMarkerKey(value: string, status: boolean) {
        const { showMarkerKeys } = this;
        const i = showMarkerKeys.indexOf(value);
        status
            ? i === -1 && showMarkerKeys.push(value)
            : i !== -1 && showMarkerKeys.splice(i, 1);
        this.saveLayout('markerKeys', showMarkerKeys);
        if (!status) {
            const k = value.split('-')[0];
            this.markerCountChange(0, k, true);
        }
    }
    /**
     * @description: 恢复显示的标点
     * 恢复标点时如果不存在显示全部的
     * 则请求带条件的, 否则请求全部
     * @param {Array} markerKeys: 待请求的标点类型
     */
    restoreMarker(markerKeys: string[]) {
        markerKeys.every(k => {
            const _k = k.split('-')[0];
            (_k === k || !markerKeys.includes(_k)) &&
                this.actuateRequestMarkers(k);
            return true;
        });
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/map.scss';
</style>
