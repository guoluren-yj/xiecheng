/*
 * 索引列表信息
 * @Date: 2020-03-17 18:01:22
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (tableId, tableName, tableType) =>
  ({
    primaryKey: 'id',
    autoQuery: false,
    paging: false,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/${tableId}/indexes`,
        method: 'get',
        dataKey: null,
        transformResponse: (data) => {
          if (!data) return null;
          try {
            const originData = JSON.parse(data);
            const item = originData.find(
              (record) =>
                record.indexName &&
                record.indexName.toLowerCase() === `${tableName.toLowerCase()}_u1`
            );
            if (item && tableType === 'REDUNDANT') {
              Object.assign(item, { disabled: true });
            }
            return originData;
          } catch (e) {
            return null;
          }
        },
      },
      create: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/table-indexes/positive/batch-update`,
        method: 'post',
        data: data.map((item) => ({ ...item, metaTableId: tableId })),
      }),
      destroy: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/table-indexes/positive/batch-delete`,
        method: 'delete',
        data,
      }),
      update: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/table-indexes/positive/batch-update`,
        method: 'post',
        data,
      }),
    },
    // 事件集
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((ele) => {
          if (
            (ele.get('primaryFlag') ||
              (ele.get('indexName') &&
                ele.get('indexName').toLowerCase() === `${tableName.toLowerCase()}_u1`)) &&
            tableType === 'REDUNDANT'
          ) {
            Object.assign(ele, { selectable: false });
          }
        });
      },
    },
    // 表头属性设置
    fields: [
      // 索引表头
      {
        name: 'indexName',
        type: 'string',
        label: '索引名称',
        required: true,
        maxLength: 30,
        validator: (value, _, record: Record) => {
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          let valueArr: Record[] = [];
          if (!patternA.test(value) || value.toString().length > 30) {
            return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
          }
          if (record.dataSet) {
            valueArr = record.dataSet.filter(
              (ele) =>
                ele.get('indexName') && ele.get('indexName').toLowerCase() === value.toLowerCase()
            );
          }
          return valueArr.length === 1 ? true : '索引名称不能重复!';
        },
      },
      { name: 'columnNameList', type: 'string', label: '索引字段', required: true },
      { name: 'indexType', type: 'string', label: '索引类型', required: true },
    ],
  } as DataSetProps);
