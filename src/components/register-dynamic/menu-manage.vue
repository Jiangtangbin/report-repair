<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.menu')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <div class="col">
                <form-item prop="title" class="col2" :label="i18n.label.title">
                    <i-input v-model="formInline.title" :placeholder="i18n.placeholder.title" />
                </form-item>
                <form-item prop="in_title" class="col2" :label="i18n.label.in_title">
                    <i-input v-model="formInline.in_title" :placeholder="i18n.placeholder.in_title" />
                </form-item>
            </div>
            <div class="col">
                <form-item prop="url_value" class="col2" :label="i18n.label.url_value">
                    <i-input v-model="formInline.url_value" :placeholder="i18n.placeholder.url_value" />
                </form-item>
                <form-item prop="value" class="col2" :label="i18n.label.value">
                    <i-input v-model="formInline.value" :placeholder="i18n.placeholder.value" />
                </form-item>
            </div>
            <form-item prop="pid" :label="i18n.label.pid">
                <cascader v-model="formInline.pid" :data="pidData" change-on-select :placeholder="i18n.placeholder.pid" transfer />
            </form-item>
            <div class="col">
            <form-item prop="online_hide" class="col2" :label="i18n.label.online_hide">
                <i-switch v-model="formInline.online_hide">
                    <template #open><span>{{$t('h.status.yes')}}</span></template>
                    <template #close><span>{{$t('h.status.no')}}</span></template>
                </i-switch>
            </form-item>
            <form-item prop="ismenu" class="col2" :label="i18n.label.ismenu">
                <i-switch v-model="formInline.ismenu">
                    <template #open><span>{{$t('h.status.yes')}}</span></template>
                    <template #close><span>{{$t('h.status.no')}}</span></template>
                </i-switch>
            </form-item>
            </div>
            <div class="col">
                <form-item prop="sort" class="col2" :label="i18n.label.sort">
                    <input-number
                        v-model="formInline.sort"
                        class="f-c-i"
                        :placeholder="i18n.placeholder.sort"
                    />
                </form-item>
                <form-item prop="icon" class="col2" :label="i18n.label.icon">
                    <i-input v-model="formInline.icon" @click.native="openIcon" :placeholder="i18n.placeholder.icon" />
                </form-item>
            </div>
            <form-item prop="roles" v-if="type === 1" :label="i18n.label.roles">
                <my-table :columns="finallyColumns.roles" :data="formInline.roles" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Cascader, Switch as ISwitch, InputNumber } from 'view-design';
import MyTable from '@/components/common/table.vue';
import { Popup } from '@/base-class/dynamic-create';
import { setMenu as set, getMenuInfo as get } from '@/config/api';
import { carryChained } from '@/utils/index';
import { popupRole } from '@/config/columns';
import { userModule } from '@/store/index';

// 过滤掉非菜单项
function getMenu(data: ResponseSimple.getMenuTree[]): ResponseSimple.getMenuTree[] {
    const result: ResponseSimple.getMenuTree[] = [];
    data.every(v => {
        const isMenu = !!v.ismenu;
        if (isMenu) {
            const store = { ...v };
            v.children && v.children.length && (store.children = getMenu(v.children));
            result.push(store);
        }
        return isMenu;
    });
    return result;
}

const tableListType: Dictionary<string> = {
    roles: 'role',
};

@Component({
    name: 'MenuManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        Cascader,
        ISwitch,
        InputNumber,
        MyTable,
    },
})
export default class MenuManageHandle extends Popup<'SetMenu'> {
    $refs!: {
        form: IForm;
    }

    // 所属模块
    @Prop({ type: String, required: true })
    module!: string;
    // 模块的数据源 -> 做级联菜单的数据源
    @Prop({ type: Array, required: true })
    moduleData!: ResponseSimple.getMenuTree[];

    loading = false;
    formInline = {
        type: 1,
        id: undefined,
        module: '',
        in_title: '',
        title: '',
        pid: [],
        url_value: '',
        value: '',
        online_hide: false,
        icon: '',
        ismenu: false,
        sort: 0,
        roles: [],
    };
    columns = {
        roles: popupRole(this, 'roles'),
    };

    get i18n() {
        const label = {
            title: `${this.$t('h.formLabel.menu.menuTitle')}: `,
            in_title: `${this.$t('h.formLabel.menu.pageTitle')}: `,
            url_value: `${this.$t('h.formLabel.menu.menuPath')}: `,
            value: `${this.$t('h.formLabel.menu.menuRoute')}: `,
            pid: `${this.$t('h.formLabel.menu.parentMenu')}: `,
            online_hide: `${this.$t('h.formLabel.menu.onlineHide')}: `,
            ismenu: `${this.$t('h.formLabel.menu.isMenu')}: `,
            sort: `${this.$t('h.formLabel.menu.sort')}: `,
            icon: `${this.$t('h.formLabel.menu.icon')}: `,
            roles: `${this.$t('h.formLabel.affiliatedRole')}: `,
        };
        const placeholder = {
            title: this.$t('h.placeholder.pleaseEnter', { msg: label.title }),
            in_title: this.$t('h.placeholder.pleaseEnter', { msg: label.in_title }),
            url_value: this.$t('h.placeholder.pleaseEnter', { msg: label.url_value }),
            value: this.$t('h.placeholder.pleaseEnter', { msg: label.value }),
            pid: this.$t('h.placeholder.pleaseSelect', { msg: label.pid }),
            sort: this.$t('h.placeholder.pleaseEnter', { msg: label.sort }),
            icon: this.$t('h.placeholder.pleaseSelect', { msg: label.icon }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            title: { required: true, message: placeholder.title, trigger: 'blur' },
            value: { required: true, message: placeholder.value, trigger: 'blur' },
        };
    }
    // 父菜单是数据源
    get pidData() {
        return getMenu(this.moduleData);
    }

    @Watch('type', { immediate: true })
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }
    @Watch('module', { immediate: true })
    changeModule(val: string) {
        this.formInline.module = val;
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, id } = this;
        Object.assign(formInline, { id });
        id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
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
    setDetails({ id, pid, module, title, url_value, value, online_hide, icon, ismenu, in_title, sort }: API.Response['getMenuInfo']) {
        const { type, formInline, moduleData } = this;
        const _pid = type === 1 ? id : pid;
        const _pids: number[] = [];
        carryChained(moduleData, { id: _pid }, (data, isDeep) => (isDeep ? _pids.push(data.id) : _pids.unshift(data.id)));
        if (type === 1) {
            (formInline.pid as number[]) = _pids;
        } else {
            Object.assign(formInline, {
                pid: _pids,
                module,
                title,
                in_title,
                url_value,
                value,
                online_hide: Boolean(online_hide),
                icon,
                ismenu: Boolean(ismenu),
                sort,
            });
        }
    }
    // 获取图标
    openIcon() {
        const { forbidden: readonly } = this;
        this.$getDynamicComponent('icon', () => {
            this.$createIconHandle({
                readonly,
                $events: {
                    success: (icon: string) => {
                        this.formInline.icon = icon;
                    },
                },
            }).show();
        });
    }
    // 选择弹窗
    selectCard(type: keyof MenuManageHandle['formInline']) {
        if (this.forbidden) return;
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                fromQuery: {
                    org_id: userModule.userOrg.id,
                },
                multiple: type === 'roles',
                $events: {
                    success: (data: Dictionary<any>[]) => {
                        (formInline[type] as Dictionary<any>[]) = data;
                    },
                },
            }).show();
        });
    }
    // 提交事件
    async ok() {
        const { $refs: { form: { validate }}, formInline: { online_hide, ismenu, roles, pid, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                online_hide: Number(online_hide),
                pid: pid[pid.length - 1] || 0,
                ismenu: Number(ismenu),
                roles: roles.map((v: any) => v.id),
            });
            const { type: types } = await set(params);
            if (!types) this.$emit('success');
            this.loading = false;
            return !types;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>