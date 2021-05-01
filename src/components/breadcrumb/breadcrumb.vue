<template>
    <div class="breadcrumb-wrapper" aria-label="Breadcrumb" role="navigation">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Provide } from 'vue-property-decorator';

@Component
export default class Breadcrumb extends Vue {
    // 切割线
    @Prop({ type: String, default: '/' })
    separator!: string;
    // 切割线图标名称
    @Prop({ type: String, default: '' })
    separatorIcon!: string;

    // 注入
    @Provide()
    Breadcrumb = this;
}
</script>

<style scoped lang="scss">
    .breadcrumb-wrapper {
        padding: 10px 20px 0 20px;
        @include utils-clearfix;
    }
</style>
