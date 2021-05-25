<template>
    <div class="nav-avatar-wrapper">
        <realtime-task />
        <lang-select v-if="showLanguage" />
        <dropdown @on-click="handle" class="nav-avatar" trigger="click">
            <div v-if="$route.name === 'home'" class="nav-avatar-person c-p">
                <img class="nav-avatar-person-img" src="~@/assets/images/home-page-header-info.png" />
                <svg-icon class="nav-avatar-person-svg" icon-class="header-person" />
            </div>
            <div v-else class="nav-avatar-person c-p">
                <svg-icon class="nav-avatar-person-header-person" icon-class="header-person" />
            </div>
            <dropdown-menu @on-click="handle" slot="list">
                <dropdown-item v-for="item of personalList" :key="item.name" :name="item.name">{{$t(`h.header.${item.name}`)}}</dropdown-item>
            </dropdown-menu>
        </dropdown>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Dropdown, DropdownMenu, DropdownItem } from 'view-design';
import RealtimeTask from './realtime-task.vue';
import LangSelect from '@/components/common/lang-select.vue';
import { signModule } from '@/store/modules/sign';
import { showLanguage } from '@/config/environment';

@Component({
    components: {
        Dropdown,
        DropdownMenu,
        DropdownItem,
        RealtimeTask,
        LangSelect,
    },
})
export default class PersonalAvatar extends Vue {
    showLanguage = showLanguage;

    get personalList() {
        return [{ name: 'personal' }, { name: 'modifyMobile' }, { name: 'modifyPassword' }, { name: 'returnHome' }, { name: 'logout' }];
    }

    /**
     * @description: 下拉选项的点击事件
     * @param {String} name: 点击项 name
     */
    handle(name: string) {
        switch (name) {
            case 'logout':
                this.logouts();
                break;
            case 'personal':
                this.$router.push({ name: 'personal' });
                break;
            case 'modifyMobile':
                this.$router.push({ name: 'modifyMobile' });
                break;
            case 'modifyPassword':
                this.$router.push({ name: 'modifyPassword' });
                break;
            default:
                this.$router.push({ name: 'home' });
                break;
        }
    }
    // 退出登录
    async logouts() {
        const { type } = await signModule.logout();
        if (!type) {
            this.$router.push('/');
        }
    }
}
</script>

<style scoped lang="scss">
    .nav-avatar-wrapper {
        display: flex;
        align-items: center;
        .nav-avatar {
            &-person {
                display: flex;
                align-items: flex-end;
                &-header-person {
                    font-size: 0.24rem;
                    margin: 0 5px;
                    min-width: 24px;
                    color: $--white;
                }
            }
        }
    }
</style>