<template>
    <div>
        <v-contextmenu ref="contextmenu">
            <template v-for="item of rightMenu">
                <v-contextmenu-item
                    v-if="hasRendering(item, rightHandleValue)"
                    @click="markersMenu($event, item.value, rightHandleValue)"
                    :key="item.value"
                >{{ $te(item.title) ? $t(item.title) : item.title }}</v-contextmenu-item>
            </template>
        </v-contextmenu>
        <h-ripple :datum="alarmMarkers" />
        <h-marker
            @showMarker="genAlarmPoint"
            @click="handle"
            @contextmenu="rightClick"
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
import bus from '@/utils/bus';
import { isObject, isFunction } from '@/utils';
import { orgHandle } from '@/mixins/map';

type Datum = any;

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
export default class ViewOrg extends Mixins(Middleware, Base, MapRightEvent) {
    $refs!: {
        contextmenu: any;
    }

    // 在列表中的字段
    @Prop({ type: String, default: 'o' })
    field!: string;
    // marker 中 icon 的 x 轴
    @Prop({ type: String, default: 'normal' })
    offsetX!: string;
    // marker 中 icon 的 y 轴
    @Prop(String)
    offsetY!: string;
    // 右键菜单数据源
    @Prop({ type: String, default: 'o' })
    rightKey!: 'o' | 'lk';
    // 由外部定义点击事件
    @Prop(Function)
    orgClick?: (data: Datum, i: number, ev: ZRender['event']) => void;
    // 点击事件是否触发信息窗口, 而非详情页面
    @Prop(Boolean)
    isInfoWindow?: boolean;

    rightHandleValue: Datum = {} as Datum; // 右键菜单点击的数据

    // 获取标点
    get usableMarkers(): Datum[] {
        const { data, field, condition, prefixCondition } = this;
        const _data = isObject(data) ? (data as any)[field] : data;
        if (!_data) return [];
        return _data.reduce((prev: Dictionary<any>[], cur: Dictionary<any>) => {
            cur.lng && cur.lat && this.isMatchCondition(cur, condition) && this.isMatchMultipleCondition(cur, prefixCondition) && prev.push(cur);
            return prev;
        }, []);
    }
    // 右键菜单
    get rightMenu() {
        const { markerRightMenu, rightKey } = this;
        return markerRightMenu[rightKey];
    }

    created() {
        bus.$on('on-alarm', this.setAlarms);
        bus.$on('on-unalarm', this.setAlarms);
    }
    beforeDestroy() {
        bus.$on('on-alarm', this.setAlarms);
        bus.$on('on-unalarm', this.setAlarms);
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
            offset: { width: iconX[offsetX as 'normal'], height: iconY[offsetY as 'o'] || iconY[data.orgnature as 'o'] || iconY[data.orgattr as 'o'] },
        };
    }
    /**
     * @description: 设置报警状态
     * @param {String} type: 报警的类型
     * @param {String} unique: 唯一值 -> 设备取的是 flag
     * @param {Number} isalarm: 设置的状态
     * @param {Number | String} org_id: 所属机构 id
     */
    setAlarms(type: string, unique: string | number, isalarm: number, org_id: number | string) {
        const { data, field } = this;
        const _data = isObject(data) ? (data as any)[field] : data;
        if (type === 'o' && _data) {
            /* eslint-disable eqeqeq */
            const status = _data.some((item: any) => (item.id == unique) && Object.assign(item, { isalarm }));
            /* eslint-enable eqeqeq */
            status && this.$emit('update');
        }
        else if (type === 'd' && org_id && _data) {
            /* eslint-disable eqeqeq */
            const status = _data.some((item: any) => {
                const isMatch = item.id == org_id;
                if (isMatch) {
                    item.alarmdevice += isalarm;
                    const _isalarm = isalarm ? 1 : item.alarmdevice - 1 > 0 ? item.alarmdevice - 1 : 0;
                    Object.assign(item, { isalarm: _isalarm });
                }
                return isMatch;
            });
            /* eslint-enable eqeqeq */
            status && this.$emit('update');
        }
    }
    // 点击事件
    handle(data: Datum, i: number, ev: ZRender['event']) {
        const { isInfoWindow, field } = this;

        isFunction(this.orgClick)
            ? this.orgClick(data, i, ev)
            : isInfoWindow
                ? this.$emit('handle', data, field)
                : this.markersMenu('', 'details', data);
    }
    // 右键事件
    rightClick(data: Datum, type: string, ev: ZRender['event']) {
        this.rightHandleValue = data;
        // this.$set(this, 'rightHandleValue', data);
        this.$refs.contextmenu.show({ left: ev.event.clientX, top: ev.event.clientY });
        ev.event.preventDefault();
        ev.event.stopPropagation();
    }
    /**
     * @description: 右键事件
     * @param {Object} event: 地图事件
     * @param {String} type: 右键的类型
     * @param {Object} data: 自定义信息
     */
    async markersMenu(event: string, type: string, data: any) {
        orgHandle.call(this, type, data);
    }
}
</script>
