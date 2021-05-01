<template>
    <my-modal
        v-model="value"
        :title="title"
        :draggable="draggable"
        theme="draggable"
        width="780px"
        footer-hide
    >
        <i-form @submit.native.prevent :model="formInline" :rules="rules" class="form" ref="form">
            <form-item prop="url" :label="i18n.label.url">
                <div class="col">
                    <i-input v-model="formInline.url" :placeholder="i18n.placeholder.url" #prepend>
                        <i-select v-model="formInline.method" class="response-method">
                            <i-option v-for="item of dicts.method" :key="item.value" :value="item.value">{{item.title}}</i-option>
                        </i-select>
                    </i-input>
                    <my-button @click="ok" class="k-w">{{$t('h.common.send')}}</my-button>
                </div>
            </form-item>
            <h3>Request</h3>
            <tabs>
                <template #extra>
                    <loading v-if="loading" :loading="loading" type="A" position="relative" />
                    <span v-else>{{response.status}} {{response.statusText}}</span>
                </template>
                <tab-pane label="Body">
                    <form-item :label-width="1">
                        <i-input v-model="formInline.params" :rows="5" :autosize="textareaOption" :placeholder="`key1: value1\nkey2: value2`" type="textarea" />
                    </form-item>
                </tab-pane>
                <tab-pane label="Headers">
                    <form-item :label-width="1">
                        <i-input v-model="formInline.headers" :rows="5" :autosize="textareaOption" :placeholder="`User-Agent: Mozilla/5.0\nCookie: key=value;`" type="textarea" />
                    </form-item>
                </tab-pane>
                <tab-pane :label="i18n.label.axiosParams">
                    <form-item :label-width="1">
                        <i-input v-model="formInline.options" :rows="5" :autosize="textareaOption" :placeholder="`key1: value1\nkey2: value2`" type="textarea" />
                    </form-item>
                </tab-pane>
            </tabs>
            <h3>Response</h3>
            <tabs>
                <template #extra>
                    <loading v-if="loading" :loading="loading" type="A" position="relative" />
                    <span v-else>{{response.status}} {{response.statusText}}</span>
                </template>
                <tab-pane label="Body">
                    <span v-show="response.body" @click="copyHandle('body', $event)" class="response-copy c-p">{{copyText}}</span>
                    <pre class="response-text">{{response.body}}</pre>
                </tab-pane>
                <tab-pane label="Headers">
                    <span v-show="response.headers" @click="copyHandle('headers', $event)" class="response-copy c-p">{{copyText}}</span>
                    <pre class="response-text response-text-headers">{{response.headers}}</pre>
                </tab-pane>
            </tabs>
        </i-form>
    </my-modal>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import { Form as IForm, FormItem, Input as IInput, Select as ISelect, Option as IOption, Tabs, TabPane } from 'view-design';
import { BasePopup } from '@/base-class/dynamic-create';
import axios from '@/axios/index';
import copyFunc from '@/utils/clipboard';

type ParamOption = Dictionary<any>;

const methods = {
    GET: 'params',
    POST: 'data',
    DELETE: 'data',
    PUT: 'data',
    PATCH: 'data',
};

@Component({
    name: 'RequestHandle',
    components: {
        IForm,
        FormItem,
        IInput,
        ISelect,
        IOption,
        Tabs,
        TabPane,
    },
})
export default class RequestHandle extends BasePopup {
    @Prop(Boolean)
    draggable?: boolean;
    @Prop(String)
    url!: string;
    @Prop(Object)
    params?: ParamOption;
    @Prop(Object)
    headers?: ParamOption;
    // 传递给 axios 的参数
    @Prop(Object)
    options?: ParamOption;

    loading = false;
    textareaOption = { minRows: 5 };
    formInline = {
        url: '',
        method: 'GET',
        params: '',
        headers: '',
        options: '',
    };
    dicts = {
        method: [
            { title: 'GET', value: 'GET' },
            { title: 'POST', value: 'POST' },
            { title: 'DELETE', value: 'DELETE' },
            { title: 'PUT', value: 'PUT' },
            { title: 'PATCH', value: 'PATCH' },
        ],
    };
    response = {
        status: 200,
        statusText: 'OK',
        headers: '',
        body: '' as any,
    };

    get i18n() {
        const label = {
            url: `${this.$t('h.other.requestAddress')}: `,
            axiosParams: this.$t('h.other.axiosParams'),
        };
        const placeholder = {
            url: this.$i18n.t('h.placeholder.pleaseEnter', { msg: label.url }),
        };

        return { label, placeholder };
    }
    get rules() {
        const { placeholder } = this.i18n;
        return {
            url: { required: true, message: placeholder.url },
            // required: { required: true, message: '该字段为必填字段' },
        };
    }
    get copyText() {
        return this.$t('h.common.copy');
    }

    // 打开弹窗前执行的函数
    prefixFunc() {
        const { formInline, url, params, headers, options } = this;

        formInline.url = url && url[0] !== '/' ? `/${url}` : url;
        formInline.params = params ? this.encodeParams(params) : '';
        formInline.headers = headers ? this.encodeParams(headers) : '';
        formInline.options = options ? this.encodeParams(options) : '';
    }
    /**
     * @description: 对提供的对象进行编码(转换成字符串)
     * @param {Object} data: 待编码的数据
     */
    encodeParams(data: ParamOption): string {
        return Object.entries(data).reduce((prev, [k, v]) => {
            return prev + `${k}: ${v === '-' ? '' : v}\n`;
        }, '');
    }
    /**
     * @description: 对提供的对象进行解码(转换成对象)
     * @param {Object} data: 待解码的数据
     */
    decodeParams(data: string): ParamOption {
        const result: Dictionary<any> = {};
        data.split(/\n+/).every(v => {
            if (v) {
                const [k, val] = v.split(/^(?:(\w+(?:\[.+\])*))\:\s*/).filter(Boolean);
                if (k && val !== undefined) {
                    try {
                        /* eslint-disable no-eval */
                        result[k] = eval(val);
                        /* eslint-enable no-eval */
                    } catch (error) {
                        result[k] = val;
                    }
                }
            }
            return true;
        });
        return result;
    }
    /**
     * @description: 复制响应值
     * @param {String} type: 复制的类型
     * @param {Event} ev
     */
    copyHandle(type: 'body' | 'headers', ev: Event) {
        const { response } = this;
        const val = type === 'body' ? response.body : response.headers;
        copyFunc(typeof val === 'object' ? JSON.stringify(val, null, '    ') : val, ev);
    }
    async ok() {
        const { formInline: { params, headers, method, options, url }, response } = this;
        const paramKey = methods[method as 'GET'] || 'params';
        const parameter = {
            [paramKey]: this.decodeParams(params),
            headers: this.decodeParams(headers),
            ...this.decodeParams(options),
        };
        this.loading = true;

        const data = await axios(url, parameter, true);
        Object.assign(response, {
            status: data.status,
            statusText: data.statusText,
            headers: data.headers ? this.encodeParams(data.headers) : '',
            body: data.data || '',
        });

        this.loading = false;
    }
}

</script>

<style scoped lang="scss">
    @import '~@/views/styles/popup.scss';

    @include utils-pierce(ivu-tabs-tabpane) {
        position: relative;
    }

    .response-method {
        width: 70px;
    }
    .response-copy {
        color: #4d4d4d;
        background-color: $--white;
        padding: 2px 8px;
        margin: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05);
        position: absolute;
        top: 0; right: 0;
    }
    .response-text {
        &-headers {
            color: #CB244E;
            line-height: 22px;
        }
        max-height: 400px; min-height: 100px;
        overflow: auto;
        color: #080;
        padding: 9px 14px;
        margin-top: 0;
        background-color: #f7f7f9;
        border: 1px solid #e1e1e8;
        border-radius: 0 0 4px 4px;
        word-wrap: break-word;
        word-break: break-all;
    }
</style>