/*
 * 正向建表第三步表配置信息
 * @Date: 2020-03-18 12:40:36
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (tableId, redundantTableName, tableType, lovInfo, baseData, thirdCreated) => ({
  autoQuery: false,
  paging: false,
  primaryKey: 'name',
  selection: 'multiple',
  transport: {
    read: {
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/tables/${tableId}/indexes`,
      method: 'get',
      dataKey: null,
      transformResponse: (data) => {
        if (!data) return null;
        try {
          const originData = JSON.parse(data).map((item) => {
            // 默认带出的表名_u1关键字不可编辑
            if (
              (tableType === 'OWNER' &&
                item.indexName.toLowerCase() === `${redundantTableName.toLowerCase()}_u1`) ||
              (tableType === 'REFERENCE' &&
                item.indexName.toLowerCase() === `${lovInfo.name.toLowerCase()}_u1`)
            ) {
              Object.assign(item, { keyword: true });
            }
            return item;
          });
          return originData;
        } catch (e) {
          return null;
        }
      },
    },
    destroy: ({ data = [] }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/table-indexes/positive/batch-delete`,
      method: 'delete',
      data,
    }),
  },
  // 事件集
  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
    load: ({ dataSet }) => {
      thirdCreated.forEach((item) => {
        // 添加上缓存数据
        dataSet.create(item, 0);
      });
      dataSet.forEach((ele) => {
        if (
          (tableType === 'OWNER' &&
            ele.get('indexName').toLowerCase() === `${redundantTableName.toLowerCase()}_u1`) ||
          (tableType === 'REFERENCE' &&
            ele.get('indexName').toLowerCase() === `${lovInfo.name.toLowerCase()}_u1`)
        ) {
          Object.assign(ele, { keyword: true });
          Object.assign(ele, { selectable: true });
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
      // required: true,
      maxLength: 30,
      dynamicProps: {
        required: ({ record }) => {
          if (!record.get('indexName')) {
            return true;
          }
          if (baseData && baseData[0]) {
            return record.get('indexName') !== `${baseData[0].name}_u1`;
          }
          return true;
        },
      },
      validator: (value, _, record) => {
        let valueArr = [];
        const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
        if (!patternA.test(value) || value.toString().length > 30) {
          return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
        }
        if (record.dataSet) {
          valueArr = record.dataSet.filter(
            (ele) =>
              value &&
              ele.get('indexName') &&
              ele.get('indexName').toLowerCase() === value.toLowerCase()
          );
        }
        return valueArr.length === 1 ? true : '索引名称不能重复!';
      },
    },
    {
      name: 'columnNameList',
      type: 'string',
      label: '索引字段',
      dynamicProps: {
        required: ({ record }) => {
          if (!record.get('indexName')) {
            return true;
          }
          if (baseData && baseData[0]) {
            return record.get('indexName') !== `${baseData[0].name}_u1`;
          }
          return true;
        },
      },
    },
    {
      name: 'indexType',
      type: 'string',
      label: '索引类型',
      dynamicProps: {
        required: ({ record }) => {
          if (!record.get('indexName')) {
            return true;
          }
          if (baseData && baseData[0]) {
            return record.get('indexName') !== `${baseData[0].name}_u1`;
          }
          return true;
        },
      },
    },
  ],
});
