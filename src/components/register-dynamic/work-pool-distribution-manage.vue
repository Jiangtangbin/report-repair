<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :loading-func="ok"
        :title="$t('h.modal.titles.workDistribution')"
        width="780px"
        loading
    >
        <loading :loading="loading" type="B" />
        <i-form :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="reciever" :label="i18n.label.reciever">
                <div class="col">
                    <div @click.self="forbidden || selectCard('reciever')" :label="i18n.placeholder.reciever" class="receive-wrapper simulate-input pseudo-prefix-empty">
                        <figure v-for="(item, key) of formInline.reciever" :key="key" class="receive-item">
                            <figcaption :title="item.username" class="t-o-e simulate-a">{{item.username}}</figcaption>
                            <svg-icon
                                v-show="!forbidden"
                                @click.stop.native="delReceiveItem('reciever', key)"
                                class="receive-item-close"
                                icon-class="close"
                            />
                        </figure>
                    </div>
                    <my-button v-show="!forbidden" @click="selectCard('reciever')" class="k-w" type="primary">{{$t('h.formLabel.choice')}}</my-button>
                </div>
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { Popup } from '@/base-class/dynamic-create';
import { distributionWork as set } from '@/config/api';
import lodashGet from 'lodash/get';

const tableListType: Dictionary<string> = {
    reciever: 'account',
};

@Component({
    name: 'WorkPoolDistributionManageHandle',
    components: {
        IForm,
        FormItem,
        IInput,
    },
})
export default class WorkPoolDistributionManageHandle extends Popup<'DistributionWork'> {
    $refs!: {
        form: IForm;
    }

    loading = false;
    formInline = {
        work_id: 0,
        reciever: [],
    };

    get i18n() {
        const label = {
            reciever: `${this.$t('h.formLabel.work.reciever')}: `,
        };
        const placeholder = {
            reciever: this.$t('h.placeholder.pleaseSelect', { msg: label.reciever }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;

        return {
            reciever: { required: true, message: placeholder.reciever },
        };
    }

    // 打开前事件
    prefixFunc() {
        const { formInline, id } = this;
        id && (formInline.work_id = id);
    }
    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    // 选择弹窗
    selectCard(type: keyof WorkPoolDistributionManageHandle['formInline']) {
        if (this.forbidden) return;
        this.$getDynamicComponent('tableList', () => {
            const { formInline } = this;
            this.$createTableListHandle({
                t: tableListType[type],
                checked: formInline[type],
                fromQuery: { role: 'yw' },
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
        const { $refs: { form: { validate }}, formInline: { reciever: account_id, ...args }} = this;
        const flag = await validate();
        if (flag) {
            this.loading = true;
            const params = Object.assign(args, {
                reciever: lodashGet(account_id, '[0].id', ''),
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
