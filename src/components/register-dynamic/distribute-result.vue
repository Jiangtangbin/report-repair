<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :isConfim="false"
        :title="$t('h.modal.titles.viewDistributeResult')"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" class="form" ref="form">
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
import { getDistributionInfo as get } from '@/config/api';
import { popupDistributeResult } from '@/config/columns';
import bus from '@/utils/bus';

const tableListType: Dictionary<string> = {
    devices: 'device',
};

@Component({
    name: 'DistributeResultHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        MyTable,
    },
})
export default class DistributeResultHandle extends Popup<'DistributionInfo'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    columns = {
        devices: popupDistributeResult(),
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

    created() {
        bus.$on('on-update-result', this.updateStatus);
    }
    beforeDestroy() {
        bus.$off('on-update-result', this.updateStatus);
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
    setDetails(data: API.Response['DistributionInfo']) {
        const { formInline } = this;
        Object.assign(formInline, { devices: data || [] });
    }
    // 更新状态
    updateStatus(result: object) {
        const { formInline: { devices, id }} = this;
        if (id === result.distribute_id) {
            devices.filter(v => {
                if (result.device.includes(v.device_id)) {
                    this.$set(v, 'result', result.result);
                    this.$set(v, 'msg', result.msg);
                    this.$set(v, 'time', result.time);
                }
            });
        }
    }
    async ok() {
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