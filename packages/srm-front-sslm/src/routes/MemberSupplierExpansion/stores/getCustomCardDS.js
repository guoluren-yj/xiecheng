/*
 * @Date: 2024-08-02 10:26:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import uuid from 'uuid/v4';

export const customCardDS = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'memberCustomizeId', // 主键
      defaultValue: uuid(),
    },
    {
      name: 'customizeTitle',
      required: true,
      label: intl.get('sslm.common.view.field.cardName').d('卡片名称'),
    },
    {
      name: 'customizeContent',
    },
  ],
});
