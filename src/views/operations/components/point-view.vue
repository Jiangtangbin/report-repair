<template>
        <bm-map v-on="$listeners" v-bind="mapStyles" @ready="onReady" :zoom="zoom">
        <slot />
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
        <!-- 右键菜单 -->
        <!-- <context-menu>
            <context-item
                v-for="item of rightMenu"
                :callback="($event) => rightHandle(item.value, $event)"
                :key="item.value"
                :text="$te(item.title) ? $t(item.title) : item.title"
            />
        </context-menu> -->
    </bm-map>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import BmMap from '@/components/map/index.vue';
import HWrapper from '@/components/map/custom-overlays/wrapper.vue';
import dynamicImport from '@/utils/component-dynamic-import';
import MapType from '@/components/map/controls/map-type.vue';
// import ContextMenu from '@/components/map/context-menu/index.vue';
// import ContextItem from '@/components/map/context-menu/item.vue';
import { componentName } from '@/config/map';
import { isFunction, isString } from '@/utils/index';
import theme from '@/config/map-theme';
import { mapVersion } from '@/config/environment';

type Datum = Dictionary<any>;

/**
 * 地图样式, default: midnight, 官网默认提供以下几种样式
 * normal: 默认地图样式
 * light: 清新蓝风格
 * dark: 黑夜风格
 * redalert: 红色警戒风格
 * googlelite: 精简风格
 * grassgreen: 自然绿风格
 * midnight: 午夜蓝风格
 * pink: 浪漫粉风格
 * darkgreen: 青春绿风格
 * bluish: 清新蓝绿风格
 * grayscale: 高端灰风格
 * hardedge: 强边界风格
 */
/**
 * @desc: emit('mapReady', ev): 地图加载完成时触发
 *
 * @desc: emit('change', data): 标点发生改变时触发
 * @param {Object} data: 展示的标点(Record<API.PointType, any[]>)
 */
@Component({
    inheritAttrs: false,
    components: {
        BmMap,
        HWrapper,
        MapType,
        // ContextMenu,
        // ContextItem,
        ViewO: () => dynamicImport(() => import('@/components/point-views/org.vue')),
    },
})
export default class PointView extends Vue {
    constructor(...args: any[]) {
        super(...args);
    }

    @Prop({ type: [Object, String], required: true })
    center!: API.Location | string;
    @Prop(Number)
    zoom!: number;
    @Prop({ type: Array, default: () => (['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP', 'BMAP_SATELLITE_MAP']) })
    mapType!: string[];
    @Prop(Boolean)
    label?: boolean;
    @Prop(Boolean)
    autoViewport?: boolean;
    // 数据源
    @Prop({ type: Object, default: () => ({}) })
    data!: Dictionary<Datum[]>;
    // @Prop({ type: Array, default: () => markerRightMenu.map })
    // mapRightMenu!: { title: string; value: string; require?: string }[];
    // 右键菜单处理的事件, 返回值不为 true 时, 继续执行当前定义的方法
    // @Prop(Function)
    // rightHandleFunc?: (value: string, ev: baiduMap['event']) => boolean | void;
    // 条件 -> { d: { sub_category: ['videoin', 'smoke'], isonline: 1 }}
    @Prop({ type: Object, default: () => ({}) })
    condition!: Dictionary<any>;
    // 多维度条件 -> { d: [[{ sub_category: 'videoin' }, { isonline: 1 }]] }
    @Prop({ type: Object, default: () => ({}) })
    prefixCondition!: Dictionary<Dictionary<any>[][]>;
    // 地图样式
    @Prop({ type: Object })
    mapStyle!: Record<string, any>;
    // 是否显示所属租户对应的网格
    @Prop({ type: Boolean, default: true })
    isShowGrid!: Boolean;
    // 点击事件是否触发信息窗口, 而非详情页面
    @Prop({ type: [Boolean, Function] })
    isInfoWindow!: boolean | ((field: string, key: string) => boolean);

    map: baiduMap['map'] | null = null;
    BMap: baiduMap['BMap'] | null = null;
    mapVersion = mapVersion;

    // 通过属性绑定, 防止 mapStyle 为空对象时, 自定义百度地图无法显示到 19 级
    get mapStyles() {
        const { mapStyle } = this;
        return mapVersion === '3.0'
            ? {}
            : { mapStyle };
    }
    // 右键菜单处理（分为在线地图与离线地图）
    // get rightMenu() {
    //     const { mapRightMenu } = this;
    //     return mapRightMenu;
    // }

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
    // 获取标点展示的类型
    getPointKey(type: string) {
        const result = componentName.find(([reg]) => reg.test(type));
        return result ? result[1] : type;
    }
    /**
     * @description: 标点数量发生改变
     * @param {Number} cnt: 当前显示的标点数量
     * @param {String} field: 当前标点数量发生变化的类型
     */
    markerChange(cnt: number, field: string) {
        this.$emit('markerChange', cnt, field);
    }
    /**
     * @description: 是否显示 infoWindow
     * @param {String} key: 标点的 key
     * @param {String} field: 标点实际显示的类型
     */
    getInfoWindowStatus(key: string, field: string): boolean {
        const { isInfoWindow } = this;
        return isFunction(isInfoWindow)
            ? isInfoWindow(field, key)
            : isInfoWindow;
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
}
</script>
