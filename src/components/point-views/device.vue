<template>
    <div>
        <v-contextmenu ref="contextmenu">
            <template v-for="item of putPoint ? rightMenu : menus">
                <v-contextmenu-item
                    v-if="hasRendering(item, rightHandleValue)"
                    @click="markersMenu($event, item.value)"
                    :key="item.value"
                >{{ $te(item.title) ? $t(item.title) : item.title }}</v-contextmenu-item>
            </template>
        </v-contextmenu>
        <h-ripple :datum="alarmMarkers" />
        <h-marker
            @showMarker="genAlarmPoint"
            @click="handle"
            @mousedown="movePoint"
            @mouseup="liftPoint"
            @contextmenu="rightClick"
            @clickNumber="showMarkers"
            @deleteSuccess="putPoint && $emit('deleteSuccess')"
            :datum="usableMarkers"
            :getIconInfo="getIconInfo"
            :label="label"
            :space="space"
            show-key="name"
        />
    </div>
</template>

<script lang="ts">
import { Prop, Watch, Mixins, Component } from 'vue-property-decorator';
import HMarker from '@/components/map/custom-overlays/marker.vue';
import HRipple from '@/components/map/custom-overlays/ripple.vue';
import Middleware, { Base, MapRightEvent } from '@/base-class/map';
import { senseAlias } from '@/config/map';
import { deviceHandle } from '@/mixins/index';
import bus from '@/utils/bus';
import { isObject } from '@/utils/index';
import { getRightMenu, mapDeviceHandle } from '@/mixins/map';

type Datum = API.Response['DeviceInfo'];

/**
 * @description: 触发事件
 * @emit ('markerChange', len, field) 标点长度更新事件
 * @param {Number} len: 标点数量
 * @param {String} field: 更改的标点类型
 * @emit ('handle', data, field) 标点点击事件
 * @param {Object} data: 点击的标点信息
 * @param {String} field: 点击的标点类型
 */
@Component({
    components: {
        HMarker,
        HRipple,
    },
})
export default class ViewDevice extends Mixins(Middleware, Base, MapRightEvent) {
    $refs!: {
        contextmenu: any;
    }

    // 在列表中的字段
    @Prop({ type: String, default: 'd' })
    field!: string;
    // marker 中 icon 的 x 轴
    @Prop(String)
    offsetX!: string;
    // marker 中 icon 的 y 轴
    @Prop(String)
    offsetY!: string;
    // 点击事件是否触发信息窗口，而非详情页面
    @Prop(Boolean)
    isInfoWindow?: boolean;
    // 是否是布点
    @Prop({ type: Boolean, default: false })
    putPoint!: boolean;
    // 离线地图的 id
    @Prop({ type: Number, default: 0 })
    mapId?: number;

    menus: { title: string; value: string; require?: string; }[] = []; // 右键菜单数据
    rightHandleValue: Datum = {} as Datum; // 右键菜单点击的数据

    // 获取标点
    get usableMarkers(): Datum[] {
        const { data, field, condition, prefixCondition } = this;
        const _data = isObject(data) ? (data as any)[field] : data;
        if (!_data) return [];
        return _data.reduce((prev: Datum[], cur: Datum) => {
            cur.lng && cur.lat && this.isMatchCondition(cur, condition) && this.isMatchMultipleCondition(cur, prefixCondition) && prev.push(cur);
            return prev;
        }, []);
    }
    // 右键菜单
    get rightMenu() {
        const { data, markerRightMenu: { d }, putPoint } = this;
        if (data[0]) {
            // 区分平面图布点和在线地图的右键菜单
            const category = d[data[0].category][data[0].sub_category] || d[data[0].category]['default'] || d['default'];
            const handleMenus = category ? category.filter(v => putPoint || v.value !== 'dragging' && v.value !== 'delete') : d[data[0].category].filter(v => putPoint || v.value !== 'dragging' && v.value !== 'delete');
            return handleMenus;
        }
    }
    // 获取报警的标点
    // get alarmMarkers(): Pick<Datum, 'lng' | 'lat'>[] {
    //     const { usableMarkers } = this;
    //     const result: Pick<Datum, 'lng' | 'lat'>[] = [];
    //     usableMarkers.every(({ lng, lat, isalarm }) => {
    //         isalarm && result.push({ lng, lat });
    //         return true;
    //     });
    //     return result;
    // }

    created() {
        bus.$on('on-alarm', this.setAlarms);
        bus.$on('on-unalarm', this.setAlarms);
        bus.$on('on-online', this.setIsOnline);
    }
    beforeDestroy() {
        // const { data, field } = this;
        // const _data = isObject(data) ? (data as any)[field] : data;
        // this.$emit('markerChange', _data.length, field);
        bus.$on('on-alarm', this.setAlarms);
        bus.$on('on-unalarm', this.setAlarms);
        bus.$on('on-online', this.setIsOnline);
    }

    @Watch('usableMarkers.length', { immediate: true })
    markerNumUpdate(val: number) {
        const { field } = this;
        this.$emit('markerChange', val, field);
    }

    // 获取标点的图标
    getIconInfo(data: Datum) {
        const { spriteIcon, originalSize, size, iconX, iconY, offsetX, offsetY } = this;

        return {
            image: spriteIcon,
            originalSize,
            size,
            offset: { width: iconX[(offsetX || data.isonline) as 1], height: iconY[(offsetY || senseAlias[data.sub_category as '1'] || data.sub_category) as 'wsSense'] },
        };
    }
    /**
     * @description: 设置报警状态
     * @param {String} type: 报警的类型
     * @param {String} unique: 唯一值 -> 设备取的是 flag
     * @param {Number} isalarm: 设置的状态
     */
    setAlarms(type: string, unique: string | number, isalarm: number) {
        const { data, field } = this;
        const _data = isObject(data) ? (data as any)[field] : data;
        if (type === 'd' && _data) {
            const status = _data.some((item: any) => (item.flag === unique) && Object.assign(item, { isalarm }));
            status && this.$emit('update');
        }
        if (type === 'o' && _data) {
            _data.every((item: any) => {
                item.org_id == unique && Object.assign(item, { isalarm });
                return true;
            });
            this.$emit('update');
        }
    }
    /**
     * @description: 设置在线状态
     * @param {String} uuid: 设备序列号
     * @param {String} t: 状态(on | off)
     */
    setIsOnline({ uuid, t }: { uuid: string; t: 'on' | 'off' }) {
        const { data, field } = this;
        const _data = isObject(data) ? (data as any)[field] : data;
        _data && ((_data.find((v: any) => v.uuid === uuid) || {}).isonline = Number(t === 'on'));
        this.$emit('update');
    }
    // 点击事件
    handle(data: Datum) {
        const { isInfoWindow, field } = this;
        isInfoWindow
            ? this.$emit('handle', data, field)
            : deviceHandle.call(this, 'details', data);
    }
    // 右键事件
    rightClick(data: Datum, type: string, ev: ZRender['event']) {
        // @ts-ignore
        const { putPoint, mapId, field } = this;
        let hanldeData = data;
        // 区分布点平面图还是在线地图
        if (putPoint) {
            hanldeData.putPoint = putPoint;
            hanldeData.map_id = mapId;
            hanldeData.field = field;
        } else {
            this.menus = getRightMenu(`${data.category}${data.sub_category}`, 'd', data.category, data.sub_category);
        }
        this.rightHandleValue = hanldeData;
        // this.$set(this, 'rightHandleValue', data);
        this.$refs.contextmenu.show({ left: ev.event.clientX, top: ev.event.clientY });
        ev.event.preventDefault();
        ev.event.stopPropagation();
    }
    // 显示多个点
    showMarkers(data: Datum[]) {
        bus.$getDynamicComponent('nearby', () => {
            bus.$createNearbyHandle({
                data: { d: data },
                $events: this.$listeners,
            }).show();
        });
    }
    /**
     * @description: 右键事件
     * @param {Object} event: 地图事件
     * @param {String} type: 右键的类型
     * @param {Object} data: 自定义信息
     */
    async markersMenu(event: MouseEvent, type: string) {
        const data = this.rightHandleValue;
        mapDeviceHandle.call(this, type, data);
    }
}
</script>