<template>
    <div class="menu-wrapper">
        <card class="menu-card">
            <tabs @on-click="setParams" :value="t">
                <my-button @click="handle('add')" class="" type="primary" slot="extra">{{$t('h.menu.addMenu')}}</my-button>
                <tab-pane v-for="item of list" :key="item.value" :name="item.value" :label="item.title">
                    <loading v-if="item.loading" loading type="B" />
                    <tree :data="item.children" :render="customRender" />
                </tab-pane>
            </tabs>
        </card>
    </div>
</template>

<script lang="tsx">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Tree, Tabs, TabPane, Card } from 'view-design';
import { getModule, getModuleTree, delMenu as del } from '@/config/api';
import { GroupTree, generateBtn, PageAuth } from '@/base-class/list';
import { recursion } from '@/utils/index';

@Component({
    name: 'menu-manage',
    components: {
        Tree,
        Tabs,
        TabPane,
        Card,
    },
})
export default class MenuManage extends GroupTree<'menu-manage'> {
    // 顶层模块 value
    @Prop(String)
    t!: string;

    // 列表数据
    list: ResponseSimple.getModule[] = []

    async created() {
        const { t } = this;
        this.getAuth();
        const data = await this.getModules();
        t ?
            this.getMenus(t)
            : data && this.setParams(data[0].value);
    }

    @Watch('t')
    tabChange(val: string, oldVal?: string) {
        val !== oldVal && this.getMenus(val || 'base');
    }

    // 设置路由 query
    setParams(t: string) {
        const { $route: { name, path, hash, params }} = this;
        this.$router.replace({ name, path, hash, params, query: { t }});
    }
    // 获取模块列表
    async getModules() {
        const { type, data } = await getModule();
        if (!type) {
            data.some(v => {
                v.children = [];
                return false;
            });
            this.list = data;
        }
        return data;
    }
    // 获取菜单树
    async getMenus(val: string, force?: boolean) {
        const { list } = this;
        const result = list.find(v => v.value === val);
        if (!result || (!force && result.children && result.children.length)) return;
        result.loading = true;
        const { type, data } = await getModuleTree(val);
        if (!type) {
            recursion(data, data => Object.assign(data, { valback: data.value, value: data.id, label: data.title }));
            result.children = data;
        }
        result.loading = false;
    }
    // 列表操作栏点击事件
    async handle(name: PageAuth['menu-manage'], data?: ResponseSimple.getMenuTree) {
        if (name === 'delete' && data) {
            const { type } = await del(data.id);
            if (!type) {
                this.getMenus(this.t, true);
            }
        }
        else {
            const { t, list } = this;
            const result = list.find(v => v.value === t);
            if (!(result && result.children && result.children.length)) return this.$Message.info(this.$t('h.tips.cascadeDataGetError'));
            this.$getDynamicComponent('menuManage', () => {
                this.$createMenuManageHandle({
                    type: this.getType(name),
                    id: data && data.id,
                    module: t,
                    moduleData: result.children,
                    $events: {
                        success: () => this.getMenus(this.t, true),
                    },
                }).show();
            });
        }
    }
    // 生成树状菜单
    customRender(h: CreateElement, { data }: { data: ResponseDevice.DeviceGroupTree;}) {
        const i = this.auth.indexOf('add');
        const auth = [...this.auth];
        i !== -1 && auth.splice(i, 1, 'plus');
        return h(
            'div',
            { class: 'tree-operation' },
            [
                h('p', [h('span', data.title)]),
                generateBtn(h, { auth, custom: 'menu-manage', data, instance: this }),
            ]
        );
    }
}
</script>

<style scoped lang="scss">
    .menu-wrapper {
        .menu-card {
            width: 100%; height: 100%;
            background: $--background-color;
            border: none;
            color: $--table-main-color;
            overflow: auto;
            @include utils-pierce(ivu-tabs) {
                color: $--table-main-color;
                .ivu-tabs-bar {
                    border-bottom: 1px solid #01c8eb;
                }
            }
        }
    }
</style>