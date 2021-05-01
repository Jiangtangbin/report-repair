<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.distributionConfigOrFile', { msg: t === 'config' ? $t('h.formLabel.configManage.config') : $t('h.formLabel.fileManage.file') })"
        :footer-hide="forbidden || !!logId"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item v-if="t === 'config'" prop="devices" :label="i18n.label.devices">
                <my-table :columns="finallyColumns.devices" :data="formInline.devices" />
            </form-item>
            <form-item v-else prop="files" :label="i18n.label.files">
                <my-table :columns="finallyColumns.files" :data="formInline.files" />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import MyTable from '@/components/common/table.vue';
import { setConfigOrFile as set } from '@/config/api';
import { popupDeviceManage, popupFile } from '@/config/columns';
import bus from '@/utils/bus';

const tableListType: Dictionary<string> = {
    devices: 'device',
    files: 'file',
};

@Component({
    name: 'DistributeContentHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        MyTable,
    },
})
export default class DistributeContentHandle extends Popup<'ConfigOrFile'> {
    $refs!: {
        form: IForm;
    }
    
    @Prop({ type: String, default: 'config' })
    t!: string;
    @Prop({ type: Number })
    config_id?: number;
    @Prop({ type: Number })
    file_id?: number;

    loading = false;
    columns = {
        devices: popupDeviceManage(this, 'devices'),
        files: popupFile(this, 'files'),
    };
    logId = null;
    formInline = {
        t: this.t,
        config_id: this.config_id,
        file_id: this.file_id,
        devices: [],
        files: [],
    };

    get i18n() {
        const label = {
            devices: `${this.$t('h.formLabel.device')}: `,
            files: `${this.$t('h.formLabel.fileManage.file')}: `,
        };
        const placeholder = {
            devices: this.$t('h.placeholder.pleaseSelect', { msg: label.devices }),
            files: this.$t('h.placeholder.pleaseSelect', { msg: label.files }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return this.t === 'config' ? {
            devices: { required: true, type: 'array', message: placeholder.devices },
        } : {
            files: { required: true, type: 'array', message: placeholder.files },
        };
    }

    created() {
        bus.$on('on-update-result', this.updateStatus);
    }
    beforeDestroy() {
        bus.$off('on-update-result', this.updateStatus);
    }

    // 打开前事件
    prefixFunc() {
        // const { formInline, id } = this;

        // id && (formInline.id = id);
        // id && this.getDetails();
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 获取详情
    // async getDetails() {
    //     const { id, setDetails } = this;
    //     if (!id) return console.log('请填写详情 id: ', id);
    //     this.loading = true;
    //     const { type, data } = await get(id);
    //     if (!type) setDetails(data);
    //     this.loading = false;
    // }
    // 设置详情
    // setDetails(data: API.Response['DeviceGroupDevice']) {
    //     const { formInline } = this;
    //     Object.assign(formInline, { devices: data || [] });
    // }
    // 更新状态
    updateStatus(result: object) {
        const { formInline: { devices }, logId } = this;
        if (logId === result.distribute_id) {
            devices.filter(v => {
                if (result.device.includes(v.id)) {
                    this.$set(v, 'result', result.result);
                    this.$set(v, 'msg', result.msg);
                    this.$set(v, 'time', result.time);
                }
            });
        }
    }
    // 选择弹窗
    selectCard(type: keyof DistributeContentHandle['formInline']) {
        if (this.forbidden) return;
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                multiple: ['devices', 'files'].includes(type),
                fromQuery: { isonline: 1 },
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
        const { $refs: { form: { validate }}, formInline: { devices, files, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                devices: devices.map(v => v.id),
                files: files.map(v => v.id),
            });
            const { type, data: { id }} = await set(params);
            if (!type) {
                this.logId = id;
                this.$emit('success')
                this.loading = false;
            };
        }
        return false;
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    @include utils-pierce(ivu-table-cell) {
        .correct, .error {
            font-size: 24px;
            margin-top: 8px;
        }
        .correct {
            color: #60DA8D;
        }
        .error {
            color: #FE5967;
        }
    }
</style>