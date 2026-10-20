/**
 * @author WY <yang.wang06@hand-china.com>
 * @creationDate 2020/2/20
 * @copyright HAND ® 2020
 */

import models from '@/assets/menuicons/models@3x.png';
import modelsSelected from '@/assets/menuicons/models-selected@3x.png';

/**
 * @TODO: 暂时只支持两级菜单;
 * @TODO: page 菜单是特殊菜单, 或者 界面设计&已发布界面
 * @TODO: name 必输且不能相同
 * FIXME: 菜单需要再讨论如何做, 现在还有一个特殊的菜单name 'page'
 */
export default [
  {
    code: 'APP_MODELER',
    name: '应用模型',
    icon: models,
    iconSelected: modelsSelected,
    children: [
      {
        code: 'BASE_TABLE',
        name: '基础表管理',
        url: '/pub/hmde/base-table',
      },
      {
        code: 'MODELER_MANAGER',
        name: '逻辑模型设计器',
        url: '/pub/hmde/model-manager',
      },
    ],
  },
];
