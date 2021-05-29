import Vue, { AsyncComponent } from 'vue';
import createAPI from 'vue-create-api';
import dynamicImport, { IDynamicImportOptions } from '@/utils/component-dynamic-import';

Vue.use(createAPI);

type Path = 'request' | 'container' | 'sounds' | 'baseDataTree' | 'tableList'
    | 'icon' | 'camera' | 'condition' | 'publicIframe' | 'menuManage' | 'packageManage' | 'roleManage' | 'accountNumberManage' | 'accountNumberAuth' | 'customerManage' | 'location' | 'deviceManage' | 'deviceGroupManage' | 'planManage' | 'usualAddressList' | 'usualAddress' | 'deviceGroupDevice' | 'fileManage' | 'configManage' | 'publicPlay' | 'configContent' | 'distributeContent' | 'distributeResult' | 'devicePreview' | 'deviceSetContent' | 'knowLedgeManage' | 'noticeManage' | 'workPoolManage' | 'workPoolDistributionManage' | 'workPoolCancelManage' | 'workReplyManage' | 'workDetails' | 'workNewNotice' | 'wxBind' | 'wxInfo';
type Registered = {
    [index: string]: boolean;
};

const dynamicComponentAlias: Record<Path, AsyncComponent> = {
    request: () => import('./request.vue'),
    container: () => import('./container.vue'),
    sounds: () => import('./sounds.vue'),
    baseDataTree: () => import('./base-data-tree.vue'),
    tableList: () => import('./table-list.vue'),
    icon: () => import('./icon.vue'),
    camera: () => import('./camera.vue'),
    condition: () => import('./condition.vue'),
    publicIframe: () => import('./public-iframe.vue'),
    menuManage: () => import('./menu-manage.vue'),
    packageManage: () => import('./package-manage.vue'),
    roleManage: () => import('./role-manage.vue'),
    accountNumberManage: () => import('./account-number-manage.vue'),
    accountNumberAuth: () => import('./account-number-auth.vue'),
    customerManage: () => import('./customer-manage.vue'),
    location: () => import('./location.vue'),
    deviceManage: () => import('./device-manage.vue'),
    deviceGroupManage: () => import('./device-group-manage.vue'),
    planManage: () => import('./plan-manage.vue'),
    usualAddressList: () => import('./usual-address-list.vue'),
    usualAddress: () => import('./usual-address.vue'),
    deviceGroupDevice: () => import('./device-group-device.vue'),
    fileManage: () => import('./file-manage.vue'),
    configManage: () => import('./config-manage.vue'),
    publicPlay: () => import('./public-play.vue'),
    configContent: () => import('./config-content.vue'),
    distributeContent: () => import('./distribute-content.vue'),
    distributeResult: () => import('./distribute-result.vue'),
    devicePreview: () => import('./device-preview.vue'),
    deviceSetContent: () => import('./device-set-content.vue'),
    knowLedgeManage: () => import('./know-ledge-manage.vue'),
    noticeManage: () => import('./notice-manage.vue'),
    workPoolManage: () => import('./work-pool-manage.vue'),
    workPoolDistributionManage: () => import('./work-pool-distribution-manage.vue'),
    workPoolCancelManage: () => import('./work-pool-cancel-manage.vue'),
    workReplyManage: () => import('./work-reply-manage.vue'),
    workDetails: () => import('./work-details.vue'),
    workNewNotice: () => import('./work-new-notice.vue'),
    wxBind: () => import('./wx-bind.vue'),
    wxInfo: () => import('./wx-info.vue'),
};
const registered: Registered = {};

/**
 * @description: 动态加载组件并将其绑定到原型上
 * @param {String} path: 组件名称
 * @param {Function} callback: 成功后的回调
 * @param {Object} options?: 可选配置项
 * @param {Number} options.num: 重复请求的次数
 * @param {String} options.type: 加载的文件类型
 * @param {String} options.loadingMsg: loading 提示, 如传空则不进行提示
 * @param {String} options.errorMsg: 加载失败后的提示, 如传空则不进行提示
 * @param {String} options.errorFunc: 加载失败后的回调
 */
export default async function getDynamicComponent<T extends Record<Path, any>, K extends keyof Record<Path, any>>(path: K, callback: Function, options?: Partial<IDynamicImportOptions> & { unique?: boolean; }) {
    if (!dynamicComponentAlias.hasOwnProperty(path)) return alert(`无该类型弹窗，请检查代码：${path}`);
    if (registered.hasOwnProperty(path)) {
        callback();
    } else {
        dynamicImport(
            (dynamicComponentAlias[path] as T[K]),
            (component) => {
                // 防止瞬间触发多次，事件被注册多次，导致 unique 不起作用
                if (registered[path]) return callback();
                try {
                    const comp = Object.defineProperty(component.default, 'name', {
                        writable: false,
                        value: (component as any).default.extendOptions.name || component.default.name || path,
                    });
                    Vue.createAPI(
                        comp,
                        // component.default,
                        [],
                        options && options.unique !== undefined
                            ? options.unique
                            : process.env.NODE_ENV !== 'development'
                    );
                    registered[path] = true;
                    callback();
                } catch (error) {
                    console.log('组件注册失败', error, component, path);
                }
            },
            options,
        );
    }
}

export type GetDynamicComponent =
    (path: Path, callback: () => void, options?: Partial<IDynamicImportOptions> & { unique?: boolean; }) => void;

Vue.prototype.$getDynamicComponent = getDynamicComponent;