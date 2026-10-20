/*
 * @filename:
 * @Date: 2020-04-26 10:17:01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (tableId) =>
  ({
    primaryKey: 'id',
    autoQuery: false,
    selection: false,
    paging: false,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/${tableId}/columns`,
        method: 'get',
        dataKey: null,
        // transformResponse: data => {
        //   const originData = JSON.parse(data);
        //   // const sortedData = sortBy(originData, [
        //   //   o => o.name,
        //   // ]);
        //   return sortedData;
        // },
      },
      // update: ({ data: [data] }) => {
      update: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/table-columns/reverse/batch-update`,
        method: 'put',
        data,
      }),
    },
    fields: [
      { name: 'name', type: 'string', label: '字段名称', required: true },
      { name: 'type', type: 'string', label: '数据类型', required: true },
      { name: 'description', type: 'string', label: '字段说明' },
      { name: 'dataSize', type: 'number', label: '最大长度' },
      { name: 'decimalDigits', type: 'number', label: '小数位数' },
      { name: 'defaultValue', type: 'string', label: '默认值' },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: '是否必输',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'primaryFlag',
        type: 'boolean',
        label: '主键',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
  } as DataSetProps);
