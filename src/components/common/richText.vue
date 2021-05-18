<style lang="scss" scoped>
// 富文本
.editor_containers {
  height: 409px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex: auto;
  display: flex;
  flex-flow: column;
  // 控制按钮
  .editor_control {
    flex: none;
    flex-flow: row wrap;
  }
  // 内容区
  .editor_content {
    height: 100%;
    font-size: 14px;
    border-top: 1px solid #ccc;
    flex: auto;
    overflow: auto;
  }
}
</style>

<style lang="scss">
// 设置控制栏的层级
.editor_containers {
  .editor_control > .w-e-toolbar {
    background: none;
    .w-e-menu {
      z-index: auto !important;
      & > .w-e-droplist {
        z-index: 2;
      }
    }
  }
  .editor_content {
    .w-e-text-container {
      background: none;
    }
  }
}
</style>

<template>
  <div class="editor_containers">
    <div class="editor_control" ref="editControl"><!-- 控制栏 --></div>
    <div class="editor_content" ref="editor"><!-- 内容区 --></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Wangeditor from "wangeditor";
import { uploadFile } from "@/config/api";

const previewReg = /(<img[^>]*(?!preview))([^>])/g;

/**
 * 冒泡上去的方法
 * $emit('on-ready', param1) 富文本挂载后返出去的函数
 * @param {Object} param1: 富文本对象
 */
export default {
  name: "my-rich-text",
  props: {
    /**
     * 初始对富文本填充的值
     */
    initValue: String
  },
  data() {
    return {
      instance: ""
    };
  },
  computed: mapState({ imgpre: state => state.user.imgpre }),
  methods: {
    /**
     * 获取富文本内部的值
     * @param {String} type: 获取值的类型, 默认取 html
     * @param {Boolean} isFormat: 是否格式化 -> json 字符串
     * @return {Array|String}
     */
    getValues(type = "html", isFormat = false) {
      return isFormat
        ? JSON.stringify(this.instance.txt[type]())
        : this.instance.txt[type]();
    },
    /**
     * 富文本内部上传图片
     * @param {Array} files: 文件列表
     * @param {Function} insertImg: 上传成功后插入图片至富文本内部的函数
     */
    async richTextUpload(files, insertImg) {
      if (!files.length) return console.log("图片列表无值: ", files);
      const { imgpre, disposeText } = this;
      const keys = await Promise.all(files.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        uploadFile(formData);
      }));
      keys.some(key => key && insertImg(imgpre + key));
      disposeText();
    },
    /**
     * @description: 对粘贴的文本进行处理
     * @param {String} text: 文本
     */
    pasteTextHandle(text) {
      const { addPreview } = this;
      const newText = addPreview(text);
      if (newText !== text) {
        this.$nextTick(this.$previewRefresh);
      }
      return newText;
    },
    /**
     * @description: 为图片增加预览事件
     */
    disposeText() {
      const { instance, addPreview } = this;
      const text = instance.txt.html();
      const newText = addPreview(text);
      if (newText !== text) {
        instance.txt.html(newText);
        this.$nextTick(this.$previewRefresh);
      }
    },
    /**
     * @description: 对提供的字符串进行检索, 为图片增加 preview 属性
     * @param {String} text: 待检索的字符串
     */
    addPreview(text) {
      return text.replace(previewReg, `$1$2 preview="rich-text-img"`);
    }
  },
  mounted() {
    const { richTextUpload, initValue, pasteTextHandle } = this;
    const editor = (this.instance = new Wangeditor(
      this.$refs.editControl,
      this.$refs.editor
    ));
    console.log(editor);
    editor.config.uploadImgServer = "/upload"; // 上传图片到服务器
    editor.config.customUploadImg = richTextUpload;
    // 设置内容区域的层级
    editor.config.zIndex = 1;
    // 对粘贴的内容进行处理
    editor.config.pasteTextHandle = pasteTextHandle;
    // 隐藏“网络图片”tab
    editor.create();
    initValue && editor.txt.html(initValue);
    this.$emit("on-ready", editor);
  }
};
</script>
