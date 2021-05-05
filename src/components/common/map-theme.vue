<template>
    <i-select v-on="$listeners" :value="value" class="map-theme" placeholder="请选择地图主题">
        <i-option
            v-for="item of datum" :key="item.value"
            :value="item.value"
            :title="item.desc"
        >{{ $te(item.title) ? $t(item.title) : item.title }}</i-option>
    </i-select>
</template>

<script lang="ts">
import Vue from 'vue';
import { Select as ISelect, Option as IOption } from 'view-design';

const theme = [
    {
        value: 'normal',
        title: 'h.map.defaultMap',
        desc: '百度地图官网采用的地图样式。',
    },
    {
        value: 'midnight',
        title: 'h.map.midnightBlueMap',
        desc: '地图背景呈深蓝色，水系为黑色，整体呈暗色风格。',
    },
    {
        value: 'light',
        title: 'h.map.freshBlueMap',
        desc: '地图背景及道路均呈蓝色，给人以清新的感觉。',
    },
    {
        value: 'googlelite',
        title: 'h.map.streamliningMap',
        desc: '地图用色与google类似，不过过滤了一部分地图元素。',
    },
    {
        value: 'bluish',
        title: 'h.map.freshBlueGreenMap',
        desc: '地图背景以蓝色为主色调，水系为白色，清新典雅。',
    },
    {
        value: 'pink',
        title: 'h.map.romanticPinkMap',
        desc: '地图为粉色、道路灰色，整体颜色柔和。',
    },
    {
        value: 'grayscale',
        title: 'h.map.highEndAsh',
        desc: '地图整体成灰白色，使用该类地图便于突出其上叠加的个人信息。',
    },
    {
        value: 'dark',
        title: 'h.map.nightMap',
        desc: '地图背景及道路均呈黑灰色，给人以寂静的感觉。',
    },
    {
        value: 'hardedge',
        title: 'h.map.strongBoundaryMap',
        desc: '地图整体成白色，使用强烈的黑色边框,给人以强烈的轮廓感。',
    },
    {
        value: 'grassgreen',
        title: 'h.map.naturalGreenMap',
        desc: '陆地呈草绿色，海洋呈蓝色，道路为白色，整幅地图自然气息十足。',
    },
    {
        value: 'redalert',
        title: 'h.map.redAlertMap',
        desc: '地图呈大红色，红色警戒,给人高度惊醒的感觉。',
    },
    {
        value: 'darkgreen',
        title: 'h.map.youthGreenMap',
        desc: '地图背景为绿色、水系为黑色，标注为白色，地图用色浓重，时尚大气。',
    },
];

export default Vue.extend({
    components: {
        ISelect,
        IOption,
    },
    props: {
        value: String,
        datum: { type: Array, default: () => theme },
    },
});

</script>

<style lang="scss" scoped>
</style>
