import router, { resetRouter } from './index';
import { appModule, userModule } from '@/store/index';
import { signModule } from '@/store/modules/sign';
import { LoadingBar } from 'view-design';
import setTitle from '@/utils/dom';

const whiteList = ['/', '/icon', '/404'];
let asyncRouteReady = false;

router.beforeEach(async (to, from, next) => {
    const search = window.decodeURIComponent(to.fullPath.split('?')[1] || '');
    const { secret, token, from: fromUrl, ...surplusQuery } = router.match(`?${search}`).query as Record<string, string>;
    // 获取外部链接协议
    // 免登录协议方式
    LoadingBar.start();
    if (!asyncRouteReady) {
        // 用户登录后页面刷新则重新加载路由
        asyncRouteReady = true;
        if (appModule.isLogin) {
            await signModule.addRoutes(userModule.user.auth);
            next({ ...to, replace: true });
            return;
        }
    }
    // secret 免登录方式、token 免登录方式、协议免登录方式
    if (secret || token) {
        const { isLogin } = appModule;
        if (
            !((secret && secret === appModule.fromInfo.secret) ||
            (token && token === appModule.fromInfo.token))
        ) {
            // 如果已登录，先清空路由在进行登录，防止路由重复
            isLogin && resetRouter();
            const { type } = await signModule.login((secret || token) as string);
            if (!type) {
                fromUrl && appModule.alterState({ key: 'fromInfo', value: { url: fromUrl, secret, token }});
                // noLogin 用于免登陆时登陆成功跳出判断
                next({ replace: true, path: to.path, params: to.params, query: { ...(surplusQuery as any), noLogin: 'break' }});
            } else {
                next('/');
            }
            return;
        }
    }
    if (to.name && !whiteList.includes(to.path)) {
        appModule.alterState({ key: 'from', value: to.path });
    }
    if (appModule.isLogin) {
        to.path === '/'
            ? next('/home')
            : next();
    } else {
        whiteList.includes(to.path) ? next() : next('/');
    }
});

(() => {
    let reConnection = 0;
    const reg = /Loading chunk .* failed/g;

    router.afterEach(route => {
        reConnection = 0;
        LoadingBar.finish();
        window.scrollTo(0, 0);
        setTitle(route.meta.title);
    });
    router.onError(error => {
        LoadingBar.finish();
        const isChunkLoadFailed = error.message.match(reg);
        console.log('路由跳转发生错误，组件加载失败，错误原因：', error, isChunkLoadFailed, router);
        reConnection++;
        if (isChunkLoadFailed && reConnection < 5) {
            const targetPath = router.history.pending.fullPath;
            targetPath ? router.replace(targetPath) : console.info('路由路径，', router.history.pending);
        }
    });
})();