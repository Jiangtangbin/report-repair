
<template>
  <div class="svg-icon-wrapper">
    <alert class="svg-icon-alert" type="success">{{$t('h.tips.copyNameAndComponents')}}</alert>
    <icons #default="icon" class="svg-icon-icons">
        <p @click="copyStr(icon, $event)" @dblclick="copyNode(icon, $event)" class="svg-icon-icons-box d-v-c c-p">
            <svg-icon :icon-class="icon" class="svg-icon-icons-box-icon" />
            <span class="svg-icon-icons-box-icon-text t-a">{{icon}}</span>
        </p>
    </icons>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Icons from '@/components/common/icons.vue';
import { Alert } from 'view-design';
import clipboard, { IMessage } from '@/utils/clipboard';
import { i18n } from '@/locale/index';

@Component({
    components: {
        Alert,
        Icons,
    },
})
export default class PageIcon extends Vue {
    /**
     * @description: 复制字符串到剪切板
     * @param {String} str: 复制的字段
     * @param {Event} event: 事件
     * @param {String} message: 提示
     */
    copyStr(str: string, event: Event, message: IMessage = { success: i18n.t('h.tips.copyIconNameSuccess') as string, error: i18n.t('h.tips.copyIconNameError') as string }) {
        clipboard(str, event, message);
    }
    /**
     * @description: 复制组件(字符串)到剪切板
     * @param {String} name: 组件名
     * @param {Event} event: 事件
     */
    copyNode(name: string, event: Event) {
        this.copyStr(`<svg-icon icon-class="${name}" />`, event, {
            success: i18n.t('h.tips.copyComponentSuccess') as string,
            error: i18n.t('h.tips.copyComponentError') as string,
        });
    }
}
</script>

<style scoped lang="scss">
    $icon-color: #494e59;

    .svg-icon-wrapper {
        width: 100%;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-flow: row wrap;
        align-content: flex-start;
        .svg-icon-alert {
            width: 100%;
        }
        .svg-icon-icons {
            width: 100%;
            flex: auto;
            display: flex;
            flex-flow: row wrap;
            justify-content: space-between;
            &-box {
                flex-flow: column wrap;
                color: $icon-color;
                padding: 10px;
                &:hover {
                    background: #f0eeea;
                }
                &-icon {
                    font-size: 0.36rem;
                }
                &-icon-text {
                    font-size: 18px;
                    margin: 5px 0 0;
                }
            }
        }
    }
</style>