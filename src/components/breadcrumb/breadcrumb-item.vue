<template>
    <span class="breadcrumb-container">
        <span
            :class="['breadcrumb-container-inner', to ? 'is-link' : '']"
            ref="link"
            role="link">
            <slot></slot>
        </span>
        <svg-icon v-if="separatorIcon" class="breadcrumb-container-separator" :icon-class="separatorIcon"></svg-icon>
        <span v-else class="breadcrumb-container-separator" role="presentation">{{separator}}</span>
    </span>
</template>

<script lang="ts">
import { Prop, Inject, Component, Vue } from 'vue-property-decorator';
import Breadcrumb from './breadcrumb.vue';

@Component
export default class BreadcrumbItem extends Vue {
    // 注入
    @Inject('Breadcrumb')
    Breadcrumb!: Breadcrumb;

    @Prop({ type: Object, default: () => ({}) })
    to!: object
    @Prop({ type: Boolean, default: false })
    replace!: boolean

    private separator = '';
    private separatorIcon = '';

    mounted() {
        this.separator = this.Breadcrumb.separator;
        this.separatorIcon = this.Breadcrumb.separatorIcon;
    }

    handle() {
        const { to, $router } = this;
        if (!to || !$router) return;
        this.replace ? $router.replace(to) : $router.push(to);
    }
}
</script>

<style scoped lang="scss">
.breadcrumb-container {
    float: left;
    &-inner {
        &.is-link, & a {
            color: var(--black2);
            text-decoration: none;
            transition: $--color-transition-base;
            &:hover {
                color: var(--primary-active);
            }
        }
    }
    &-separator {
        margin: 0 9px;
        font-weight: bold;
        &[class*=svg-icon] {
            margin: 0 6px;
            font-weight: normal;
        }
    }
    &:last-child {
        &-inner,
        &-inner a {
            &, &:hover {
                font-weight: normal;
                color: var(--black2);
                cursor: text;
            }
        }
        &-separator {
            display: none;
        }
    }
}
</style>