<template>
    <my-modal
        v-model="value"
        @on-visible-change="$event || destroy()"
        @on-ok="handle"
        :footer-hide="readonly"
        :title="$t('h.modal.titles.iconList')"
        width="780px"
    >
        <i-input v-model="query" :placeholder="$t('h.placeholder.pleaseEnterIconName')" />
        <icons @click="handle" :filter-key="query" class="form" />
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { Input as IInput } from 'view-design';
import Icons from '@/components/common/icons.vue';
import { BasePopup } from '../../base-class/dynamic-create';

@Component({
    name: 'IconHandle',
    components: {
        IInput,
        Icons,
    },
})
export default class IconHandle extends BasePopup {
    @Prop(Boolean)
    readonly!: boolean;

    query = '';

    handle(icon?: string) {
        const { readonly } = this;
        readonly || this.$emit('success', icon);
        this.hide();
    }
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>