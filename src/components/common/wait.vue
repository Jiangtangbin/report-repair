<template>
    <div class="wait">
        <div class="wait_1"></div>
        <div class="wait_2"></div>
        <div class="wait_3"></div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'Wait',
})
export default class Wait extends Vue {

}
</script>

<style scoped lang="scss">
    .wait > div {
        width: 8px; height: 8px;
        border-radius: 100%;
        display:inline-block;
        background-color: #2d8cf0;
        -webkit-animation: wait 1.4s infinite ease-in-out;
        animation: wait 1.4s infinite ease-in-out;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
    }
    .wait .wait_1 {
        -webkit-animation-delay: -0.30s;
        animation-delay: -0.30s;
    }
    .wait .wait_2 {
        -webkit-animation-delay: -0.15s;
        animation-delay: -0.15s;
    }
    @-webkit-keyframes wait {
        0%, 80%, 100% {-webkit-transform: scale(0.0) }
        40% { -webkit-transform: scale(1.0) }
    }
    @keyframes wait {
        0%, 80%, 100% {-webkit-transform: scale(0.0) }
        40% { -webkit-transform: scale(1.0) }
    }
</style>