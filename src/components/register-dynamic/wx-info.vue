<template>
    <my-modal
        v-model="value"
        :title="$t('h.modal.titles.wxinfo')"
        width="300px"
        footer-hide
    >
        <i-form :model="formInline" :label-width="80" class="content" ref="form">
            <form-item :label="i18n.label.headimgurl" prop="headimgurl">
                <div v-if="formInline.headimgurl" class="upload_item alignCenter">
                    <img :src="formInline.headimgurl" @error="globalImgFail" @click="$previewRefresh" preview="wxInfoImg" class="cursor-pointer" />
                    <p @click.stop class="upload_mask">
                        <svg-icon class="dis_pointer-events" icon-class="eye_center" />
                    </p>
                </div>
            </form-item>
            <form-item :label="i18n.label.nickname" prop="nickname">
                <i-input :value="formInline.nickname || $i18n.t('h.common.none')" readonly />
            </form-item>
            <form-item :label="i18n.label.region" prop="region">
                <i-input :value="formInline.region || $i18n.t('h.common.none')" readonly />
            </form-item>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput } from 'view-design';
import { BasePopup } from '@/base-class/dynamic-create';
import { getUserWxInfo as get } from '@/config/api';


@Component({
    name: 'WxInfoHandle',
    components: {
        IForm,
        FormItem,
        IInput,
    },
})
export default class WxInfoHandle extends BasePopup {
    $refs!: {
        form: IForm
    }

    @Prop({ type: Number, required: true })
    id!: number;


    formInline = {
        headimgurl: '',
        nickname: '',
        region: '',
    }
    // 用户头像的大小(有0、46、64、96、132数值可选，0代表640*640正方形头像)
    size = 0;


    get i18n() {
        const label = {
            headimgurl: `${this.$i18n.t('h.formLabel.wxinfo.headimgurl')}: `,
            nickname: `${this.$i18n.t('h.formLabel.wxinfo.nickname')}: `,
            region: `${this.$i18n.t('h.formLabel.wxinfo.region')}: `,
        };

        return { label };
    }


    @Watch('id', { immediate: true })
    idUpdate(val: number, oldVal?: number) {
        if (val && val !== oldVal) this.getDetails(val);
    }

    // 关闭前事件
    suffixFunc() {
        this.$refs.form.resetFields();
    }
    /**
     * @description: 获取微信详细信息
     * @param {Number} id: 用户 id
     */
    async getDetails(id: number) {
        const { formInline, mergeRegion } = this;
        const { type, data } = await get(id);
        if (!type) {
            Object.assign(formInline, { nickname: data.nickname, headimgurl: data.headimgurl, region: mergeRegion(data) });
            data.headimgurl && (this.size = Number(data.headimgurl.split('/')[1]) || 200);
        }
    }
    /**
     * @description: 合并行政区域
     * @param {Object} data
     */
    mergeRegion(data: ResponseUser.WxInfo) {
        return ['country', 'province', 'city'].reduce((prev, cur) => (prev + (data[cur as 'city'] || '')), '');
    }
    ok() {
        this.$emit('success');
    }
}
</script>


<style lang="scss" scoped>
    .content {
        margin: 10px;

        .again {
            flex: auto;
            display: flex;
            align-items: center;
        }
        .imgs {
            font-size: 0;
            width: 250px;
            height: 250px
        }
    }
</style>
