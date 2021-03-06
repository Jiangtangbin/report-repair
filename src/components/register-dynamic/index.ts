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
 * @description: ?????????????????????????????????????????????
 * @param {String} path: ????????????
 * @param {Function} callback: ??????????????????
 * @param {Object} options?: ???????????????
 * @param {Number} options.num: ?????????????????????
 * @param {String} options.type: ?????????????????????
 * @param {String} options.loadingMsg: loading ??????, ???????????????????????????
 * @param {String} options.errorMsg: ????????????????????????, ???????????????????????????
 * @param {String} options.errorFunc: ????????????????????????
 */
export default async function getDynamicComponent<T extends Record<Path, any>, K extends keyof Record<Path, any>>(path: K, callback: Function, options?: Partial<IDynamicImportOptions> & { unique?: boolean; }) {
    if (!dynamicComponentAlias.hasOwnProperty(path)) return alert(`???????????????????????????????????????${path}`);
    if (registered.hasOwnProperty(path)) {
        callback();
    } else {
        dynamicImport(
            (dynamicComponentAlias[path] as T[K]),
            (component) => {
                // ????????????????????????????????????????????????????????? unique ????????????
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
                    console.log('??????????????????', error, component, path);
                }
            },
            options,
        );
    }
}

export type GetDynamicComponent =
    (path: Path, callback: () => void, options?: Partial<IDynamicImportOptions> & { unique?: boolean; }) => void;

Vue.prototype.$getDynamicComponent = getDynamicComponent;