/*
 * 更新表描述
 * @Date: 2020-04-24 10:17:12
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
/**
 * 逻辑模型详情页上方 模型详情信息
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (tableId) =>
  ({
    primaryKey: 'id',
    autoCreate: true,
    paging: false,
    parentField: 'secParentCode',
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/${tableId}`,
        method: 'get',
      },
      update: ({ data: [data] }) => {
        const poUrl = `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/tables/positive/update-table`; // 正向表url
        const reUrl = `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/${tableId}`; // 反向表url
        const url = data.type === 'REVERSE' ? reUrl : poUrl;
        return {
          url,
          method: 'put',
          data,
        };
      },
    },
    fields: [
      {
        required: true,
        name: 'name',
        label: '基础表名',
        type: 'string',
      },
      {
        name: 'description',
        type: 'string',
        label: '请输入表描述',
        validator: (value) => {
          if (value.length > 255) {
            return '最大长度不能超过255';
          }
        },
      },
    ],
  } as DataSetProps);
