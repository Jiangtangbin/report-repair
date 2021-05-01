import Vue from 'vue';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import { i18n as viewDesignI18n } from 'view-design';
import { EsModuleComponent } from 'vue/types/options';

Vue.use(VueI18n);

viewDesignI18n((key: string, value: any) => {
    return i18n.t(key, value);
});

const loadedLanguages: Language[] = []; // 已加载的语言
// 动态加载语言的映射
const languageMap: Record<Language, () => Promise<EsModuleComponent>> = {
    'zh-CN': () => import(/* webpackChunkName: "lang-zh-CN" */ '@/views/mobile/locale/lang/zh-CN'),
    'en-US': () => import(/* webpackChunkName: "lang-en-US" */ '@/views/mobile/locale/lang/en-US'),
};

/**
 * @description: 设置要显示语言
 * @param {Language} lang: 待显示的语言
 */
function setI18nLanguage(lang: Language) {
    i18n.locale = lang;
    axios.defaults.headers.common['Accept-Language'] = lang;
    // @ts-ignore
    document.querySelector('html').setAttribute('lang', lang);
    return lang;
}

// 导出实例化的语言
export const i18n = new VueI18n({
    locale: 'a', // 初始给一个不存在的语言, 防止初次懒加载失败
});

export function mobileLoadLanguageAsync(lang: Language): Promise<Language> {
    if (i18n.locale !== lang) {
        if (!loadedLanguages.includes(lang)) {
            return languageMap[lang]()
                .then((language: EsModuleComponent) => {
                    const msgs: Record<string, any> = language.default;
                    i18n.setLocaleMessage(lang, Object.assign(msgs, { i: msgs.i }));
                    loadedLanguages.push(lang);
                    return setI18nLanguage(lang);
                });
        }
        return Promise.resolve(setI18nLanguage(lang));
    }
    return Promise.resolve(lang);
}

if (module.hot) {
    module.hot.accept(['./lang/zh-CN', './lang/en-US'], function () {
        i18n.setLocaleMessage('zh-CN', require('./lang/zh-CN').default);
        i18n.setLocaleMessage('en-US', require('./lang/en-US').default);
    });
}