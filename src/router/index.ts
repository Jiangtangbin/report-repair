import Vue from 'vue';
import Router from 'vue-router';
import constantRoutes from './module/constant';
import { VueRouter } from 'vue-router/types/router';

Vue.use(Router);

function createRouter(): VueRouter {
    return new Router({
        scrollBehavior: () => ({ x: 0, y: 0 }),
        routes: constantRoutes,
    });
}

const router = createRouter();

export default router;

export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher;
}