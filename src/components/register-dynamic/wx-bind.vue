<template>
    <my-modal
        v-model="value"
        :title="$t('h.modal.titles.wxbind')"
        width="300px"
        footer-hide
    >
        <div class="content">
            <p>{{$t('h.formLabel.wxbind.scanQrcode')}}</p>
            <img v-if="url" :src="url" class="imgs" />
            <template v-else>
                <p class="again">
                    <span>{{$t('h.formLabel.wxbind.qrcodeError')}}</span>
                    <span @click="prefixFunc" class="simulate_a c-p">{{$t('h.formLabel.wxbind.repeatGet')}}</span>
                </p>
                <span class="info-hint">{{$t('h.formLabel.wxbind.errorInfo')}}: {{ message }}</span>
            </template>
        </div>
    </my-modal>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Input as IInput } from 'view-design';
import QR from 'vue-qr';
import { BasePopup } from '@/base-class/dynamic-create';
import { getQRCodeUrl as get } from '@/config/api';
import bus from '@/utils/bus';


@Component({
    name: 'WxBindHandle',
    components: {
        IInput,
        QR,
    },
})
export default class WxBindHandle extends BasePopup {

    url = '';
    message = '';


    created() {
        bus.$on('on-bind-wx', this.ok);
    }
    beforeDestroy() {
        bus.$off('on-bind-wx', this.ok);
    }


    // 打开弹窗前执行的函数
    async prefixFunc() {
        const { type, data, msg } = await get();
        this.message = msg;
        type
            ? msg && this.$Message.info(msg)
            : this.url = data.url;
    }
    // 微信号绑定成功
    ok() {
        this.$Message.success(this.$t('h.tips.bindSuccess'));
        this.$emit('success');
        this.hide();
    }
}
</script>


<style lang="scss" scoped>
    .content {
        line-height: 30px;
        font-size: 16px;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
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
        .info-hint {
            color: red;
        }
    }
</style>

