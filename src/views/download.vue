<template>
    <div class="download-wrapper">
        <loading :loading="loading" type="B" />
        <div class="download-explain d-v-c">
            <p class="t-a">
                <img :src="logo">
                <span @click="down" :disabled="!hasApk" class="address t-a">{{hasApk ? $t('h.tips.clickDownloadInstallPack') : $t('h.tips.noInstallPack')}}</span>
            </p>
        </div>
        <div class="download-mask t-a" v-if="isWeixin">
            <svg-icon class="download-mask-point" icon-class="point-arrows" />
            <p class="download-mask-tips d-v-c">{{$t('h.tips.clickRightUpCorner')}}<br/>{{$t('h.tips.selectBrowserOpen')}}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { isWeixin } from '@/utils/index';
import { getPackage } from '@/config/api';
import lodashGet from 'lodash/get';

const logo = require('@/assets/images/logo.png');

@Component
export default class Download extends Vue {
    logo = logo;
    isWeixin = isWeixin();
    hasApk = true;
    loading = false;

    // 获取 apk url
    async getUrl() {
        this.loading = true;
        const { data } = await getPackage(1);
        this.loading = false;
        return lodashGet(data, 'apk.url');
    }
    // 开始下载安装包
    async down() {
        console.log('获取安装包接口，后台逻辑错误');
        // const url = await this.getUrl();
        // if (url) {
        //     window.location = url;
        // } else {
        //     this.hasApk = false;
        //     this.$Message.info(this.$t('h.tips.noInstallPack'));
        // }
    }
}

</script>

<style scoped lang="scss">
    .download-wrapper {
        .download-explain {
            position: absolute;
            width: 100%; height: 100%;
            p {
                width: 100%;
                padding: 0 1rem;
                img {
                    margin-bottom: 10px;
                }
                .address {
                    width: 100%; height: 34px;
                    line-height: 34px;
                    background-color: orange;
                    display: inline-block;
                    color: #ffffff;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                }
                .address[disabled] {
                    pointer-events: none;
                }
            }
        }
        .download-mask {
            background: rgba(0, 0, 0, 0.5);
            position: fixed;
            left: 0; top: 0;
            width: 100%; height: 100%;
            z-index: 1000;
            &-point {
                font-size: 2rem;
                display: inline-block;
                position: absolute;
                right: 0.5rem; top: 0.3rem;
            }
            &-tips {
                color: #fff;
                font-size: 0.46rem;
                height: 100%; line-height: 1.5;
                margin: 0;
            }
        }
    }
</style>