/**
 * 模型详情页上方 模型详情信息
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

// const organizationId = 0;
export default () => {
  return {
    // autoCreate: true,
    // pageSize: 10,
    primaryKey: 'serviceCode',
    selection: false,
    paging: false, // 不分页
    fields: [
      {
        name: 'serviceCode',
        label: '服务名',
        type: 'string',
      },
      {
        name: 'schemaName',
        label: '数据库名',
        type: 'string',
      },
      {
        name: 'tableName',
        label: '基础表名',
        type: 'string',
      },
      {
        name: 'modelName',
        label: '逻辑模型名称',
        type: 'string',
        required: true,
      },
      {
        name: 'modelDescription',
        label: '逻辑模型描述',
        type: 'string',
      },
      {
        name: 'cause',
        label: '失败原因',
        type: 'string',
      },
    ],
  } as DataSetProps;
};
