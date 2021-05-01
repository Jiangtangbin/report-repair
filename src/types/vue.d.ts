import Vue from 'vue';
import { AxiosInstance } from 'axios';
import { RawLocation, Route, RouteConfig } from 'vue-router/types/router';
import { GetDynamicComponent } from '@/components/register-dynamic/';
import { Message, Notice, CollapsePanel, MessageConfig, NoticeConfig, NoticeGlobalConfig } from 'view-design';

declare module 'vue-router/types/router' {
    interface VueRouter extends Matcher {
        matcher: Matcher;
        history: any;
    }
    interface Matcher {
        match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
        addRoutes: (routes: Array<RouteConfig>) => void;
    }
}
declare module 'vue/types/vue' {
    interface Vue {
        // 当前组件是否激活
        _inactive: boolean;
        // 当前组件是否销毁
        _isDestroyed: boolean;
        // 当前组件是否正在销毁
        _isBeingDestroyed: boolean;
        // 全局请求
        $axios: AxiosInstance;
        // 全局动态加载组件
        $getDynamicComponent: GetDynamicComponent;
    }
}
// 为 view-design 补充的声明
declare module 'view-design' {
    // view-design 的 panel 在 ts 里面是 CollapsePanel
    export class Panel extends CollapsePanel { }
    // 补全 view-design Message 里的声明
    export class Message {
        static info(config?: MessageConfig | string): void;
        static success(config?: MessageConfig | string): void;
        static warning(config?: MessageConfig | string): void;
        static error(config?: MessageConfig | string): void;
        static loading(options?: MessageConfig | string): void;
        static config(options?: MessageConfig): void;
        static destroy(): void;
    }
    // 补全 view-design Notice 里的声明
    export class Notice {
        static open(config?: NoticeConfig | string): void;
        static info(config?: NoticeConfig | string): void;
        static success(config?: NoticeConfig | string): void;
        static warning(config?: NoticeConfig | string): void;
        static error(config?: NoticeConfig): void;
        static config(options?: NoticeGlobalConfig): void;
        static close(name?: string): void;
        static destroy(): void;
    }
}