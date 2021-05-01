<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.role')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form roles-tree-form" ref="form">
            <form-item prop="name" :label="i18n.label.name">
                <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
            </form-item>
            <form-item prop="description" :label="i18n.label.description">
                <i-input v-model="formInline.description" :readonly="forbidden" :placeholder="i18n.placeholder.description" type="textarea" />
            </form-item>
            <form-item prop="menu_auth" :label="i18n.label.menu_auth">
                <tabs>
                    <tab-pane v-for="item of data" :key="item.value" :name="item.value" :label="item.title">
                        <div class="tabs-toggle">
                            <my-button @click="toggleFold(item.children, true)" class="tabs-toggle-item">{{$t('h.tableButton.expandAll')}}</my-button>
                            <my-button @click="toggleFold(item.children, false)" class="tabs-toggle-item" type="success">{{$t('h.tableButton.shrinkAll')}}</my-button>
                        </div>
                        <tree @on-check-change="checkChange(...arguments, item.children)" :data="item.children" :render="customRender" ref="tree" show-checkbox check-strictly />
                    </tab-pane>
                </tabs>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Tabs, TabPane, Tree } from 'view-design';
import { menu as customRender } from '@/views/components/tree-role';
import { Popup } from '@/base-class/dynamic-create';
import { setRole as set, getRoleInfo as get } from '@/config/api';
import { isObject, recursion, carryChained } from '@/utils/index';
import { userModule } from '@/store/index';

type Datum = Dictionary<any>;

@Component({
    name: 'RoleManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        Tabs,
        TabPane,
        Tree,
    },
})
export default class RoleManageHandle extends Popup<'setRole'> {
    $refs!: {
        form: IForm;
        tree: Tree[];
    }

    @Prop({ type: Object, required: true })
    orgs!: { id: number; name: string };
    @Prop(Number)
    id?: number;

    data = ([] as ResponseLogin.Auth[]);
    formInline = {
        type: typeof this.type === 'string' ? 1 : this.type,
        id: undefined,
        org_id: [],
        name: '',
        description: '',
        menu_auth: [] as number[],
    };
    loading = false;

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.name')}: `,
            description: `${this.$t('h.formLabel.description')}: `,
            menu_auth: `${this.$t('h.formLabel.auth')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            description: this.$t('h.placeholder.pleaseEnter', { msg: label.description }),
            menu_auth: this.$t('h.placeholder.pleaseSelect', { msg: label.menu_auth }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            menu_auth: { required: true, message: placeholder.menu_auth },
        };
    }

    @Watch('type')
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }
    // 打开前事件
    prefixFunc() {
        const { formInline, id } = this;
        Object.assign(formInline, { id });
        this.resetSources();
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // tree 渲染函数
    customRender(h: CreateElement, data: any) {
        const { data: originData } = this;
        return customRender(h, data, originData);
    }
    // 获取详情
    async getDetails() {
        const { id, setDetails } = this;
        if (!id) return console.log('请填写详情 id: ', id);
        this.loading = true;
        const { type, data } = await get(id);
        if (!type) setDetails(data);
        this.loading = false;
    }
    // 设置详情
    setDetails({ name, menu_auth, description }: API.Response['RoleInfo']) {
        const { formInline, data } = this;
        const auth = (isObject(menu_auth)
            ? Object.values(menu_auth)
            : menu_auth).map(id => Number(id));

        Object.assign(formInline, { description, name });

        if (auth) {
            recursion(data, v => {
                auth.includes(v.id) && (v.checked = true);
            });
        }
    }
    // 重置数据源
    resetSources() {
        const { forbidden } = this;
        const data = JSON.parse(JSON.stringify(userModule.user.auth));
        recursion(data, (v) => Object.assign(v, { disabled: forbidden, expand: true, checked: false }));
        this.data = data;
    }
    /**
     * @description: 列表展开收缩事件
     * @param {Array} data: 待展开(收缩)的数据
     * @param {Boolean} bool: 展开或收缩
     */
    toggleFold(data: Dictionary<any>[], bool: boolean) {
        recursion(data, (data) => Object.assign(data, { expand: bool }));
    }
    /**
     * @description: 勾选事件
     * @param {Array} checked: 已选中项
     * @param {Object} data: 当前点击项
     * @param {Array} 当前 tab-pane 的数据源
     */
    checkChange(checked: Datum[], data: Datum, source: Datum[]) {
        data.checked
            ? carryChained(source, { id: data.id }, (v, isDeep) => {
                isDeep || this.$set(v, 'checked', true);
            })
            : data.children && recursion(data.children, v => {
                v.checked = false;
            });
    }
    // 提交事件
    async ok() {
        const { formInline, data, orgs } = this;
        const ids: number[] = [];
        this.$refs.tree.every((v, i) => {
            const r = v.getCheckedNodes();
            r.length && ids.push(data[i].id, ...r.map(v => v.id));
            return true;
        });
        formInline.menu_auth = ids;
        const flag = await this.$refs.form.validate();
        if (flag) {
            this.loading = true;
            const params = { ...formInline, org_id: orgs.id };
            const { type } = await set(params);
            type || this.$emit('success');
            this.loading = false;
            return !type;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    @include utils-pierce(roles-tree-form) {
        .ivu-form-item:last-child {
            margin-bottom: 0;
        }
        // 展示标签
        .role-tree-wrapper {
            vertical-align: bottom;
            display: inline-flex;
            .role-tree-desc {
                display: flex;
                align-items: center;
                &-icon {
                    margin-right: 4px;
                }
            }
        }
        // 占位标签
        .roles-tree-place ~ .ivu-tree-children {
            display: inline-flex;
        }
    }
    // 调整 tab-pane 的高度, 使内部出现滚动条
    @include utils-pierce(ivu-tabs) {
        @media screen and (max-width: 992px) {
            height: 65vh;
        }
        height: 46vh;
        .ivu-tabs-content  {
            height: calc(100% - 52px);
            .ivu-tabs-tabpane {
                overflow: auto;
            }
        }
    }
    .tabs-toggle {
        &-item {
            &:not(:first-child) {
                margin-left: 10px;
            }
        }
    }
</style>