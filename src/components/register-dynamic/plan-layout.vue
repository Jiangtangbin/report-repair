<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || hide()"
        :footer-hide="!readonly"
        :title="`${$t('h.formLabel.plan')} ''${name}'' ${$t('h.formLabel.distribution')}`"
        width="1080px"
        class="modal-plan-wrapper"
    >
        <bm-map @ready="onReady" :center="center" :mapStyle="mapStyle" :zoom="rangeInfo.putPointZoom" @drop.native="appendPoint" class="bm-map" ref="map">
            <h-ground v-if="getImg" :bounds="rangeInfo.bounds" :imageURL="getImg" />
            <HWrapper>
                <template v-for="item of layoutResource">
                    <component
                        @deleteSuccess="getMarkers"
                        :is="`view-${getPointKey(item.alias)}`"
                        :key="item.alias"
                        :data="markers[item.alias]"
                        :mapId="id"
                        :field="item.alias"
                        putPoint
                    />
                </template>
            </HWrapper>
        </bm-map>
        <div class="device-container">
            <p class="device-tab d-v-c">
                <span
                  v-for="(item, index) of layoutResource" :key="index"
                  @click="initType({ type: item.type, params: item.params, alias: item.alias, index })"
                  :class="{ 'device-tab-active-item': item.active }"
                  class="device-tab-item d-v-c c-p"
                  >
                  {{$t(item.title) || $t('h.common.unknown')}}
                </span>
            </p>
            <p class="device-search">
                <i-input
                    @on-search="nameSearch"
                    v-model.trim="searchName"
                    search
                    :enter-button="$t('h.tableButton.search')"
                    :placeholder="$t('h.placeholder.pleaseEnterName')"
                />
            </p>
            <div class="device-data" ref="putPoint">
                <loading :loading="loading" type="B" />
                <tabs v-model="tabs.value" @on-click="onChange" class="device-data-tabs">
                    <tab-pane v-for="(tab, index) of tabs.list" :key="tab.value" :name="tab.value" :label="tab.title" class="tabs-pane -d-v-c" ref="tagBox">
                        <figure
                            v-for="(item, i) of tab.list" :key="item.id || i"
                            @dblclick="movePoint(item, currentTypes.value, tab.value)"
                            :data-type="currentTypes.value"
                            :data-cate="tab.value"
                            :data-sub-cate="item.sub_category"
                            :data-flag="item.flag || item.id"
                            :data-uuid="item.uuid"
                            :data-name="item.fullname || item.name || item.point || item.patrol_type_name || item.category_name || item.t_name"
                            :data-isalarm="item.isalarm"
                            :data-isonline="item.isonline"
                            :data-fullname="item.fullname"
                            :data-cate-name="item.category_name"
                            :data-sub-cate-name="item.sub_category_name"
                            class="tabs-pane-item d-v-c c-p"
                            ref="tag"
                        >
                            <svg-icon v-if="tabs.icon[item.aliasSense || item.sub_category || item.patrol_type]" :icon-class="tabs.icon[item.aliasSense || item.sub_category || item.patrol_type]" />
                            <figcaption :title="item.fullname || item.name || item.point || item.patrol_type_name || item.category_name || item.t_name" class="tabs-pane-item-text t-o-e">
                            {{item.name || item.point || item.patrol_type_name || item.category_name || item.t_name}}
                            </figcaption>
                        </figure>
                        <footer
                            @click="paging(tab, index)"
                            :class="{'invalid': !(tab.page.countPage > tab.page.pageNum)}"
                            :label="tab.page.countPage > tab.page.pageNum ? $t('h.other.loadMore') : $t('h.other.noMoreData')"
                            class="pseudo-prefix tabs-pane-more d-v-c"
                            >
                        </footer>
                    </tab-pane>
                </tabs>
            </div>
        </div>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component, Watch } from 'vue-property-decorator';
import { Tabs, TabPane, Input as IInput } from 'view-design';
import BmMap from '@/components/map/index.vue';
import HWrapper from '@/components/map/custom-overlays/wrapper.vue';
import dynamicImport from '@/utils/component-dynamic-import';
import HGround from '@/components/map/custom-overlays/ground.vue';
import { userModule } from '@/store/index';
import Sortable from 'sortablejs';
import { BasePopup } from '@/base-class/dynamic-create';
import { offlinePosition, customJSON, componentName, icon, senseAlias } from '@/config/map';
import { DictModule } from '@/store/modules/dict';
import { getDeviceList, getOfflineMarkers } from '@/config/api';

// alramdevice 字段转义称 isalarm
const tranferAlarmdevice = ['o', 'ap', 'mp', 'p'];
const styleJson = customJSON();

// 父组件需给地图添加事件时，给事件加上 map 前缀，然后会自动将事件绑定到地图上
// 同理，地图属性也是一样
@Component({
    name: 'PlanLayoutHandle',
    components: {
        BmMap,
        HGround,
        HWrapper,
        Tabs,
        TabPane,
        IInput,
        ViewO: () => dynamicImport(() => import('@/components/point-views/org.vue')),
    },
})
export default class PlanLayoutHandle extends BasePopup {
    @Prop(Number)
    lng?: number;
    @Prop(Number)
    lat?: number;
    @Prop(String)
    plan!: string;
    @Prop(Boolean)
    readonly!: boolean;
    // 每次请求的数量
    @Prop({ type: Number, default: 24 })
    pageSize?: number;
    @Prop({ type: String, default: '离线地图' })
    name?: string;

    mapStyle = this.getImg ? { styleJson: customJSON() } : { styleJson: { style: 'normal' }};
    rangeInfo = offlinePosition;
    map?: baiduMap['map'] | null = null;
    BMap?: baiduMap['BMap'] | null = null;
    loading = false;
    searchName = '';
    currentTypes = {
        value: '',
        index: null,
    };
    markers = [];
    layoutResource = [
        {
            title: 'h.formLabel.device',
            alias: 'd',
            type: 'device',
            active: true,
            api: getDeviceList,
        },
    ];
    tabs = {
        // 当前所在模块
        value: '',
        index: null,
        icon,
        // tab-pane list 集合
        list: [],
    };

    get center() {
        const { lng, lat } = this;
        return lng && lat
            ? { lng, lat }
            : userModule.center;
    }
    // 地图层图片地址
    get getImg() {
        const { plan } = this;
        return plan;
    }

    // map、BMap只会进入一次
    @Watch('map')
    mapChange() {
        this.initType({ type: this.layoutResource[0].type, params: '', alias: this.layoutResource[0].alias, index: 0 });
    }
    @Watch('BMap')
    bMapChange() {
        this.getMarkers();
    }

    // 窗口打开事件
    prefixFunc() {
        const { map, BMap, lng, lat } = this;
        map && BMap && setTimeout(() => {
            lng && lat && map.panTo(new BMap.Point(lng, lat));
            this.getMarkers();
            this.initType({ type: this.layoutResource[0].type, params: '', alias: this.layoutResource[0].alias, index: 0 });
        }, 200);
    }
    // 地图加载完成事件
    onReady({ map, BMap }) {
        this.map = map;
        this.BMap = BMap;
    }
    // 获取标点展示的类型
    getPointKey(type: string) {
        const result = componentName.find(([reg]) => reg.test(type));
        return result ? result[1] : type;
    }
    // 名称搜索
    async nameSearch() {
        const { tabs, tabs: { list }, pageSize, currentTypes: { index }, layoutResource, searchName } = this;
        const { api } = layoutResource[index]; // 外部提供的基于当前类别的条件
        this.loading = true;
        const { type, data } = await api({ pageSize, name: searchName, category: tabs.value });
        if (!type) {
            list[index].list = data.list;
            this.loading = false;
        }
    }
    // 初始化类型
    async initType({ type, params, alias, index }) {
        const { tabs, initTab, currentTypes, initSortPoint } = this;
        this.searchName = '';
        this.layoutResource.forEach(item => {
            item.alias === alias ? item.active = true : item.active = false;
        });
        let data = await DictModule.getCustomDicts({ type, params });
        // 删除个人设备
        data.forEach((item, index) => {
            item.value === 'person' && data.splice(index, 1);
        });
        data.some((item, index) => {
            delete item.children;
            item.list = [];
            item.page = {};
            item.init = !index;
        });
        this.handleData(data, alias);
        this.$set(tabs, 'list', data);
        tabs.value = data[0].value;
        Object.assign(currentTypes, { index, value: alias });
        initTab({ reset: true });
        initSortPoint();
    }
    /**
     * 初始化(翻页) tabs
     * @param {Boolean} reset: 是否重置页面
     * @param {Function} error: 失败后的重置界面
     * @param {String} name: 需请求的 tabs name
     * @param {Number} index: 需请求的 tabs 下标
     */
    async initTab({ reset, name = 'video', index = 0, error } = {}) {
        const { tabs, tabs: { list }, pageSize, currentTypes: { index: typeIndex }, layoutResource, searchName } = this;
        const { api, params } = layoutResource[typeIndex]; // 外部提供的基于当前类别的条件
        const { params: param } = list[index]; // 内部提供的基于当前类别的条件
        this.loading = true;
        const { type, data } = await api({ pageSize, ...params, ...param, name: searchName });
        if (!type) {
            Object.assign(list[index], { init: true, page: data.page });
            tabs.index = index;
            name === 'sense' && data.list.forEach(item => (item.aliasSense = senseAlias[item.sub_category as '1']));
            reset ? (list[index].list = data.list) : list[index].list.push(...data.list);
            this.loading = false;
        } else {
            error(index);
        }
    }
    /**
     * 获取离线地图标点
     */
    async getMarkers() {
        const { id, markers, BMap } = this;
        const { type: types, data } = await getOfflineMarkers(id);
        if (!types) {
            // 新增字段
            Object.entries(data).some(([key, cate]) => cate.some((item, index) => {
                Object.assign(item, { infoWindow: false, dragging: false, isshow: false, onlineLocation: false, moveFinish: true, paths: [new BMap.Point(item.lng, item.lat)], parseAlarmdevice: item.alarmdevice ? this.$t('h.status.alarming') : this.$t('h.status.normal'), color: undefined });
                // 为单位增加 isalarm 字段
                tranferAlarmdevice.includes(key) && (item.isalarm = Number(!!item.alarmdevice));
                // 对设备的传感器类型图标进行处理
                key === 'd' && item.category === 'sense' && (item.alias = senseAlias[item.sub_category as '1']);
                if (key === 'lk') {
                    item.xzrange && (item.xzrange = JSON.parse(item.xzrange));
                    item.orglist.some(org => void Object.assign(org, { infoWindow: false, dragging: false, isshow: false, parseAlarmdevice: item.alarmdevice ? this.$t('h.status.alarming') : this.$t('h.status.normal') }));
                } else if (key === 'gd') {
                    item.points = item.points && JSON.parse(item.points);
                }
            }));
            Object.entries(data).some(([key, values]) => void this.$set(markers, key, values));
            return true;
        }
    }
    /**
     * 布点列表双击跳转到标点位置
     * @param {Object} marker: 标点的信息
     * @param {String} type: 标点所属的种类
     */
    movePoint({ flag, id }, type: string) {
        const { markers, $Message, map, BMap } = this;
        if (!markers[type]) return $Message.info(this.$t('h.tips.typeNothingnessMap'));
        try {
            const marker = markers[type].find(item => item.flag === flag || item.id === id);
            if (marker && marker.lng && marker.lat) {
                marker.isshow = true;
                map.panTo(new BMap.Point(marker.lng, marker.lat));
            } else {
                $Message.info(this.$t('h.tips.mapNothingnessPoint'));
            }
        } catch (error) {
            $Message.info(this.$t('h.tips.nothingnessType'));
        }
    }
    /**
     * 初始化布点列表
     * @param {Number} time: 延时执行的时间
     */
    initSortPoint(time = 0) {
        setTimeout(() => {
            let { $refs: { map: { $el: map }}} = this;
            // 初始化 marker
            this.sort = this.$refs.tagBox && this.$refs.tagBox.map($dom => Sortable.create($dom.$el, {
                handle: '.tabs-pane-item',
                group: { name: 'drag', pull: 'clone', revertClone: true },
                sort: false,
                onEnd: ({ item: { dataset: { type, flag, cate, subCate, ...args }}}) => {
                    this.putPoint = { type, flag, cate, subCate };
                    setTimeout(() => {
                        this.putPoint = null;
                    }, 10);
                },
            }));
            // 初始化地图
            this.sort && this.sort.push(Sortable.create(map, {
                group: 'map',
            }));
            this.$refs.tagBox = null;
        }, time);
    }
    /**
     * 从列表往地图上添加点事件
     * @param {DOMEvent} event: event 事件
     */
    appendPoint({ x, y }) {
        setTimeout(async () => {
            if (!this.putPoint) return;
            const { $refs: { map: { $el }}, map, BMap, markers, putPoint: { type, flag }, id, $Message } = this;
            try {
                if (markers[type] && markers[type].some(marker => marker.flag === flag || marker.id === Number(flag))) {
                    $Message.info(this.$t('h.tips.mapExistencePoint'));
                    return;
                }
                const { top, left } = $el.getBoundingClientRect();
                const { rangeInfo: { bounds: { sw, ne }}} = this;
                const putPoint = map.pixelToPoint(new BMap.Pixel(x - left, y - top));
                const bounds = new BMap.Bounds(new BMap.Point(sw.lng, sw.lat), new BMap.Point(ne.lng, ne.lat));
                const isContainer = bounds.containsPoint(putPoint);
                if (!isContainer) return $Message.info(this.$t('h.tips.pointNotInRange'));
                const { type: types } = await setPlanPoint({ marker_type: type, flag, map_id: id, ...putPoint });
                if (!types) {
                    const { tabs: { list, index }} = this;
                    const pointInfo = list[index].list.find(item => item.flag === flag || item.id === Number(flag));
                    if (pointInfo) {
                        markers[type].push({ isshow: true, infoWindow: false, dragging: false, ...pointInfo, ...putPoint });
                    } else {
                        $Message.info(this.$t('h.tips.displayPointError'));
                        console.log('本地展示标点失败，请刷新查看', pointInfo, JSON.parse(JSON.stringify(list[index].list)), flag);
                    }
                }
            } catch (error) {
                $Message.info(this.$t('h.tips.addPointError'));
                console.log('该类菜单不存在', markers, type, error);
            }
        }, 5);
    }
    /**
     * 翻页
     * @param {Object} tab 选项卡数据对象
     * @param {Number} index 下标
     */
    paging(tab, index: number) {
        const { page: { pageNum }, params, value: name } = tab;
        params.pageNum = pageNum + 1;
        const error = () => {
            params.pageNum = pageNum;
        };
        this.initTab({ name, index, error });
    }
    /**
     * 点击 tab 选项卡
     * @param {String} name: 选项卡名称
     */
    onChange(name: string) {
        const { tabs: { list }, initTab } = this;
        this.searchName = '';
        list.some((item, index) => {
            if (item.value === name) {
                item.init || initTab({ reset: true, name, index });
                return true;
            }
        });
    }
    // 获取到类型后对数据进行处理
    handleData(data, alias: string) {
        switch (alias) {
            case 'd':
                data.forEach(item => void (item.params = { category: item.value }));
                break;
            default:
                console.log('触发到其他类型', alias);
                break;
        }
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    .modal-plan-wrapper {
        @include utils-pierce(ivu-modal-body) {
            padding: 0;
            display: flex;
            .bm-map {
                width: 60%; height: 100%;
                min-height: 70vh;
                position: relative;
            }
            .device-container {
                width: 40%; height: 70vh;
                .device-tab {
                    width: 100%; height: 40px;
                    &-item {
                        width: 120px; height: 32px;
                        margin: 0 5px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    &-active-item {
                        background-color: #00BCD4;
                        color: #fff;
                    }
                }
                .device-search {
                    padding: 0 5px;
                    margin-bottom: 5px;
                }
                .device-data {
                    height: calc(100% - 77px);
                    position: relative;
                    &-tabs {
                        height: 100%;
                        &-item {
                            .ivu-tabs-content {
                                height: calc(100% - 52px);
                                position: relative;
                                .tabs-pane {
                                    flex-flow: row wrap;
                                    padding-bottom: 16px;
                                    height: calc(100% - 30px);
                                    overflow: auto;
                                    &-item {
                                        width: 145px; height: 40px;
                                        border: 1px solid #ddd;
                                        border-radius: 5px;
                                        margin: 5px 2px;
                                        padding: 0 5px;
                                        svg {
                                            min-width: 16px; height: 21px;
                                        }
                                        &-text {
                                            margin: 1px 2px 0 4px;
                                        }
                                    }
                                    &-more {
                                        width: 100%; height: 30px;
                                        position: absolute;
                                        bottom: 0;
                                        color: #515a6e;
                                        box-shadow: 0 0 10px 0 #ddd;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>