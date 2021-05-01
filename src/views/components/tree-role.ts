import { Button as IButton } from 'view-design';
import { carryChained, recursion } from '@/utils/index';
import { i18n } from '@/locale/index';

// 角色树形菜单
export function menu(h: CreateElement, { data }: any, originData: Record<any, any>[]) {
    return [
        // 展示标签
        h(
            'div',
            {
                class: ['role-tree-wrapper'],
            },
            [
                // title
                h(
                    'p',
                    {
                        class: ['role-tree-desc'],
                    },
                    [
                        // 存在图标的情况
                        data.icon && h('svg-icon', {
                            attrs: {
                                'icon-class': data.icon,
                            },
                            class: 'role-tree-desc-icon',
                        }),
                        // 提示的文字
                        h('span', data.title),
                        data.children && data.children.length && !data.disabled
                            ? h(
                                IButton,
                                {
                                    on: {
                                        click() {
                                            data.checked = true;
                                            originData && carryChained(originData, { id: data.id }, (v: any) => {
                                                v.checked = true;
                                            });
                                            // 全选子级
                                            recursion(data.children, v => {
                                                v.checked = true;
                                            });
                                        },
                                    },
                                    attrs: { type: 'text' },
                                },
                                i18n.t('h.tableButton.selectAllChildren') as string
                            )
                            : undefined,
                    ]
                ),
            ]
        ),
        // 占位标签, 使无子元素的节点在同一行
        data.children && data.children.length && h('p', { class: { 'roles-tree-place': !data.children.some((item: any) => item.ismenu) }}),
    ];
}