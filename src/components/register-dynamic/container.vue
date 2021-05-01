<template>
    <my-modal
        v-model="value"
        v-bind="$attrs"
        :title="$te(title) ? $t(title) : title"
    >
        <slot />
    </my-modal>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { BasePopup } from '@/base-class/dynamic-create';

@Component({
    inheritAttrs: false,
    name: 'ContainerHandle',
})
export default class ContainerHandle extends BasePopup {
}
</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';
</style>