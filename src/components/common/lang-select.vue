<template>
    <dropdown @on-click="setLanguage" trigger="click" class="lang-select-wrapper">
        <div v-if="$route.name === 'home'" class="lang-select">
            <img class="lang-select-img c-p" src="~@/assets/images/home-page-header-info.png" />
            <svg-icon class="lang-select-svg c-p" icon-class="language" />
        </div>
        <svg-icon v-else class="lang-svg c-p" icon-class="language" />
        <dropdown-menu slot="list">
            <template v-for="item of languageMenu">
                <dropdown-item :key="item.value" :disabled="language === item.value" :name="item.value">
                    {{item.title}}
                </dropdown-item>
            </template>
        </dropdown-menu>
    </dropdown>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Dropdown, DropdownMenu, DropdownItem } from 'view-design';
import { appModule } from '@/store/index';
import { loadLanguageAsync } from '@/locale/index';

@Component({
    components: {
        Dropdown,
        DropdownMenu,
        DropdownItem,
    },
})
export default class LangSelect extends Vue {
    get language() {
        return appModule.lang;
    }
    get languageMenu() {
        return appModule.languages;
    }

    /**
     * @description: 设置语言
     * @param {String} lang: 语言
     */
    setLanguage(lang: Language) {
        loadLanguageAsync(lang)
            .then(language => {
                appModule.alterState({ key: 'lang', value: language });
                this.$Message.success(this.$t('h.tips.switchSucceeded'));
            });
    }
}
</script>

<style scoped lang="scss">
    .lang-select-wrapper {
        color: $--black3;
        margin: 1px 5px 0 5px;
        .lang-svg {
            font-size: 0.22rem;
        }
    }
</style>