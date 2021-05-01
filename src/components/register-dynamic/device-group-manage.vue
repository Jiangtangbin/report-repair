<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="`${titlePrefix}${$t('h.modal.titles.deviceGroup')}`"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="name" :label="i18n.label.name">
                <i-input v-model="formInline.name" :readonly="forbidden" :placeholder="i18n.placeholder.name" />
            </form-item>
            <form-item prop="org_id" :label="i18n.label.org_id">
                <div class="col">
                    <div @click.self="(!isBjg && type === 1) && (forbidden || selectCard('org_id'))" :label="i18n.placeholder.org_id" class="receive-wrapper simulate-input pseudo-prefix-empty">
                        <figure v-for="(item, key) of formInline.org_id" :key="key" class="receive-item">
                            <figcaption @click="openWins('org', item.id)" :title="item.name" class="t-o-e simulate-a">{{item.name}}</figcaption>
                            <svg-icon
                                v-show="!isBjg && type === 1 && !forbidden"
                                @click.stop.native="delReceiveItem('org_id', key)"
                                class="receive-item-close"
                                icon-class="close"
                            />
                        </figure>
                    </div>
                    <my-button v-if="!isBjg && type === 1" v-show="!forbidden" @click="selectCard('org_id')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                </div>
            </form-item>
            <form-item prop="remark" :label="i18n.label.remark">
                <i-input v-model="formInline.remark" :readonly="forbidden" type="textarea" :placeholder="i18n.placeholder.remark" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { setDeviceGroup as set } from '@/config/api';
import lodashGet from 'lodash/get';
import { userModule } from '@/store/index';

const tableListType: Dictionary<string> = {
    org_id: 'customer',
};

@Component({
    name: 'DeviceGroupManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
    },
})
export default class DeviceGroupManageHandle extends Popup<'SetDeviceGroup'> {
    $refs!: {
        form: IForm;
    }
    
    // 修改、详情时因为没有详情接口，传过来的数据
    @Prop(Object)
    data?: ResponseDevice.DeviceGroupTree;

    loading = false;
    formInline = {
        type: 1,
        id: 0,
        name: '',
        org_id: [],
        remark: '',
    };

    get i18n() {
        const label = {
            name: `${this.$t('h.formLabel.name')}: `,
            org_id: `${this.$t('h.formLabel.affiliatedCustomer')}: `,
            remark: `${this.$t('h.formLabel.remark')}: `,
        };
        const placeholder = {
            name: this.$t('h.placeholder.pleaseEnter', { msg: label.name }),
            org_id: this.$t('h.placeholder.pleaseSelect', { msg: label.org_id }),
            remark: this.$t('h.placeholder.pleaseEnter', { msg: label.remark }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            name: { required: true, message: placeholder.name, trigger: 'blur' },
            org_id: { required: true, message: placeholder.org_id },
        };
    }
    // 是否是被监管客户，被监管客户无法选择所属客户
    get isBjg() {
        const orgattr = userModule.user.info.orgattr;
        return !orgattr || orgattr === 'bjg';
    }

    @Watch('type', { immediate: true })
    changeT(type: 1 | 2 | 'details') {
        typeof type === 'number' && (this.formInline.type = type);
    }

    // 打开前事件
    prefixFunc() {
        const {
            formInline,
            id,
            data,
        } = this;

        id && (formInline.id = id);
        data && this.setDetails(data);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 获取详情
    // async getDetails() {
    //     const { id } = this;
    //     if (!id) return console.log('请填写详情 id: ', id);
    //     this.loading = true;
    //     const { type, data } = await get(id);
    //     if (!type) this.setDetails(data);
    //     this.loading = false;
    // }
    // 设置详情
    setDetails({ name, org_id: orgId, orgname, remark, ...args }: ResponseDevice.DeviceGroupList) {
        const { formInline } = this;
        Object.assign(formInline, {
            name,
            org_id: orgId ? [{ id: orgId, name: orgname }] : [],
            remark,
        });
    }
    // 选择弹窗
    selectCard(type: keyof DeviceGroupManageHandle['formInline']) {
        if (this.forbidden) return;
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
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
        const { $refs: { form: { validate }}, id, type, formInline, formInline: { org_id: org, ...args },} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                id: type === 1 ? undefined : id,
                org_id: lodashGet(org, '[0].id', ''),
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