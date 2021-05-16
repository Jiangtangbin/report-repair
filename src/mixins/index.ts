import { Vue } from 'vue-property-decorator';
import { userModule } from '@/store/index';
import { Message } from 'view-design';
import { isFunction, isArray } from '@/utils/index';
import { coloursIcon } from '@/config/index';
import { getUpToken, action, deletePlanPoint } from '@/config/api';
import { defaultAxios } from '@/axios/index';
import dynamicImport from '@/utils/component-dynamic-import';

type OpenListOptions = { status?: string; title?: string; [index: string]: any };
// 生成细化的地图标点菜单
type CheckType = boolean | number | string;

export type ControlOption = { value: string; title: string; icon: string; };
export type MonitorDevice = { title: string; sub_category: string; category: string; uuid: string; flag: string; id: number; };
// 标点菜单 -> check 用来做全选 status：用来控制显隐
export type IPointMenu = { title: string; cnt?: number; check?: boolean; status?: boolean; closeable?: boolean; children: IPointMenuOption[]; };
// 二级菜单 -> isStatus 用来区分是状态筛选还是显示筛选
export type IPointMenuOption = { title: string; value: string; isStatus?: boolean; icon?: string; cnt?: number; children: IPointMenuOptional[] };
// 二级菜单的状态项，选择该类二级菜单 | 基于该二级菜单进行筛选
export type IPointMenuOptional = { title: string; value: string; status: CheckType; trueValue?: CheckType; falseValue?: CheckType } | { title: string; status: CheckType; group: string; trueValue: CheckType; falseValue: CheckType };

const predictError = ['认证失败，请检查头部信息（错误码：401）', 'expired token', 'bad token', 'token not specified'];
const request = {

};
// 打开的列表类型
const OpenListType = {
    // d: () => dynamicImport(() => import('@/views/list-form/device-manage.vue')),
};

export type OpenListType = keyof typeof OpenListType;

/**
 * @description: 处理设备通用事件
 * @param {String} type: 处理的类型
 * @param {Object|Array} data: 处理的数据集合
 * @param {String} way: 指定的方法, 如果本身或原型上存在该函数则运行
 */
export function deviceHandle(this: Vue, type: string, source: API.Response['DeviceInfo'] | API.Response['DeviceInfo'][], way?: string): boolean {
    if (!type || typeof source !== 'object') return false;
    const data = ([] as API.Response['DeviceInfo'][]).concat(source).map(v => ({ ...v, type: v.sub_category || type }));
    const item = data[0];
    if (way && isFunction((this as any)[way])) {
        (this as any)[way](data);
        return false;
    }
    switch (type) {
        case 'person':
            console.log('触发到个人设备：', type);
            break;
        case 'details':
            console.log('触发到设备详情：', type);
            break;
        case 'dragging': {
            // 移动标点
            source[0].dragging = true;
            break;
        }
        case 'delete': {
            deletePlanPoint({ map_id: item.map_id, flag: item.flag, marker_type: item.field })
                .then(({ type }) => {
                    this.$emit('deleteSuccess');
                    if (!type) this.$Message.success(`${item.name}，删除成功`);
                });
            break;
        }
        default:
            console.log('触发到其它类型了：', type);
            return false;
    }
    return true;
}

/**
 * @description: 监测点控制按钮事件处理
 * @param {Object} data: 点击项
 * @param {Number | String} id: 监测点 id 或者设备 uuid
 * @param {Array} devices: 设备列表
 */
export async function monitorHandle(this: Vue, data: ControlOption, id: number | string, devices?: MonitorDevice[], point?: object) {
    // switch (data.value) {
    //     case 'clearAlarm':
    //         break;
    //     default:
    //         break;
    // }
}

/**
 * @description: 打开指定类型所属列表
 */
export function openList(this: Vue, type: string, { title, authKey, props, ...args }: OpenListOptions = {}) {
    this.$getDynamicComponent('container', () => {
        const func = OpenListType[type as 'd'];
        func || console.log('类型不存在: ', type);
        if (func) {
            func()
                .then(com => {
                    (this.$createContainerHandle(
                        { title: `${title || '弹出窗口'}`, $attrs: { width: '80vw' }},
                        h => h(com.default, {
                            props: {
                                fromQuery: args,
                                plat: args.plat,
                                authKey,
                                ...(props || {}),
                                pageType: true,
                            },
                        })
                    ) as any).show();
                });
        }
    });
}

/**
 * @description: 打开机构、设备等与地图标点的弹窗（详情）
 * @param {String} type: 打开的类型
 * @param {Number} id: 根据内部定义的来传值
 */
export function openWins(this: Vue, type: string, id: Number) {
    switch (type) {
        case 'd':
        case 'device':
            console.log('打开设备详情：', type);
            // 设备...
            // this.$getDynamicComponent('deviceInfo', () => {
            //     (this.$createDeviceInfoHandle({
            //         id,
            //     }) as any).show();
            // });
            break;
        default:
            console.log('未定义该类型弹窗', type);
            break;
    }
}

/**
 * @description: 为地图运维生成常用菜单
 * @param {String} type: 菜单类型
 */
export function genMenu(type: string): IPointMenu | undefined {
    switch (type) {
        case 'zh':
            // 综合
            return {
                title: 'h.map.commonMenu',
                status: false,
                closeable: true,
                children: [
                    { title: 'h.map.plat.zh.customer', icon: coloursIcon.o, value: 'o', children: [{ title: 'h.map.plat.zh.customer', value: 'o', status: 0, trueValue: 1, falseValue: 0 }] },
                ],
            };
        // case 'qx':
        //     // 气象治理
        //     return {
        //         title: 'h.map.commonMenu',
        //         status: false,
        //         closeable: true,
        //         children: [
        //             { title: 'h.map.plat.zh.customer', icon: coloursIcon.o, value: 'o', children: [{ title: 'h.map.plat.zh.customer', value: 'o', status: 0, trueValue: 1, falseValue: 0 }] },
        //         ],
        //     };
        default:
            break;
    }

}

// 图片上传事件，获取上传文件的 token
let uploadCount = 0;
export async function getToken() {
    const { type, data } = await getUpToken();
    if (!type) userModule.updateToken(data.upToken);
}

/**
 * @description: 上传图片
 * @param {String} file: 读取后的文件对象
 * @return {String|false} 返回字符串代表上传成功
 */
export async function upload(file: File | Blob): Promise<string | false> {
    if (!file) return false;
    const formData = new FormData();
    formData.append('token', userModule.token);
    formData.append('file', file);
    try {
        const { data: { key }} = await defaultAxios.post<API.Response['QiNiu']>(action, formData);
        if (key) {
            uploadCount = 0;
            return key;
        } else {
            Message.info('图片上传失败，请重试。');
            return false;
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error && predictError.includes(error.response.data.error) && uploadCount < 5) {
            uploadCount++;
            await getToken();
            return upload(file);
        }
        Message.info(error.message || '上传失败');
        return false;
    }
}