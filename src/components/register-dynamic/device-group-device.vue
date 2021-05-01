<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.setGroupDevice')"
        :footer-hide="forbidden"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="devices" :label="i18n.label.devices">
                <my-table :columns="finallyColumns.devices" :data="formInline.devices" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyTable from '@/components/common/table.vue';
import { batchAddDevice as set, getDeviceGroupDevices as get } from '@/config/api';
import { popupDeviceManage } from '@/config/columns';

const tableListType: Dictionary<string> = {
    devices: 'device',
};

@Component({
    name: 'DeviceGroupDeviceHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        MyTable,
    },
})
export default class DeviceGroupDeviceHandle extends Popup<'SetDeviceGroupDevice'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    columns = {
        devices: popupDeviceManage(this, 'devices'),
    };
    formInline = {
        id: this.id,
        devices: [],
    };

    get i18n() {
        const label = {
            devices: `${this.$t('h.formLabel.device')}: `,
        };
        const placeholder = {
            devices: this.$t('h.placeholder.pleaseSelect', { msg: label.devices }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            devices: { required: true, type: 'array', message: placeholder.devices },
        };
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, id } = this;

        id && (formInline.id = id);
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
    setDetails(data: API.Response['DeviceGroupDevice']) {
        const { formInline } = this;
        Object.assign(formInline, { devices: data || [] });
    }
    // 选择弹窗
    selectCard(type: keyof DeviceGroupDeviceHandle['formInline']) {
        if (this.forbidden) return;
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                multiple: ['devices'].includes(type),
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
        const { $refs: { form: { validate }}, formInline: { devices, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                flags: devices.map(v => v.id),
            });
            const { type } = await set(params);
            if (!type) this.$emit('success');
            this.loading = false;
            return !type;
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>