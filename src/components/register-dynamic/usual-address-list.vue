<template>
    <my-modal
        v-model="value"
        :title="$t('h.modal.titles.usualAddress')"
        footer-hide
        width="780px"
    >
        <loading :loading="loading" type="B" />
        <scroll
            @pullingUp="queryParams.pageNum += 1;"
            :data="list.list"
            :pullUpTxt="pullUpTxt"
            :complete="list.page.pageNum >= list.page.countPage"
            :pullUpLoad="true"
            class="popup-scroller"
            preventDefault
        >
            <ul class="usual-address">
                <li v-if="!list.list.length">{{$t('h.common.noData')}}</li>
                <li v-for="(item, i) of list.list" :key="item.id" class="usual-address-item">
                    <template v-if="item.editing">
                        <i-input v-model="item.nameBack" class="usual-address-item-input" :placeholder="$t('h.other.customName')" />
                        <p class="usual-address-item-control">
                            <svg-icon @click="handle('editOk', item, i)" class="usual-address-item-control-icon c-p" icon-class="check" />
                            <svg-icon @click="handle('editCancel', item, i)" class="usual-address-item-control-icon c-p" icon-class="close" />
                        </p>
                    </template>
                    <template v-else>
                        <p @click="dblClick(item)" class="c-p">{{item.name}}-{{item.address}}</p>
                        <p class="usual-address-item-control">
                            <tooltip :content="$t('h.tableButton.edit')"><svg-icon @click="handle('edit', item, i)" class="usual-address-item-control-icon" icon-class="edit" /></tooltip>
                            <Poptip @on-ok="handle('delete', item, i)" :title="$t('h.tableButton.confirmDelete')" confirm><svg-icon class="usual-address-item-control-icon" icon-class="trash" /></Poptip>
                        </p>
                    </template>
                </li>
            </ul>
        </scroll>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Watch, Component } from 'vue-property-decorator';
import { Input as IInput, Tooltip, Poptip } from 'view-design';
import { BasePopup } from '@/base-class/dynamic-create';
import { getUsualAddressList as getList, delUsualAddress as del, setUsualAddressInfo as set } from '@/config/api';

@Component({
    name: 'UsualAddressListHandle',
    components: {
        IInput,
        Tooltip,
        Poptip,
    },
})
export default class UsualAddressListHandle extends BasePopup {
    @Prop({ type: Object, default: () => ({}) })
    fromQuery!: Dictionary<any>;

    loading = false;
    list: API.Response['UsualAddressList'] = { list: [], page: { pageNum: 1, pageSize: 40, count: 1, countPage: 1 }}
    queryParams: Dictionary<any> = { pageNum: 1, pageSize: 40 };

    // 获取请求参数
    get getResponseParams() {
        const { fromQuery, queryParams } = this;
        return { ...fromQuery, ...queryParams };
    }
    // 上拉加载提示
    get pullUpTxt(): string {
        const { list: { page: { pageNum, countPage }}} = this;
        return pageNum >= countPage
            ? this.$t('h.other.noMoreData') as string
            : this.$t('h.other.loading') as string;
    }

    @Watch('getResponseParams', { immediate: true })
    async refresh() {
        const { getResponseParams, list } = this;
        this.loading = true;
        const { type, data } = await getList(getResponseParams);
        if (!type) {
            data.list.every(v => !!Object.assign(v, { editing: false, nameBack: v.name }));
            data.list.length && list.list.push(...data.list);
            list.page = data.page;
        }
        this.loading = false;
    }

    // 列表点击事件
    async handle(name: string, data: ResponseMap.UsualAddressList, index: number) {
        switch (name) {
            case 'edit':
                // 编辑
                data.editing = true;
                data.nameBack = data.name;
                break;
            case 'editCancel':
                // 取消编辑
                data.editing = false;
                data.nameBack = data.name;
                break;
            case 'editOk': {
                // 确认编辑
                const params = {
                    type: 2,
                    id: data.id,
                    name: data.name,
                    address: data.address,
                    zoom: data.zoom,
                    lng: data.lng,
                    lat: data.lat,
                };
                const { type } = await set(params);
                if (!type) {
                    data.editing = false;
                    data.name = data.nameBack as string;
                }
                break;
            }
            case 'delete': {
                const { list: { list }, queryParams } = this;
                // 删除
                const { type } = await del(data.id);
                if (!type) {
                    if (list.length > 1) {
                        !isNaN(index) && list.splice(index, 1);
                    } else {
                        list.splice(index);
                        queryParams.pageNum !== 1 ? this.refresh() : (queryParams.pageNum = 1);
                    }
                }
                break;
            }
            default:
                break;
        }
    }
    // 列表双击事件
    dblClick(data: ResponseMap.UsualAddressList) {
        if (!data.editing) {
            this.$emit('success', data);
            this.hide();
        }
    }
}
</script>

<style scoped lang="scss">
    $padding: 10px;

    .usual-address {
        &-item {
            padding-bottom: $padding;
            display: flex;
            align-items: center;
            &-control {
                margin-left: 10px;
                display: flex;
                &-icon {
                    margin-right: 4px;
                }
            }
            &-input {
                width: initial;
            }
        }
    }
</style>