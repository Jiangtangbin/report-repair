import { VNode } from 'vue';
import { Vue, Prop } from 'vue-property-decorator';
import { userModule, appModule } from '@/store/index';
import { Poptip, TableColumnRenderParams } from 'view-design';
import { getMatch, isNumber } from '@/utils/index';
import { operationLog, accountNumberManage, customerManage, knowLedgeManage, noticeManage, workPoolManage } from '@/config/columns';
import isEqualWith from 'lodash/isEqualWith';
import { i18n } from '@/locale/index';

// 设备列表的权限
// 拥有的控制权限字段
type ReadonlyAuth = 'add' | 'edit' | 'details';
type BaseAuth = ReadonlyAuth | 'delete';

// 权限可能存在的字段类型
type NormalFields = { name: string, alias?: string, title: string };
type TipsFields = { name: string, alias?: string, title: string, isTips: true, tips: string };

// 权限对应的字段
type AuthField = {
    // 不存在的字段则不定义类型
    [index: string]: NormalFields | TipsFields;
    plus: NormalFields;
    edit: NormalFields;
    delete: TipsFields;
    details: NormalFields;
}

// 每个页面所对应的权限
export type PageAuth = {
    'account-number-manage': ReadonlyAuth | 'auth' | 'unable' | 'enable';
    'customer-manage': BaseAuth;
    'know-ledge-manage': BaseAuth;
    'notice-manage': BaseAuth;
    'work-pool-manage': BaseAuth;
    'operation-log': 'details';
}

/**
 * @description: 判断 a === b
 * @param {any} a
 * @param {any} b
 */
function isEqualCustomizer(a: any, b: any) {
    return typeof a === 'object' && typeof b === 'object'
        ? undefined
        : a == b;
}

/**
 * 所有的控制按钮集合
 * @param {string} name 是图标名称
 * @param {string} alias 是点击时用来区分的字段
 * @param {string} title 对应的名称
 */
const icons: AuthField = {
    plus: {
        name: 'plus',
        alias: 'add',
        title: 'add',
    },
    'set-group-device': {
        name: 'plus',
        alias: 'set-group-device',
        title: 'setGroupDevice',
    },
    edit: {
        name: 'edit',
        alias: 'edit',
        title: 'edit',
    },
    delete: {
        name: 'delete',
        alias: 'delete',
        title: 'delete',
        isTips: true,
        tips: 'confirmDelete',
    },
    details: {
        name: 'details',
        alias: 'details',
        title: 'details',
    },
};

/**
 * @description: 对权限进行处理，并返回控制按钮
 * @param {Array} auth: 权限
 * @param {String} custom: 对控制按钮单独处理的类型
 * @param {Object} data: 需要对控制按钮单独处理时提供的数据
 */
function iconDispose<T extends PageAuth, K extends keyof PageAuth>(originAuth: T[K][]): AuthField[T[K]][]
function iconDispose<T extends PageAuth, K extends keyof PageAuth>(originAuth: T[K][], custom: K, data: object): AuthField[T[K]][]
function iconDispose<T extends PageAuth, K extends keyof PageAuth>(originAuth: T[K][], custom?: K, data?: Dictionary<any>) {
    let auth = originAuth.concat();
    const a: keyof PageAuth | undefined = custom;
    // 此处匹配可以使用正则，防止不同平台加了前缀导致匹配失败
    switch (a) {
        case /orgList$/.test(a!) ? a : '':  {
            console.log('客户管理');
            break;
        }
        case /userList$/.test(a!) ? a : '':  {
            console.log('账号管理');
            break;
        }
        case /knowLedgeList$/.test(a!) ? a : '':  {
            console.log('知识库管理');
            break;
        }
        case /noticeList$/.test(a!) ? a : '':  {
            console.log('公告管理');
            break;
        }
        case /poolList$/.test(a!) ? a : '':  {
            console.log('工单池管理');
            break;
        }
        case /workList$/.test(a!) ? a : '':  {
            console.log('工单管理');
            break;
        }
        case /map$/.test(a!) ? a : '':  {
            console.log('地图运维');
            break;
        }
        default:
            break;
    }
    return auth.map(k => icons[k]).filter(Boolean);
}
export {
    iconDispose,
};

/**
 * table 列表生成按钮函数
 * @param {Function} h: 创建函数
 * @param {Array} auth: 按钮集合
 * @param {VDOM} instance: vue 实例
 * @param {Object} data: 点击行的数据
 * @param {String} custom: 对控制按钮单独处理的类型
 */
export function generateBtn<T extends Vue, U extends keyof PageAuth>(h: CreateElement, { auth: originAuth, instance, custom, data }: { auth: PageAuth[U][], instance: T, custom: U, data: object }): VNode {
    const auth = iconDispose(originAuth, custom, data);
    return auth.length
        ? h(
            'div',
            { on: { dblclick: (e: MouseEvent) => e.stopPropagation() }, class: 'table-operation' },
            auth.map(({ name, title, alias, ...args }) => {
                return (args as TipsFields).isTips
                    ? h(
                        Poptip,
                        { on: { 'on-ok': (e: MouseEvent) => (instance as any).handle(alias || name, data, e) }, props: { placement: 'left', title: i18n.t(`h.tableButton.${(args as TipsFields).tips}`), confirm: true }, style: { display: 'inherit' }},
                        [h('svg-icon', { class: 'c-p', style: { display: 'block' }, props: { iconClass: name }})]
                    )
                    : h(
                        'span',
                        { class: 'table-operation-btn-control', on: { click: (e: MouseEvent) => (instance as any).handle(alias || name, data, e) }, attrs: { title: i18n.t(`h.tableButton.${title}`) }},
                        [h('svg-icon', { class: 'c-p', props: { iconClass: name }})]
                    );
            })
        )
        : h('span', { class: 'table-operation', style: { cursor: 'no-drop', fontSize: 'inherit' }}, i18n.t('h.tableButton.doNotOperate') as string);
}

/**
 * @description: 生成带操作的列表
 * @param {Array} columns: 列表源
 * @param {String} custom?: 自定义的字段
 */
function genListOperations<K extends keyof PageAuth>(columns: object[], custom: K, width?: number | PageAuth[K][], whiteAuth?: PageAuth[K][]) {
    const w = isNumber(width) ? width : 100;
    const bA = width && !isNumber(width) ? width : (whiteAuth || []);
    return function genColumns<T extends Vue>(instance: T) {
        return columns.concat({
            renderHeader(h?: CreateElement) {
                return h!('span', (i18n.t('h.table.operation') as string));
            },
            align: 'center',
            width: appModule.isMobile ? undefined : w,
            render(h: CreateElement, { row: data }: TableColumnRenderParams) {
                const { auth } = (instance as any);
                return generateBtn(h, { auth: auth.concat(bA), instance, custom, data: data! });
            },
        });
    };
}

export function getAuth<K extends keyof PageAuth>(value: K, auth: PageAuth[K][], custom?: K, data?: Dictionary<any>): PageAuth[K][] {
    if (!value) {
        console.log('该列表名称未定义，权限获取失败');
        return [];
    }
    const result = getMatch(userModule.user.auth, { value });
    if (!(result && result.children)) {
        console.log(`${value}：权限列表无此项`);
        auth.splice(0);
        return [];
    }
    let _auth = result.children!.map(v => v.value) as PageAuth[K][];
    if (custom && data) {
        _auth = iconDispose(_auth, custom, data).map(v => v.alias || v.name) as PageAuth[K][];
    }
    auth.splice(0, auth.length, ..._auth);
    return auth;
}

// 获取权限的基类
abstract class BasicAuth<K extends keyof PageAuth> extends Vue {
    abstract auth: PageAuth[K][]; // 该列表所拥有的权限
    abstract authKey: K;

    /**
     * @description: 根据返回弹窗打开的类型
     * @param {String | Number} str
     */
    getType(str: PageAuth[K]) {
        return str === 'add' ? 1 : str === 'edit' ? 2 : 'details';
    }
    // 生成与列表对应的权限
    getAuth(type?: K) {
        const value: K | undefined = (type || this.authKey || undefined);
        getAuth(value!, this.auth);
    }
    /**
     * @description: 根据提供的字段返回是否存在改权限
     * @param {String} str
     */
    hasAuth(str: PageAuth[K]) {
        return this.auth.includes(str);
    }
}

// 列表继承的抽象基类
abstract class BasicList<K extends keyof PageAuth> extends BasicAuth<K> {
    abstract list: {page: API.ResponsePage, list: any[]}; // 列表数据信息
    abstract queryParams: Dictionary<string | number | (string | number)[] | undefined>; // 列表搜索信息
    abstract getResponseParams: any; // 列表数据源请求函数所需要的参数
    abstract handle(name: PageAuth[K], data?: object): void; // 列表操作栏点击事件
    abstract refresh(isFirst?: true): void; // 列表刷新事件
    /**
     * @description: 设置请求参数
     * @param {Object} query: 待设置的参数
     * @param {Boolean} inset: 内部触发
     */
    setParams(query: Dictionary<any>, inset?: boolean) {
        const { queryParams, _inactive } = this;
        // json 化去除 undefined 字段
        const _query = { pageSize: '30', ...JSON.parse(JSON.stringify(query)) };
        // 参数未发生改变时，不重新触发
        if (_inactive || isEqualWith(_query, queryParams, isEqualCustomizer)) return;
        this.$set(this, 'queryParams', { ..._query });
        inset === true && this.$router.replace({ query: _query });
    }
}

// 操作记录列表
export abstract class OperationLogColumns extends BasicList<'operation-log'> {
    auth: PageAuth['operation-log'][] = [];
    // 外部提供的权限字段
    @Prop({ type: String, default(this: Vue) { return this.$options.name } })
    authKey!: 'operation-log';

    get columns() {
        return operationLog();
    }
}

// 账号管理列表
export abstract class AccountColumns extends BasicList<'account-number-manage'> {
    auth: PageAuth['account-number-manage'][] = [];
    // 外部提供的权限字段
    @Prop({ type: String, default(this: Vue) { return this.$options.name } })
    authKey!: 'account-number-manage';

    get columns() {
        const { authKey } = this;
        return genListOperations(accountNumberManage(), authKey)(this);
    }
}

// 客户管理列表
export abstract class CustomerColumns extends BasicList<'customer-manage'> {
    auth: PageAuth['customer-manage'][] = [];
    // 外部提供的权限字段
    @Prop({ type: String, default(this: Vue) { return this.$options.name } })
    authKey!: 'customer-manage';

    get columns() {
        const { authKey } = this;
        return genListOperations(customerManage(), authKey)(this);
    }
}

// 知识库管理列表
export abstract class KnowledgeBaseColumns extends BasicList<'know-ledge-manage'> {
    auth: PageAuth['know-ledge-manage'][] = [];
    // 外部提供的权限字段
    @Prop({ type: String, default(this: Vue) { return this.$options.name } })
    authKey!: 'know-ledge-manage';

    get columns() {
        const { authKey } = this;
        return genListOperations(knowLedgeManage(), authKey)(this);
    }
}

// 公告管理列表
export abstract class NoticeColumns extends BasicList<'notice-manage'> {
    auth: PageAuth['notice-manage'][] = [];
    // 外部提供的权限字段
    @Prop({ type: String, default(this: Vue) { return this.$options.name } })
    authKey!: 'notice-manage';

    get columns() {
        const { authKey } = this;
        return genListOperations(noticeManage(), authKey)(this);
    }
}

// 工单池管理列表
export abstract class WorkPoolColumns extends BasicList<'work-pool-manage'> {
    auth: PageAuth['work-pool-manage'][] = [];
    // 外部提供的权限字段
    @Prop({ type: String, default(this: Vue) { return this.$options.name } })
    authKey!: 'work-pool-manage';

    get columns() {
        const { authKey } = this;
        return genListOperations(workPoolManage(), authKey)(this);
    }
}