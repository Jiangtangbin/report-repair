<template>
    <div class="map-container">
        <map-title class="map-title" />
        <main class="map-main">
            <loading :loading="loading" class="loading" type="B" />
            <div :style="{ right: !fullScreen ? '580px' : '90px' }" class="map-operations d-v-c">
                <i-select v-if="dicts.length" @on-change="areaChange($event, true)" :value="dictActive" :placeholder="$t('h.placeholder.select', { msg: $t('h.table.check.area') })" class="map-operations__control map-operations__box" clearable>
                    <i-option v-for="item of dicts" :key="item.code" :value="item.code">{{item.name}}</i-option>
                </i-select>
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
                <!-- 下面放左右两侧的图表与中间的统计数据 -->
                <template v-if="!offMapImg && chartArr.length && chartArr[0].length">
                    <template v-if="showChart">
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
                    </template>
                    <alarm-steps
                        :value="isAlarmTimeLine"
                        :datum="alarmList"
                        @closeAlarmSteps="isAlarmTimeLine = false, oldAlarmId = 0"
                        class="map__control-alarmTimeLine"
                    />
                    <!-- 下面放标点控制按钮 -->
                    <point-control
                        @change="pointControlChange"
                        @querySearch="querySearch"
                        :data="pointMenuDatum"
                        :selectArea="area"
                        :class="{'map__control-menu--full-screen': !showChart }"
                        :condition="genCondition"
                        class="map__control-menu"
                        ref="pointControl"
                    />
                </template>
                <!-- 下面放地图 -->
                <component
                    :is="mainComponent"
                    :center="mapConfig.center"
                    :zoom="!offMapImg ? mapConfig.zoom : rangeInfo.zoom"
                    :isOnMap="!offMapImg"
                    :data="!offMapImg ? showMarkers : {}"
                    :label="search.label"
                    :condition="genCondition"
                    :prefix-condition="prefixMarkerCondition"
                    :mapStyle="!offMapImg ? onMapStyle : offMapStyle"
                    :selectArea="area"
                    @markerChange="markerCountChange"
                    @ready="onReady"
                    @zoomend="saveMapInfo"
                    @dragend="saveMapInfo"
                    @contrastSuccess="fullScreen = true"
                    :auto-viewport="autoViewport"
                >
                    <div v-show="search.value" :style="{ right: !fullScreen ? '580px' : '90px' }" class="bm-local-search">
                        <h3 class="bm-local-search__title">{{$t('h.map.searchResult')}}</h3>
                        <local-search :keyword="search.keyword" class="bm-local-search__section" auto-viewport />
                    </div>
                    <h-ground :bounds="rangeInfo.bounds" :imageURL="offMapImg" />
                    <HWrapper v-if="offMapImg">
                        <template v-for="item of layoutResource">
                            <component
                                :is="`view-${getPointKey(item.alias)}`"
                                :key="item.alias"
                                :data="offMarkers[item.alias]"
                                :mapId="offMapId"
                                :field="item.alias"
                            />
                        </template>
                    </HWrapper>
                </component>
                <template v-if="!offMapImg && chartArr.length && chartArr[1].length">
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
                </template>
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Select as ISelect, Option as IOption, Checkbox, Tree as ITree } from 'view-design';
import MapTitle from './components/title.vue';
// import MapTags from './components/tags.vue';
import MapSearch from '@/components/common/location-search.vue';
import LocalSearch from '@/components/map/search/local-search.vue';
import dynamicImport from '@/utils/component-dynamic-import';
import HWrapper from '@/components/map/custom-overlays/wrapper.vue';
import HGround from '@/components/map/custom-overlays/ground.vue';
import PointView from './components/point-view.vue';
import PointMenu from '@/components/point-menu/index.vue';
import AlarmSteps from '@/components/alarm-steps/index.vue';
import DeviceGroupMenu from '@/components/device-group-menu/index.vue';
import planGroupMenu from '@/components/plan-group-menu/index.vue';
import PointControl from '@/components/point-views/point-control.vue';
import PatchWidget from '@/components/map-patch/index.vue';
import MapTheme from '@/components/common/map-theme.vue';
import { getYiWuGis as getMarker, getYiWuGisChart as getChart, getDeviceList, getPatrolList, getMonitorList, getFacilityList, getAlarmTimeLine } from '@/config/api';
import { mapLump } from '@/config/index';
import { MapLayout } from '@/mixins/map';
import { offlinePosition, customJSON, customOnJSON, componentName } from '@/config/map';

type AuthField = string;
type AuthAlias = { value: AuthField, title: string; };
type MarkerKeys = keyof ResponseMap.YiWuGis;
type Markers = Dictionary<(keyof ResponseMap.MarkerGather)[]>;
type PointMenuDatum = { title: string; value: string; icon?: string; status: boolean; cnt: number; };

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
        MapTags,
        MapSearch,
        LocalSearch,
        HWrapper,
        HGround,
        PointView,
        PointMenu,
        AlarmSteps,
        DeviceGroupMenu,
        planGroupMenu,
        PointControl,
        PatchWidget,
        MapTheme,
        ViewD: () => dynamicImport(() => import('@/components/point-views/device.vue')),
        ViewF: () => dynamicImport(() => import('@/components/point-views/facility.vue')),
        ViewP: () => dynamicImport(() => import('@/components/point-views/patrol.vue')),
        ViewMp: () => dynamicImport(() => import('@/components/point-views/monitor.vue')),
    },
})
export default class Maps extends MapLayout {
    @Prop({ type: String, default: '' })
    area?: string;

    tagActive: AuthField = this.plat || ''; // 激活的标签页
    dictActive: string | undefined = this.area; // 搜索字典
    dicts: ResponseMap.YiWuGisChart['dict'] = [];
    tongJi: ResponseMap.YiWuGisChart['tj'] = [];
    // 获取报警记录时间线
    isAlarmTimeLine = false;
    oldAlarmId = 0;
    alarmList = [];
    rangeInfo = offlinePosition;
    onMapStyle = { styleJson: customOnJSON() };
    offMapStyle = { styleJson: customJSON() };
    layoutResource = [
        {
            title: '设备',
            alias: 'd',
            type: 'device',
            active: true,
            api: getDeviceList,
        },
        {
            title: '资源',
            alias: 'f',
            type: 'facilityType',
            active: false,
            api: getFacilityList,
        },
        {
            title: '巡查点',
            alias: 'p',
            type: 'dict',
            params: 10,
            active: false,
            api: getPatrolList,
        },
        {
            title: '监测点',
            alias: 'mp',
            type: 'dict',
            params: 36,
            active: false,
            api: getMonitorList,
        },
    ];

    // 标点的通用条件 -> 只针对行政区域属性
    get commonCondition(): Dictionary<any> {
        const { dictActive } = this;
        const result: Dictionary<any> = {};
        if (!dictActive) return result;
        const [key, value] = dictActive.split('_');
        return key
            ? { [key]: value }
            : result;
    }

    created() {
        const { tagActive } = this;
        this.getAuth();
        tagActive
            ? this.requestCharts(tagActive, this.dictActive)
            : this.tagChange(this.auth[0].value);
    }

    // plat 发生改变时初始化界面
    @Watch('plat')
    async platChange(val: AuthField) {
        const { tagActive, dictActive, mapReady } = this;
        if (val && val !== tagActive) {
            this.resetDatum();
            this.genMarkerMenu(val);
            this.tagActive = val;
            this.requestCharts(val, dictActive);
        }
    }
    // area 发生改变时初始化图表
    @Watch('area')
    areaChange(val?: string, inset?: boolean) {
        const { tagActive, dictActive, $route } = this;
        if (inset === true) {
            if (!$route.query.ak) {
                this.$router.replace({ ...$route as object, query: { plat: tagActive, area: val }});
            } else {
                this.$router.replace({ ...$route as object, query: { plat: tagActive, area: val, ak: $route.query.ak }}).catch(error => {});
            }
        } else if (dictActive !== val) {
            this.requestCharts(tagActive, val);
            this.dictActive = val;
        }
    }

    // 地图加载完成时触发
    async onReady({ BMap, map }: baiduMap) {
        const { plat } = this;
        this.map = map;
        this.BMap = BMap;
        this.genMarkerMenu(plat);
    }
    // 获取标点展示的类型
    getPointKey(type: string) {
        const result = componentName.find(([reg]) => reg.test(type));
        return result ? result[1] : type;
    }
    /**
     * @description: 获取指定标点类型的显示状态(下方总菜单)
     * @param {String} type: 标点类型
     */
    getAppointTypeStatus(type: string) {
        return false;
        // const { storageUniqueKey } = this;
        // const content = getStorage(storageUniqueKey) || {};
        // const keys: string[] = content.markerKeys || [];

        // return keys.some(k => k === type);
    }
    // tag 发生改变时初始化界面
    tagChange(val: AuthField) {
        const { tagActive, $route } = this;
        val && val !== tagActive && this.$router.replace({ ...$route as object, query: { plat: val }});
        return val;
    }
    /**
     * @description: 请求图表数据, 同时渲染下方的地图标点
     * @param {String} plat: 所属平台
     * @param {String} area?: 所属区域
     */
    async requestCharts(plat: string, area?: string) {
        this.loading = true;
        const { type, data } = await getChart(plat, area);
        if (!type) {
            const { tj, dict, points, chart } = data;
            this.$set(this, 'charts', chart);
            this.genPointMenuDatum(points);
            this.dicts = dict || [];
            this.tongJi = (tj || []).map(({ code, status, ...args }) => ({
                ...(mapLump[`${code}${status || ''}` as 'fj'] || {}),
                ...args,
                code,
                status,
            }));
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
    /**
     * @description: 获取报警记录业务时间线
     * @param {Number} id: 点击项的 id
     */
    async getAlarmTimeLine(id: number) {
        if (this.oldAlarmId === id) return false;
        this.oldAlarmId = id;
        this.isAlarmTimeLine = true;
        const { type, data } = await getAlarmTimeLine(id);
        if (!type) {
            this.alarmList = data;
        }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/map.scss';
</style>