<template>
    <div class="package-wrapper">
        <my-button v-if="hasAdd" @click="handle" class="package-upload" type="primary">{{i18n.label.uploadPlugPack}}</my-button>
        <main :style="{ height: !hasAdd ? '100%' : 'calc(100% - 62px)' }" class="package-main">
            <span v-if="!data.length">{{i18n.label.noInstallPackPlug}}</span>
            <div v-for="item of data" :key="item.type" class="package-main-menu">
                <ul class="package-main-menu-desc">
                    <li><h3>{{i18n.label.appName}}{{$te(item.name) ? $t(item.name) : item.name}}</h3></li>
                    <li>{{i18n.label.versionName}}{{item.version_name || $t('h.common.unknown')}}</li>
                    <li>{{i18n.label.versionNumber}}{{item.version_no || $t('h.common.unknown')}}</li>
                    <li>{{i18n.label.uploadTime}}{{item.create_time || $t('h.common.unknown')}}</li>
                    <li>{{i18n.label.remark}}{{item.remark || $t('h.common.none')}}</li>
                </ul>
                <figure class="package-main-menu-image">
                    <q-r
                        :dot-scale="1"
                        :margin="5"
                        :size="240"
                        :text="item.parseUrl || item.url"
                        logo-background-color="white"
                    />
                    <figcaption class="f-c-i">
                        <my-button
                            v-if="item.type !== 4"
                            @click="download(item)"
                            class="f-c-i"
                            type="primary"
                        >{{i18n.label.clickButtonDownload}}</my-button>
                    </figcaption>
                </figure>
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QR from 'vue-qr';
import { getPackage as get } from '@/config/api';
import { getAuth, PageAuth } from '@/base-class/list';

type Datum = ResponseSimple.PackageOptions & { name: string; parseUrl: string; };

const apkUrl = `${window.location.origin}/mini.html#/download`;
const titles = {
    apk: 'h.other.android',
    ios: 'ios',
    plugin: 'h.package.browserPlug',
};

@Component({
    name: 'package-manage',
    components: {
        QR,
    },
})
export default class PackageManage extends Vue {
    auth: PageAuth['package-manage'][] = [];
    data: Datum[] = [];

    get hasAdd() {
        const { auth } = this;
        return auth.includes('add');
    }
    get i18n() {
        const label = {
            uploadPlugPack: `${this.$t('h.package.uploadPlugPackage')}`,
            noInstallPackPlug: `${this.$t('h.package.noInstallPackPlug')}`,
            appName: `${this.$t('h.package.applyName')}: `,
            versionName: `${this.$t('h.package.versionName')}: `,
            versionNumber: `${this.$t('h.package.versionNumber')}: `,
            uploadTime: `${this.$t('h.package.uploadTime')}: `,
            remark: `${this.$t('h.formLabel.remark')}: `,
            clickButtonDownload: `${this.$t('h.package.buttonDownload')}`,
        };

        return { label };
    }

    created() {
        const { auth } = this;
        getAuth('package-manage', auth);
        this.getPackage();
    }

    /**
     * @description: 图标点击事件
     * @param {String} name: 点击的图标所属权限或图标名称
     */
    async handle() {
        this.$getDynamicComponent('packageManage', () => {
            this.$createPackageManageHandle({
                type: 1,
                $events: { success: 'getPackage' },
            }).show();
        });
    }
    // 获取插件列表
    async getPackage() {
        let { type, data } = await get();
        if (!type) {
            this.data = [];
            Object.entries(data)
                .every(([k, v]) => {
                    if (v && Object.keys(v).length) {
                        this.data.push({ ...v, name: titles[k as 'apk'], parseUrl: k === 'apk' ? apkUrl : '' });
                    }
                    return true;
                });
        }
    }
    // 下载
    download({ parseUrl, url }: Datum) {
        parseUrl
            ? window.location.href = parseUrl
            : window.open(url);
    }
}
</script>

<style scoped lang="scss">
    .package-wrapper {
        padding: 15px 20px;
        .package-upload {
            margin: 10px 20px 20px;
        }
        .package-main {
            width: 100%; height: 100%;
            background-color: $--background-color;
            color: $--white;
            padding: 12px 20px;
            display: flex;
            flex-flow: row wrap;
            justify-content: space-between;
            align-items: flex-start;
            &-menu {
                display: flex;
                flex-flow: column;
                &-desc {
                    font-size: 0.14rem;
                    line-height: 26px;
                }
                &-image {
                    display: flex;
                    flex-flow: column;
                    align-items: flex-start;
                }
            }
        }
    }
</style>