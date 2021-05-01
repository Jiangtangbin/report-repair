import { Message } from 'view-design';
import Clipboard from 'clipboard';

export interface IMessage {
    success: string;
    error: string;
}

function clipboardSuccess(content: string) {
    Message.success({ content, duration: 1.5 });
}
function clipboardError(content: string) {
    Message.error({ content });
}

/**
 * @description: 复制文本
 * @param {String} text: 需复制的字符串
 * @param {Event} event: 事件
 * @param {Object} param2: 复制成功 | 失败时的提示
 */
export default function handleClipboard(text: string, event: Event, { success, error }: IMessage = { success: '复制成功', error: '复制失败' }) {
    // const clipboard = new Clipboard(event.currentTarget, {
    const clipboard = new Clipboard((event.currentTarget as Element), {
        text: () => text,
    });
    clipboard.on('success', () => {
        clipboardSuccess(success);
        clipboard.off('error');
        clipboard.off('success');
        clipboard.destroy();
    });
    clipboard.on('error', () => {
        clipboardError(error);
        clipboard.off('error');
        clipboard.off('success');
        clipboard.destroy();
    });
    clipboard.onClick(event);
}