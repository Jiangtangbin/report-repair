<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.auth')"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" class="form roles-tree-form" ref="form">
            <form-item prop="auth" :label="i18n.label.auth">
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
import { Prop, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Tabs, TabPane, Tree } from 'view-design';
import { menu as customRender } from '@/views/components/tree-role';
import { Popup } from '@/base-class/dynamic-create';
import { setUserAuth as set, getUserAuthInfo as get } from '@/config/api';
import { isObject, recursion, carryChained } from '@/utils';
import { userModule } from '@/store/index';

type Datum = Dictionary<any>;

@Component({
    name: 'AccountNumberAuthHandle',
    components: {
        IForm,
        FormItem,
        Tabs,
        TabPane,
        Tree,
    },
})
export default class AccountNumberAuthHandle extends Popup<'SetUserAuth'> {
    $refs!: {
        form: IForm;
        tree: Tree[];
    }

    @Prop(Number)
    id!: number;

    loading = false;
    data = ([] as ResponseLogin.Auth[]);
    formInline = {
        id: this.id,
        auth: [] as number[],
    };

    get i18n() {
        const label = {
            auth: `${this.$t('h.formLabel.role.menu_auth')}: `,
        };
        const placeholder = {
            auth: this.$t('h.placeholder.select', { msg: label.auth }),
        };

        return { label, placeholder };
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
    setDetails(auth: API.Response['UserAuthInfo']) {
        const { data } = this;
        const _auth = (isObject(auth)
            ? Object.values(auth)
            : auth).map(id => Number(id));

        if (_auth) {
            recursion(data, v => {
                _auth.includes(v.id) && (v.checked = true);
            });
        }
    }
    /**
     * @description: 重置数据源
     */
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
        const { formInline, data } = this;
        const ids: number[] = [];
        this.$refs.tree.every((v, i) => {
            const r = v.getCheckedNodes();
            r.length && ids.push(data[i].id, ...r.map(v => v.id));
            return true;
        });
        formInline.auth = ids;
        const flag = await this.$refs.form.validate();
        if (flag) {
            this.loading = true;
            const params = { ...formInline };
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
        height: 48vh;
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