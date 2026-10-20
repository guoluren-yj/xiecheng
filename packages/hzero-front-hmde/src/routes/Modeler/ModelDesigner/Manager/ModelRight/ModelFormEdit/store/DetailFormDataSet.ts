/**
 * 模型详情页上方 模型详情信息
 */
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default (modelRadio): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  paging: false,
  selection: false,
  dataKey: undefined,
  fields: [
    {
      name: 'dataSourceType',
      type: 'string' as FieldType,
      label: '数据来源类型',
      required: true,
    },
    {
      name: 'refServiceCode',
      type: 'string' as FieldType,
      label: '服务名',
      required: true,
    },
    {
      name: 'refSchemaName',
      type: 'string' as FieldType,
      label: '数据库名',
      dynamicProps: {
        required: () => {
          if (modelRadio !== 'apiTable') {
            return true;
          }
          return false;
        },
      },
    },
    {
      name: 'refTableName',
      type: 'string' as FieldType,
      label: '引用表名',
      dynamicProps: {
        required: () => {
          if (modelRadio !== 'apiTable') {
            return true;
          }
          return false;
        },
      },
    },
    {
      // 扩展表名
      name: 'redundantTableName',
      type: 'string' as FieldType,
      label: '扩展表名',
      required: false,
    },
    {
      name: 'name',
      type: 'string' as FieldType,
      label: '逻辑模型名称',
      required: true,
      validator: async (value) => {
        // 校验方法
        if (value) {
          if (value.toString().length > 120) {
            return '逻辑模型名称长度应<=120。';
          }
        }
      },
    },
    { name: 'description', type: 'string' as FieldType, label: '逻辑模型描述', maxLength: 200 },
    { name: 'type', type: 'string' as FieldType },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { id } = dataSet?.current?.get('param')
        ? dataSet.current.get('param')
        : { id: undefined };
      if (!id) return {};
      return {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/logic-models/${id}`,
        method: 'get',
        transformResponse: (response) => {
          const _data = JSON.parse(response);
          return {
            ..._data,
            // refSchemaName: _data.refDataSourceType
            //   ? `${_data.refSchemaName} (${_data.refDataSourceType})`
            //   : _data.refSchemaName,
          };
        },
      };
    },
    submit: ({ dataSet, data }) => {
      const { id } = dataSet?.current?.get('param');
      if (!id) return {};
      return {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/logic-models/${id}`,
        method: 'put',
        data: {
          ...data[0],
        },
      };
    },
  },
});
