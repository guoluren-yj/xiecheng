/**
 * 模型详情页上方 模型详情信息
 */
// import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

// const organizationId = 0;
export default () => {
  return {
    // autoCreate: true,
    // pageSize: 10,
    primaryKey: 'serviceCode',
    selection: false,
    paging: false, // 不分页
    autoLocateFirst: false,
    autoLocateAfterCreate: false,
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
        label: '表名',
        type: 'string',
      },
      {
        name: 'modelName',
        label: '逻辑模型名称',
        type: 'string',
        required: true,
      },
      {
        name: 'modelCode',
        label: '逻辑模型编码',
        type: 'string',
        required: true,
      },
      {
        name: 'modelDescription',
        label: '逻辑模型描述',
        type: 'string',
      },
    ],
  } as DataSetProps;
};
