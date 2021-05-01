<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mobileLoadLanguageAsync } from '@/views/mobile/locale/index';

const languageMenu = ['zh-CN', 'en-US', 'en'] as const;
const languageAlias = { en: 'en-US' } as const;

@Component
export default class MobileApp extends Vue {
    beforeCreate() {
        const language = window.navigator.language as Language;
        const lang = languageMenu.includes(language) ? language : 'zh-CN';
        mobileLoadLanguageAsync(languageAlias[lang as keyof typeof languageAlias] || lang);
    }
}
</script>

<style scoped lang="scss">
#app {
    color: $--gray;
}
</style>
