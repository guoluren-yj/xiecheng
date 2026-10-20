/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

export default () =>
  ({
    autoQuery: false,
    pageSize: 10,
    primaryKey: 'name',
    selection: 'multiple',
    paging: false, // 不分页
    // 事件集
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
      load: ({ dataSet }) => {
        dataSet.forEach((ele) => {
          if (ele.get('primaryFlag')) {
            // eslint-disable-next-line no-param-reassign
            ele.selectable = false;
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
        validator: (value, _, record: any) => {
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          // 校验方法
          if (!patternA.test(value) || value.toString().length > 30) {
            return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
          }
          const arr = record.dataSet
            .toData()
            .filter((i) => i.indexName.toLowerCase() === record.get('indexName').toLowerCase());
          if (arr.length > 1) {
            return '索引名称重复';
          }
          return true;
        },
      },
      { name: 'columnNameList', type: 'string', label: '索引字段', required: true },
      { name: 'indexType', type: 'string', label: '索引类型', required: true },
    ],
  } as DataSetProps);
