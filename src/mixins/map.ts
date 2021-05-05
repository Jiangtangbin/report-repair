import { Prop, Component, Vue } from 'vue-property-decorator';
import { appModule, userModule } from '@/store/index';
import { getOfflineMarkers, getOffLineTree } from '@/config/api';
import { mapStoragePrefix, pointType } from '@/config/index';
import { isArray, isFunction, isObject, getMatch, getStorage, setStorage, cacheCalc } from '@/utils';
import { openList, genMenu, IPointMenu, IPointMenuOption } from './index';
import { markerRightMenu, senseAlias } from '@/config/map';
import { autoViewport } from '@/config/environment';
import { getRight } from '@/utils/utils';
import { recursion } from '@/utils/index';
import deepmerge from 'deepmerge';
import { i18n } from '@/locale/index';

// alramdevice 字段转义称 isalarm
const tranferAlarmdevice = ['o', 'ap', 'mp', 'p'];

type PointMenuDatum = {
    title: string;
    value: string;
    icon?: string;
    status: boolean;
    cnt: number;
    _cnt: number;
};
type StorageType = 'viewport' | 'markerKeys' | 'markersCondition' | 'markersCommonCondition' | 'prefixMarkerCondition' | 'markerMenuDatum' | 'fullScreen' | 'isShowGroup' | 'isShowPlanGroup' | 'initialDeviceGroup';
type Datum = any;

/**
 * @description: 地图运维
 */
@Component
export class MapLayout extends Vue {
    // 权限参数
    @Prop({ type: String, default: '' })
    authKey!: string;
    // 当前所属 plat
    @Prop({ type: String, default: '' })
    plat!: string;
    // 隐藏 auth
    @Prop(Boolean)
    tagHide?: boolean;
    // 地图存储信息的 key
    @Prop({ type: String, default(this: Vue) { return this.$options.name || '' } })
    storagename!: string;

    // 地图加载状态
    loading = false;
    // 请求标点是否要处理，同时也会处理条件
    // false(以中划线切割，取下标 0) -> d-sub_category-mobile -> d
    // true(保持原样) -> d-sub_category-mobile -> d-sub_category-mobile
    isHold = false;
    map: baiduMap['map'] | null = null;
    BMap: baiduMap['BMap'] | null = null;
    // 显示的图表
    charts: ResponseMap.YiWuGisChart['chart'] = [];
    // 是否允许保存当前地图信息
    allowSavedLayout = false;
    // 权限标签页
    auth: { title: string; value: string }[] = [];
    // 是否全屏
    fullScreen = false;
    mainComponent = 'point-view';
    // 地图地址搜索
    search = {
        keyword: '',
        label: false,
        value: false,
    };
    // 是否显示分组菜单
    isShowGroup = false;
    //是否显示平面图菜单
    isShowPlanGroup = false;
    // 初始选中的设备分组
    initialDeviceGroup: number[] = [];
    // 展示的标点字段集合
    showMarkerKeys: string[] = [];
    // 标点菜单 -> 常用菜单(上方)
    markerMenuDatum: IPointMenu[] = [];
    // 标点菜单 -> 总菜单(下方)
    pointMenuDatum: PointMenuDatum[] = [];
    // 标点菜单大类条件(针对下方的菜单) -> { d: {} }
    markersCommonCondition: Dictionary<any> = {};
    // 平面图菜单
    planDatum = [
        {
            id: undefined,
            expand: true,
            name: '在线地图',
            title: '在线地图',
            value: undefined,
        },
    ];
    // 离线地图
    offMapImg = '';
    // 离线地图 id
    offMapId = 0;
    // 离线地图标点数据
    offMarkers = [];
    // 标点细化菜单条件(做比重区分，常用的条件比重更高，针对上方的菜单) -> { d: {}, d-sub_category: {} }
    markersCondition: Dictionary<any> = {};
    // 当符合前置条件时，再匹配后面的条件 -> { d: [[{ sub_category: 'smoke' }, { isonline: 1 }], [...]] }
    prefixMarkerCondition: Dictionary<Dictionary<any>[][]> = {};
    // 标点数据
    markers: Dictionary<ResponseMap.AllMarkers[]> = {};
    // 是否自适应地图
    autoViewport: boolean = autoViewport;

    get isMobile() {
        return appModule.isMobile;
    }
    // 地图中心点
    get mapConfig() {
        const { center, zoom } = userModule;
        return { center, zoom };
    }
    // 地图是否加载完成
    get mapReady(): boolean {
        const { map, BMap } = this;
        return !!(map && BMap);
    }
    // 保存地图信息的 key
    get storageUniqueKey(): string {
        const { storagename, plat } = this;
        const { id } = userModule.user.info;
        return `${mapStoragePrefix}-${storagename || ''}-${plat || ''}-${id}`;
    }
    // 显示的图表数据
    get chartArr(): ResponseMap.YiWuGisChart['chart'][] {
        const { charts } = this;
        return charts.length
            ? [charts.slice(0, 3), charts.slice(3)]
            : [];
    }
    // 是否显示两侧的图表
    get showChart(): boolean {
        const { isMobile, fullScreen, chartArr } = this;
        return !!chartArr.length && !(isMobile || fullScreen);
    }
    // 可显示的常用菜单集合
    get showMenus() {
        const { markerMenuDatum } = this;
        return markerMenuDatum.filter(v => v.status);
    }
    // 标点的通用条件，外部实现，内部占个位
    get commonCondition(): Dictionary<any> {
        return {};
    }
    // 返回 marker 的条件
    get genCondition() {
        const { markers, commonCondition, markersCommonCondition, markersCondition } = this;
        const result: Dictionary<any> = {};
        const keys: string[] = ([markers, commonCondition, markersCommonCondition, markersCondition] as any[]).reduce((prev, v) => {
            v && prev.push(...Object.keys(v));
            return prev;
        }, []);

        // 防止 markers 为空时，条件不回填的问题
        [...new Set(keys)].every(k => {
            const [type] = k.split('-');
            result[k] = deepmerge.all([
                commonCondition || {},
                markersCommonCondition[type] || {},
                markersCondition[k] || {},
            ]);
            return true;
        });
        return result;
    }
    // 展示的标点
    get showMarkers(): MapLayout['markers'] {
        const { showMarkerKeys, markers } = this;
        // 用 showMarkerKeys concat 一层是为了
        // 防止标点混合显示时，标点可能无法显示的问题
        // 显示 d，再显示 d-category-video，再隐藏 d
        // 视频设备无法显示
        const keys = [...new Set(showMarkerKeys.concat(showMarkerKeys.map(this.getMarkerKey)))];
        return keys.reduce((prev, k) => {
            const _k = this.getMarkerKey(k);
            prev[_k] || (prev[_k] = []);
            if (prev[_k].length) {
                if (markers[k]) {
                    prev[_k] = markers[k].length > prev[_k].length
                        ? markers[k].concat(prev[_k])
                        : prev[_k].concat(markers[k]);
                }
            }
            else {
                prev[_k] = markers[k] || [];
            }
            return prev;
        }, {} as MapLayout['markers']);
    }

    /**
     * @description: 重置数据
     */
    resetDatum() {
        this.$set(this, 'markers', {});
        this.$set(this, 'markersCondition', {});
        this.$set(this, 'markersCommonCondition', {});
        this.$set(this, 'prefixMarkerCondition', {});
        this.pointMenuDatum = [];
        this.markerMenuDatum = [];
        this.showMarkerKeys = [];
        this.initialDeviceGroup = [];
    }
    /**
     * @description: 对标点的 key 进行处理
     * @param {string} value: 处理的值
     */
    getMarkerKey(value: string): string {
        const { isHold } = this;
        return isHold ? value : value.split('-')[0];
    }
    /**
     * @description: 获取页面权限
     * @param {String} key?: 获取的值
     */
    getAuth(key?: string) {
        const { authKey } = this;
        const value = key || authKey;
        const result = getMatch(userModule.user.auth, { value });
        if (!(result && result.children)) return false;
        const auth = this.auth = result
            .children!
            .map(({ value, title }) => ({ value, title }));
        if (!auth.length) return false;
    }
    /**
     * @description: 生成常用菜单(上方)
     * @param {String} type: 类型
     */
    genMarkerMenu(type: string) {
        const _menu = genMenu(type);
        this.markerMenuDatum = _menu ? [_menu] : [];
    }
    /**
     * @description: 生成标点菜单 -> 下方
     * @param {Array} data: 数据源
     */
    genPointMenuDatum(data: ResponseMap.YiWuGisChart['points']) {
        this.pointMenuDatum = data
            .map(({ title, value, ...args }) => ({
                ...(pointType[value as 'd'] || {}),
                cnt: 0,
                _cnt: args.cnt || 0,
                title,
                value,
                status: this.getAppointTypeStatus(value),
                ...args,
            }));
    }
    /**
     * @description: 获取指定标点类型的显示状态(下方总菜单)
     * @param {String} type: 标点类型
     */
    getAppointTypeStatus(type: string) {
        const { storageUniqueKey } = this;
        const content = getStorage(storageUniqueKey) || {};
        const keys: string[] = content.markerKeys || [];

        return keys.some(k => this.getMarkerKey(k) === type);
    }
    /**
     * @description: 获取标点
     * @param {String} t: 请求的类型
     * @param {Object} parameter: 请求传给后台的参数
     */
    async getMarker(t: string, parameter: Dictionary<string | number | (string | number)[]>) {
        this.$Notice.open({ title: i18n.t('h.tips.notMarkerRequest') as string });
        throw new Error(i18n.t('h.tips.notMarkerRequest') as string);
    }
    /**
     * @description: 全屏点击事件(图表显隐)
     */
    toggleFullScreen() {
        const { fullScreen } = this;
        this.fullScreen = !fullScreen;
        this.saveLayout('fullScreen', !fullScreen);
    }
    /**
     * @description: 常用菜单点击事件(显隐)
     */
    toggleMenu() {
        const { showMenus: { length }, markerMenuDatum } = this;
        markerMenuDatum.every(v => {
            v.status = !length;
            return true;
        });
        this.saveLayout('markerMenuDatum', this.getMenuStatus(markerMenuDatum));
    }
    /**
     * @description: 常用菜单(标点)全选事件
     * @param {string[]} checked: 选中(取消)的值
     * @param {Object} condition: 选中的条件
     * @param {String} type: 选中的类型
     * @param {Boolean} status: 全选状态
     */
    async checkAllToggle(checked: string[], condition: Dictionary<any>, type: string, status: boolean) {
        if (status) {
            await Promise.all([
                ...new Set(checked.map(this.getMarkerKey)),
            ].map(k => this.actuateRequestMarkers(k)));
        }
        checked.every(value => {
            this.pointMenuChange({ value } as IPointMenuOption, condition[value], status);
            return true;
        });
    }
    /**
     * @description: 常用菜单(标点)点击事件
     * @param {Object} data: 点击项
     * @param {Object} condition: 搜索条件
     * @param {Boolean} status: 选中状态
     */
    async pointMenuChange(data: IPointMenuOption, condition: Dictionary<any>, status: boolean) {
        const { markerMenuDatum } = this;
        const value = data.value;
        status && await this.actuateRequestMarkers(value);
        this.setMarkerKey(value, status);
        this.setMarkerCondition(data, condition, status);
        this.saveLayout('markerMenuDatum', this.getMenuStatus(markerMenuDatum));
    }
    /**
     * @description: 下方控制按钮点击事件
     * @param {Object} data: 点击项数据
     */
    pointControlChange(data: { value: string; status: boolean }) {
        const { value, status } = data;

        this.setMarkerKey(value, status);
        status && this.actuateRequestMarkers(value);
    }
    /**
     * @description: 分组菜单控制按钮点击事件(显隐)
     */
    toggleDeviceGroup() {
        const { isShowGroup } = this;
        this.isShowGroup = !isShowGroup;
        this.saveLayout('isShowGroup', !isShowGroup);
    }
    /**
     * @description: 设备分组选中(取消)事件
     * @param {Array} indeterminateAndChecked: 已选中(包含半选中)的设备分组 id 集合
     * @param {Array} checked: 已选中的设备分组 id 集合
     * @param {Object} item: 当前点击项
     */
    checkChange(indeterminateAndChecked: number[], checked: number[], item: Record<string, any>) {
        const { markersCommonCondition } = this;
        item.checked && this.actuateRequestMarkers(`d-groups-${item.id}`);
        this.$set(markersCommonCondition, 'd', {
            ...(markersCommonCondition.d || {}),
            groups: indeterminateAndChecked,
        });
        // -group 用来与 d 做区分
        this.setMarkerKey(`d-groups-${item.id}`, item.checked);
        this.saveLayout({ initialDeviceGroup: checked, markersCommonCondition });
        // 上面是设备分组父子不关联的操作，下面是父子关联的操作
        // src\components\device-group-menu\index.vue 必须同时修改
        // const { markersCommonCondition } = this;
        // indeterminateAndChecked.length && this.actuateRequestMarkers('d');
        // this.$set(markersCommonCondition, 'd', {
        //     ...(markersCommonCondition.d || {}),
        //     groups: indeterminateAndChecked,
        // });
    }
    /**
     * @description: 平面图分组菜单控制按钮点击事件(显隐)
     */
    togglePlanGroup() {
        const { isShowPlanGroup } = this;
        this.isShowPlanGroup = !isShowPlanGroup;
        this.saveLayout('isShowPlanGroup', !isShowPlanGroup);
    }
    /**
     * @description: 平面图分组选中(取消)事件
     */
    planChange(indeterminateAndChecked: number[], checked: number[], item: Record<string, any>) {
        const { map, BMap } = this;
        const { checked: selected, id, value } = item;
        this.offMapImg = selected ? value : '';
        this.offMapId = selected ? id : 0;
        if (selected && this.offMapId) {
            const { lnglat } = userModule.user;
            map && BMap && lnglat.lng && lnglat.lat && setTimeout(() => {
                map.panTo(new BMap.Point(lnglat.lng, lnglat.lat));
            }, 200);
            this.planDatum = [
                {
                    id: undefined,
                    expand: true,
                    name: '在线地图',
                    title: '在线地图',
                    value: undefined,
                },
            ];
            this.getPlanGroup();
            this.getMarkers(this.offMapId);
        }
    }
    /**
     * @description: 离线平面图分组选中事件
     * @param {Array} data: 选中的数据
     */
    offPlanChange(data: any) {
        if (!data[0]) return false;
        const { map, BMap } = this;
        const { selected, id, value } = data[0] && data[0];
        if (id === this.offMapId) return false;
        if (!id) {
            const { lnglat } = userModule.user;
            map && BMap && lnglat.lng && lnglat.lat && setTimeout(() => {
                map.panTo(new BMap.Point(lnglat.lng, lnglat.lat));
            }, 200);
        }
        this.offMapImg = selected ? value : '';
        this.offMapId = selected ? id : 0;
        selected && this.offMapId && this.getMarkers(this.offMapId);
    }
    /**
     * @description: 获取平面图分组
     */
    async getPlanGroup() {
        const { type, data } = await getOffLineTree();
        if (!type) {
            recursion(data, v => {
                v.expand = true;
                v.selected = v.id === this.offMapId;
                v.title = v.name;
                v.value = v.img;
            });
            this.planDatum.push(...data);
        }
    }
    /**
     * 获取离线地图标点
     */
    async getMarkers(id: number) {
        const { offMarkers, BMap } = this;
        const { type: types, data } = await getOfflineMarkers(id);
        if (!types) {
            // 新增字段
            Object.entries(data).some(([key, cate]) => cate.some((item, index) => {
                Object.assign(item, { infoWindow: false, dragging: false, isshow: false, onlineLocation: false, moveFinish: true, paths: [new BMap.Point(item.lng, item.lat)], parseAlarmdevice: item.alarmdevice ? '报警中' : '正常', color: undefined });
                // 为单位增加 isalarm 字段
                tranferAlarmdevice.includes(key) && (item.isalarm = Number(!!item.alarmdevice));
                // 对设备的传感器类型图标进行处理
                key === 'd' && item.category === 'sense' && (item.alias = senseAlias[item.sub_category as '1']);
                if (key === 'lk') {
                    item.xzrange && (item.xzrange = JSON.parse(item.xzrange));
                    item.orglist.some(org => void Object.assign(org, { infoWindow: false, dragging: false, isshow: false, parseAlarmdevice: item.alarmdevice ? '报警中' : '正常' }));
                } else if (key === 'gd') {
                    item.points = item.points && JSON.parse(item.points);
                }
            }));
            Object.entries(data).some(([key, values]) => void this.$set(offMarkers, key, values));
            return true;
        }
    }
    /**
     * @description: 判断是否需要请求剩余的标点，有则请求
     * @param {String} type: 请求标点的类型
     */
    async actuateRequestMarkers(type: string) {
        const { plat, isHold, markers } = this;
        const point_t = this.getMarkerKey(type);
        const [, k, v] = type.split('-');
        const params = isHold ? { [k]: v } : {};
        // (全匹配或者 point_t 匹配)且长度为真则不请求
        if (
            (markers[point_t] && markers[point_t].length) ||
            (markers[type] && markers[type].length)
        ) return;
        await this.getMarker(type, { plat, point_t, ...params, ...this.getMarkerParameter() });
    }
    /**
     * @description: 请求标点时额外携带的参数
     */
    getMarkerParameter(): Dictionary<any> {
        return {};
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
    }
    /**
     * @description: 设置标点条件 -> 用于常用菜单
     * @param {Object} data: 标点点击项
     * @param {Object} condition: 条件
     * @param {Boolean} status: 标点显示状态
     */
    setMarkerCondition(data: IPointMenuOption, condition: Dictionary<any>, status: boolean) {
        const { markersCondition, prefixMarkerCondition } = this;
        const [value, key, val] = data.value.split('-');
        // data.isStatus 为真时，说明存在前置条件
        if (data.isStatus) {
            const multipleDimensionCondition = [{ [key]: val }, condition];
            if (isArray(prefixMarkerCondition[value])) {
                // 先判断 d 是否存在，再判断前置条件是否存在，再进行对应的调整
                const index = prefixMarkerCondition[value].findIndex(([v]) => v[key] === val);
                status
                    ? index !== -1
                        ? prefixMarkerCondition[value].splice(index, 1, multipleDimensionCondition)
                        : prefixMarkerCondition[value].push(multipleDimensionCondition)
                    : index !== -1 && prefixMarkerCondition[value].splice(index, 1);
            }
            else {
                // 不存在前置条件且为增加条件时，设置前置条件
                status && this.$set(prefixMarkerCondition, value, [multipleDimensionCondition]);
            }

            // 保存前置条件
            this.saveLayout('prefixMarkerCondition', prefixMarkerCondition);
        }
        else if (key) {
            // 自带条件的 key -> d-sub_category-mobile
            if (markersCondition[value] && markersCondition[value][key]) {
                const index = markersCondition[value][key].indexOf(val);
                status
                    ? index === -1 && markersCondition[value][key].push(val)
                    : index !== -1 && markersCondition[value][key].splice(index, 1);
            }
            else {
                status && this.$set(markersCondition, value, { ...(markersCondition[value] || {}), [key]: [val] });
            }
            this.saveLayout('markersCondition', markersCondition);
        }
        else {
            this.$set(markersCondition, value, condition);
            this.saveLayout('markersCondition', markersCondition);
        }
    }
    /**
     * @description: 标点数量调整(调整下方的总菜单的数量)
     * @param {Number} total: 标点总数
     * @param {String} value: 一级标点类型
     * @param {Boolean} isBack?: 是否回填 _cnt
     */
    markerCountChange(total: number, value: string, isBack?: boolean) {
        const { pointMenuDatum } = this;
        const result = pointMenuDatum.find(v => v.value === value);
        result && (result.cnt = (isBack && result._cnt) || total);
    }
    /**
     * @description: 标点筛选事件
     * @param {String} key: 保存的键
     * @param {Object} value: 保存的值
     */
    querySearch(key: string, value: Dictionary<any>) {
        const { markersCommonCondition } = this;
        this.$set(markersCommonCondition, key, value);
        this.saveLayout('markersCommonCondition', markersCommonCondition);
    }
    // 查看常用地址
    openUsualList() {
        const { map, BMap } = this;
        if (!(map && BMap)) return this.$Message.info(i18n.t('h.tips.mapNotLoading'));
        this.$getDynamicComponent('usualAddressList', () => {
            this.$createUsualAddressListHandle({
                $events: {
                    success(data: ResponseMap.UsualAddressList) {
                        map.centerAndZoom(new BMap.Point(data.lng, data.lat), data.zoom);
                    },
                },
            // @ts-ignore
            }).show();
        });
    }
    /**
     * @description: 存储地图信息(中心点-zoom)
     */
    saveMapInfo() {
        const { map } = this;
        if (!map) return;
        const viewport = map.getViewport();
        this.saveLayout('viewport', viewport);
    }
    /**
     * @description: 存储地图信息
     * @param {String} type: 存储的类型
     * @param {any} value: 存储的值
     */
    saveLayout(type: Partial<Record<StorageType, any>>): void
    saveLayout(type: StorageType, value: any): void
    saveLayout(type: StorageType | Dictionary<any>, value?: any) {
        const { storageUniqueKey, allowSavedLayout } = this;
        if (!allowSavedLayout) return;
        const params = isObject(type) ? type : { [type]: value };
        const oldDatum = getStorage(storageUniqueKey) || {};
        setStorage(storageUniqueKey, {
            ...oldDatum,
            ...params,
        });
    }
    /**
     * @description: 恢复地图布局
     */
    restoreLayout(callback?: (data: Dictionary<any>) => void) {
        // allowSavedLayout: 是否允许保存布局
        // 初始为 false，防止地图加载失败后，用户仍有操作导致特殊的错误
        // 进入该函数后，则为 true，防止用户第一次操作无法保存数据
        // 恢复布局时为 false 防止导致重复执行保存函数
        // 恢复完成后为 true，允许用户保存
        const { map, BMap, storageUniqueKey } = this;
        const content = getStorage(storageUniqueKey);
        this.allowSavedLayout = true;
        if (!(content && map && BMap)) return;
        this.allowSavedLayout = false;
        // 恢复允许显示的标点
        if (content.markerKeys) {
            const keys = content.markerKeys;
            this.showMarkerKeys = keys;
            this.restoreMarker(keys);
        }
        // 恢复地图视野
        if (content.viewport) {
            const { center: { lng, lat }, zoom } = content.viewport;
            setTimeout(() => {
                map.centerAndZoom(new BMap.Point(lng, lat), zoom);
            }, 1000);
        }
        // 恢复常用菜单的状态
        setTimeout(() => {
            content.markerMenuDatum &&
                this.setMenuStatus(content.markerMenuDatum, this.markerMenuDatum);
        });
        // 恢复标点的条件
        content.markersCommonCondition &&
            this.$set(this, 'markersCommonCondition', content.markersCommonCondition);
        content.markersCondition &&
            this.$set(this, 'markersCondition', content.markersCondition);
        // 恢复是否全屏
        content.hasOwnProperty('fullScreen') &&
            (this.fullScreen = content.fullScreen);
        // 恢复设备分组
        content.hasOwnProperty('isShowGroup') &&
            (this.isShowGroup = content.isShowGroup);
        // 恢复平面图分组
        content.hasOwnProperty('isShowPlanGroup') &&
            (this.isShowPlanGroup = content.isShowPlanGroup);
        content.initialDeviceGroup &&
            (this.initialDeviceGroup = content.initialDeviceGroup);
        isFunction(callback) && callback(content);
        this.allowSavedLayout = true;
    }
    /**
     * @description: 恢复显示的标点
     * @param {Array} markerKeys: 待请求的标点类型
     */
    restoreMarker(markerKeys: string[]) {
        const uniqueKey = new Set(markerKeys.map(this.getMarkerKey));
        [...uniqueKey].every((type: string) => {
            this.actuateRequestMarkers(type);
            return true;
        });
    }
    /**
     * @description: 设置菜单状态
     * @param {Array} reference: 参考数据 -> 格式参考 markerMenuDatum 变量
     * @param {Array} data: 恢复数据 -> 格式参考 markerMenuDatum 变量
     */
    setMenuStatus(reference: any[], data: any[]) {
        reference.every(({ value, status, children }) => {
            const result = data.find(v => v.value === value);
            if (result) {
                result.hasOwnProperty('status') && (result.status = status);
                children && result.children && this.setMenuStatus(children, result.children);
            }
            return true;
        });
    }
    /**
     * @description: 获取菜单状态
     * @param {Array} data: 格式参考 markerMenuDatum 变量
     */
    getMenuStatus(data: any[]): any[] {
        return data.map(({ value, status, children }) => ({
            value,
            status,
            children: children && this.getMenuStatus(children),
        }));
    }
    /**
     * @description: 打开对应列表
     * @param {String} type: 打开的类型;
     * @param {Object} data: 点击项对应的参数;
     */
    handle(type: string, params: Record<string, any> = {}) {
        openList.call(this, type, {
            status,
            ...(params || {}),
        });
    }
}

// 地图标点右键菜单缓存函数
export const getRightMenu = cacheCalc((...args: (string | number)[]) => getRight(markerRightMenu, ...args), true);

/**
 * @description: 机构右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function orgHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 3, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'o', data.id, 0);
    //     }
    // } else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.name}${i18n.t('h.other.alarmLog')}`,
    //         org_id: data.id,
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('orgInfo', () => {
    //         (this.$createOrgInfoHandle({
    //             id: data.id,
    //         }) as any).show();
    //     });
    // }
}

/**
 * @description: 机构右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function mapDeviceHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 1, unique: data.flag });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'd', data.flag, 0);
    //     }
    // } else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.name}${i18n.t('h.other.alarmLog')}`,
    //         flag: data.flag,
    //     });
    // } else if (t === 'historyLocation') {
    //     // 历史轨迹
    //     this.$emit('historyTrace', data);
    // } else if (t === 'onlineLocation') {
    //     // 实时轨迹
    //     this.$emit('onlineTrace', data);
    // } else if (t === 'inOut') {
    //     // 查看道闸|门禁出入记录
    //     openList.call(this, 'inOutLog', {
    //         title: `${data.name}${i18n.t('h.modal.titles.carInOut')}`,
    //         uuid: data.uuid,
    //     });
    // } else {
    //     deviceHandle.call(this, t, [data]);
    // }
}

/**
 * @description: 巡查点右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function patrolHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 4, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'p', data.id, 0);
    //     }
    // } else if (type === 'checkLog') {
    //     // 巡检日志
    //     this.$getDynamicComponent('container', () => {
    //         this.$createContainerHandle(
    //             {
    //                 $attrs: { title: `${data.name}巡检记录` },
    //             },
    //             h => h(CheckList, {
    //                 props: { fromParams: { tag: data.tag }},
    //                 style: { width: '80vw', height: '80vh' },
    //             })
    //         ).show();
    //     });
    // }  else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.name}${i18n.t('h.other.alarmLog')}`,
    //         patrol_point_id: data.id,
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('patrolInfo', () => {
    //         (this.$createPatrolInfoHandle({
    //             type: 'details',
    //             id: data.id,
    //         }) as any).show();
    //     });
    // } else if (t === 'delete') {
    //     const { type } = await deletePlanPoint({ map_id: data.map_id, flag: data.id, marker_type: data.field });
    //     if (!type) {
    //         this.$emit('deleteSuccess');
    //         this.$Message.success(`${data.name || data.point_type_name}，删除成功`);
    //     }
    // } else if (t === 'dragging') {
    //     data.dragging = true;
    // }
}

/**
 * @description: 平面图右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function planHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'seePlan') {
    //     // 查看平面图
    // }
    // else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('patrolInfo', () => {
    //         (this.$createPatrolInfoHandle({
    //             type: 'details',
    //             id: data.id,
    //         }) as any).show();
    //     });
    // }
}

/**
 * @description: 设施右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function facilityHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 2, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'f', data.id, 0);
    //     }
    // } else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.code}${data.patrol_type_name}${i18n.t('h.other.alarmLog')}`,
    //         f_id: data.id,
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('facilityInfo', () => {
    //         (this.$createFacilityInfoHandle({
    //             id: data.id,
    //         }) as any).show();
    //     });
    // } else if (t === 'delete') {
    //     const { type } = await deletePlanPoint({ map_id: data.map_id, flag: data.id, marker_type: data.field });
    //     if (!type) {
    //         this.$emit('deleteSuccess');
    //         this.$Message.success(`${data.point || data.patrol_type_name}，删除成功`);
    //     }
    // } else if (t === 'dragging') {
    //     data.dragging = true;
    // }
}

/**
 * @description: 楼栋右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function buildHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 7, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'b', data.id, 0);
    //     }
    // } else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.code}${data.patrol_type_name}${i18n.t('h.other.alarmLog')}`,
    //         b_id: data.id,
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('buildInfo', () => {
    //         (this.$createBuildInfoHandle({
    //             type: 'details',
    //             id: data.id,
    //         }) as any).show();
    //     });
    // }
}

/**
 * @description: 河流右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function lakeHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 3, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'o', data.id, 0);
    //     }
    // } else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.name}${i18n.t('h.other.alarmLog')}`,
    //         b_id: data.id,
    //     });
    // } else if (t === 'enterStereo') {
    //     // 河流查看立体图
    //     this.$getDynamicComponent('stereo', () => {
    //         (this.$createStereoHandle({
    //             data,
    //         }) as any).show();
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('orgInfo', () => {
    //         (this.$createOrgInfoHandle({
    //             id: data.id,
    //         }) as any).show();
    //     });
    // }
}

/**
 * @description: 警点右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function alarmPointHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 5, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'ap', data.id, 0);
    //     }
    // } else 
    // if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.name}${i18n.t('h.other.alarmLog')}`,
    //         alarm_point_id: data.id,
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('alarmPoint', () => {
    //         (this.$createAlarmPointHandle({
    //             type: 'details',
    //             id: data.id,
    //         }) as any).show();
    //     });
    // }
}


/**
 * @description: 监测点右键菜单触发的方法
 * @param {String} t: 点击的类型
 * @param {Object} data: 点击的信息
 */
export async function monitorHandle(this: Vue, t: string, data: Datum) {
    // if (t === 'clearAlarm') {
    //     // 消警
    //     const { type } = await eraseAlarm({ type: 6, unique: data.id });
    //     if (!type) {
    //         data.isalarm = 0;
    //         // 内部触发一次, 防止 socket 连接失败时且拿不到原始对象时导致地图视图未更新
    //         bus.$emit('on-unalarm', 'mp', data.id, 0);
    //     }
    // } else 
    // if (t === 'monitor') {
    //     // 监测点模板
    //     this.$getDynamicComponent('monitorLayout', () => {
    //         (this.$createMonitorLayoutHandle({
    //             readonly: true,
    //             id: data.id,
    //         }) as any).show();
    //     });
    // } else if (t === 'alarmLog') {
    //     // 报警日志列表
    //     openList.call(this, 'alarmLog', {
    //         title: `${data.name}${i18n.t('h.other.alarmLog')}`,
    //         monitor_point_id: data.id,
    //     });
    // } else if (t === 'details') {
    //     // 详情
    //     this.$getDynamicComponent('monitor', () => {
    //         (this.$createMonitorHandle({
    //             type: 'details',
    //             id: data.id,
    //         }) as any).show();
    //     });
    // } else if (t === 'delete') {
    //     const { type } = await deletePlanPoint({ map_id: data.map_id, flag: data.id, marker_type: data.field });
    //     if (!type) {
    //         this.$emit('deleteSuccess');
    //         this.$Message.success(`${data.name}，删除成功`);
    //     }
    // } else if (t === 'dragging') {
    //     data.dragging = true;
    // }
}