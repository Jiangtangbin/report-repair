<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        :title="$t(`h.modal.titles.${title}`)"
        :footer-hide="true"
        :fullscreen="true"
    >
        <iframe :src="url" frameborder=0 class="iframe-wrapper"></iframe>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';

@Component({
    name: 'PublicIframeHandle',
})
export default class PublicIframeHandle extends BasePopup {
    @Prop({ type: String, default: 'externalLinks' })
    title!: string;
    @Prop({ type: String, default: 'https://cn.vuejs.org/' })
    url?: string
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    @include utils-pierce(ivu-modal-body) {
        padding: 0;
        overflow: hidden;
    }

    .iframe-wrapper {
        width: 100%;
        height: 100%;
    }
</style>