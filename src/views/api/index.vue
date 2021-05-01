<template>
    <div class="api-wrapper">
        <header class="api-header">
            <my-button @click="toggleExpand(true)" class="api-header-btn">展开</my-button>
            <my-button @click="toggleExpand(false)" class="api-header-btn">收缩</my-button>
            <i-input v-model="query" placeholder="搜索 api 名称或地址" class="api-header-input" />
            <p class="api-header-name">
                <b>{{initReq.title.headerTitle}}</b>
                <span>{{initReq.title.version}}</span>
            </p>
            <p class="api-header-author">{{initReq.title.copyright}}</p>
        </header>
        <div class="api-body">
            <scroll :observeDOM="true" class="api-body-tree" preventDefault>
                <tree @on-select-change="handle" :data="finallyData" />
            </scroll>
            <section class="api-body-section">
                <tabs v-if="tabs.length" v-model="curTab" @on-click="handleTab" @on-tab-remove="removeTab" :animated="false" closable type="card">
                    <template v-for="tab in tabs">
                        <tab-pane v-if="!tab.hide" :key="tab.value" :name="tab.value" :label="tab.title">
                            <div>
                                <p class="api-body-section-title">接口信息</p>
                                <div class="api-body-section-info">
                                    <p class="api-body-section-info-label">接口作者: {{tab.author}}</p>
                                    <p class="api-body-section-info-label">接口名称: <b @click="copyStr(tab.title, $event)">{{tab.title}}</b></p>
                                    <p class="api-body-section-info-label">
                                        <span>接口地址: <b @click="copyStr(tab.url, $event)">{{ tab.url }}</b></span>
                                        <b class="api-body-section-info-label-request">{{tab.method}}</b>
                                        <span @click="send(tab)" class="api-body-section-info-label-request c-p">发送</span>
                                    </p>
                                    <p class="api-body-section-info-label">接口说明: {{tab.description || '-'}}</p>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <p class="title">header 头</p>
                                    <i-table :columns="columns" :data="tab.header" :row-class-name="rowClassName" class="table" border />
                                </div>
                                <div>
                                    <p class="title">接口参数</p>
                                    <i-table :columns="columns" :data="tab.param" :row-class-name="rowClassName" class="table" border />
                                </div>
                                <div>
                                    <p class="title">返回结果</p>
                                    <pre><code>{{tab.return}}</code></pre>
                                </div>
                            </div>
                        </tab-pane>
                    </template>
                </tabs>
                <span v-else>请选择要查看的接口</span>
            </section>
        </div>
    </div>
</template>
<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator';
import { Tree, Tabs, TabPane, Table as ITable, Button as IButton, Input as IInput } from 'view-design';
import { getApiList, getApiInfo } from '@/config/api';
import FuseJs from 'fuse.js';
import copyFunc from '@/utils/clipboard';

type TabOption = { title: string; value: string; hide: boolean; } & ResponseApi.ApiInfo;
type Info = API.Response['ApiList']['apis'][0]['children'][0];

const columns = [
    {
        type: 'index',
        title: '序号',
        align: 'center',
        width: 60,
    },
    {
        title: '参数名字',
        key: 'name',
    },
    {
        title: '类型',
        key: 'type',
    },
    {
        title: '是否必须',
        key: 'require',
    },
    {
        title: '默认值',
        key: 'default',
    },
    {
        title: '说明',
        key: 'desc',
    },
];

@Component({
    components: {
        Tree,
        Tabs,
        TabPane,
        ITable,
        IButton,
        IInput,
    },
})
export default class Api extends Vue {
    initReq = ({
        title: {},
        treeData: [],
    } as { title: Dictionary<string>; treeData: API.Response['ApiList']['apis'] });
    tabs: TabOption[] = [];
    query = '';
    curTab = '';
    columns = columns;
    fuse: FuseJs<Info, any> | null = null;

    get finallyData() {
        const { query, initReq: { treeData }} = this;
        return query && this.fuse ? this.fuse.search(query) : treeData;
    }

    async created() {
        const { type, data, msg } = await getApiList();
        if (!type) {
            const { apis, ...args } = data;
            apis.some(v => {
                v.children.some(v => {
                    v.parseName = v.name.split('::').join('\\').split('\\').slice(2).join('\\');
                    return false;
                });
                return false;
            });
            this.$Message.success(msg);
            this.toggleExpand(false, apis);
            const initReq = {
                title: args,
                treeData: apis,
            };
            this.$set(this, 'initReq', initReq);
        }
    }

    @Watch('initReq.treeData', { immediate: true })
    initFuse(data: API.Response['ApiList']['apis']) {
        this.fuse = new FuseJs(this.flagData(data), {
            shouldSort: true,
            threshold: 0.2,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ['title', 'parseName'],
        });
    }

    /**
     * @description: 数据接口点击事件
     * @param {Array} source: 选中列表
     * @param {Object} data: 点击项
     */
    handle(source: Info[], data: Info) {
        const { tabs } = this;
        const { name, title } = data;
        if (!name) return;
        const tab = tabs.find(v => `${v.value}${v.title}` === `${name}${title}`);
        if (tab) {
            tab.hide = false;
            this.curTab = name;
        }
        else {
            this.getApiInfo(name);
        }
    }
    /**
     * @description: 删除接口事件
     * @param {String} value: 删除接口事件的值
     */
    removeTab(value: string) {
        const { tabs } = this;
        // const tab = tabs.find(v => v.value === value);
        // tab && (tab.hide = true);
        const index = tabs.findIndex(v => v.value === value);
        index !== -1 && tabs.splice(index, 1);
    }
    /**
     * @description: 获取接口详情
     * @param {String} name: 获取接口信息的地址
     */
    async getApiInfo(name: string) {
        const { tabs, disposeParams } = this;
        const { type, data } = await getApiInfo(name);
        if (!type) {
            data.header = disposeParams(data.header);
            data.param = disposeParams(data.param);
            tabs.push({ title: data.title, value: name, hide: false, ...data });
            this.curTab = name;
        }
    }
    /**
     * @description: 处理 table 参数
     * @param {Array} data: 需要处理的数据
     */
    disposeParams(data: Dictionary<any>[] = []) {
        if (!data.length) return data;
        return data.map((val: any) => {
            let result: any = {};
            delete val.other;
            Object.keys(val).some(key => {
                if (key === 'require') {
                    result[key] = val[key] === '1' || val[key] === 1 ? '必填' : '非必填';
                } else {
                    result[key] = val[key] || '-';
                }
                return false;
            });
            return result;
        });
    }
    /**
     * @description: 点击 tabs
     * @param {String} title: 点击项的标题
     */
    handleTab(title: string) {
        this.filterTree(this.initReq.treeData, title);
    }
    /**
     * @description: 筛选树节点
     * @param {Array} sources: 源数据
     */
    filterTree(sources: API.Response['ApiList']['apis'], title: string) {
        return sources.map(item => {
            (item as any).selected = item.title === title;
            item.children && this.filterTree((item as any).children, title);
            return item;
        });
    }
    /**
     * @description: 单双行添加类名
     * @param {Any} row: 行
     * @param {Number} index: 索引
     */
    rowClassName(row: any, index: number) {
        return index % 2 ? 'api_singleRow' : 'api_doubleRow';
    }
    /**
     * @description: 收缩展开列表
     * @param {Boolean} status: 状态
     * @param {Array} data: 数据
     */
    toggleExpand(status: boolean, data = this.initReq.treeData) {
        data.some(v => {
            v.expand = status;
            return false;
        });
    }
    /**
     * @description: 扁平化数据
     * @param {Array} data: 数据
     */
    flagData(data: API.Response['ApiList']['apis']): Info[] {
        const result: Info[] = [];
        data.some(v => {
            result.push(...v.children);
            return false;
        });
        return result;
    }
    /**
     * @description: 模拟传输数据
     * @param {Object} data: 点击项接口数据
     */
    send({ url, param, title }: TabOption) {
        const params: Dictionary<any> = {};
        param.reduce((prev, { name, default: value }) => Object.assign(prev, { [name]: value }), params);
        this.$getDynamicComponent('request', () => {
            this.$createRequestHandle({
                url,
                title,
                params,
                draggable: true,
            }).show();
        }, { unique: false });
    }
    /**
     * @description: 复制文字
     * @param {String} text: 待复制的文字
     * @param {Object} ev: 事件
     */
    copyStr(text: string, ev: MouseEvent) {
        copyFunc(text, ev);
    }
}
</script>

<style scoped lang="scss">
    $bg: #F0F0F0;
    $header_bg: #00A981;
    $header_padding: 0 15px;
    $section_padding: 25px 50px 0;
    $methods_bg: #5CB95D;
    $code_bg: #F9F3F5;
    $code_color: #CB244E;

    .api-wrapper {
        color: $--black1;
        height: 100%;
        background: $bg;
        display: flex;
        flex-flow: column nowrap;
        .api-header {
            height: 60px;
            color: $--white;
            padding: $header_padding;
            background: $header_bg;
            flex: none;
            display: flex;
            align-items: center;
            &-btn, &-input, &-name, &-author {
                margin: 0 5px;
            }
            &-input {
                width: initial;
            }
            &-name {
                b {
                    font-size: 24px;
                }
                span {
                    position: relative;
                    top: 3px; left: 10px;
                }
            }
            &-author {
                margin-left: auto;
                font-size: 14px;
            }
        }
    }
    .api-body {
        height: calc(100% - 60px);
        flex: auto;
        display: flex;
        flex-flow: row nowrap;
        &-tree {
            min-width: 200px; max-width: 300px;
            flex: none;
        }
        &-section {
            border-left: 1px solid $--white;
            padding: $section_padding;
            overflow: hidden;
            flex: auto;
            display: flex;
            flex-flow: column nowrap;
            @include utils-pierce(ivu-tabs) {
                    display: flex;
                    flex-flow: column nowrap;
                    .ivu-tabs-content {
                        overflow: auto;
                    }
            }
            &-title {
                font: {
                    size: 16px;
                    weight: bolder;
                }
                margin: 15px 0;
            }
            &-info {
                &-label {
                    font-size: 14px;
                    margin: 12px 0;
                    &-request {
                        color: $--white;
                        padding: 6px 10px;
                        margin: 0 0 0 10px;
                        border-radius: 5px;
                        background: $methods_bg;
                        user-select: none;
                    }
                }
            }
            code {
                color: $code_color;
                background: $code_bg;
            }
        }
    }
</style>