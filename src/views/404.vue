<template>
    <div class="unfound-wrapper">
        <div class="unfound-main">
            <img src="@/assets/images/404/uh-oh.png" class="unfound-main-img" alt="uh_oh" />
            <img src="@/assets/images/404/illus.png" class="unfound-main-img" alt="illus" />
            <p class="unfound-main-hint t-a">{{$t('h.tips.pageNoExist')}}</p>
            <p class="unfound-main-action-box">
                <span @click.prevent="goHome" class="unfound-main-action-item c-p">{{$t('h.header.returnHome')}}</span>
                <span @click.prevent="goBack" class="unfound-main-action-item c-p">{{$t('h.header.returnParent')}}</span>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator';

export default class Unfound extends Vue {
    // 跳转到首页
    goHome() {
        this.$router.push('/home');
    }
    // 返回上一页
    goBack() {
        this.$router.back();
    }
};
</script>

<style scoped lang="scss">
    $text_color: black;

    @mixin pseudo ($place) {
        content: '';
        width: 100%; height: 10px;
        border: {
            #{$place}: 1px solid #E6EBED;
        }
        display: block;
    }

    .unfound-wrapper {
        height: 100%;
        padding: 50px 0;
        background: #F1F5F7;
        display: flex;
        justify-content: center;
        .unfound-main {
            color: $text_color;
            width: 190px;
            display: flex;
            flex-flow: column nowrap;
            align-content: center;
            &-img {
                width: inherit;
                margin: 30px 0;
                user-select: none;
            }
            &-hint {
                &::before {
                    @include pseudo('top');
                }
                &::after {
                    @include pseudo('bottom');
                }
            }
            &-action-box {
                margin-top: 20px;
                display: flex;
                justify-content: space-between;
                &-item {
                    transform: color .2s;
                    &:hover {
                        color: #2d8cf0;
                    }
                }
            }
        }
    }
</style>