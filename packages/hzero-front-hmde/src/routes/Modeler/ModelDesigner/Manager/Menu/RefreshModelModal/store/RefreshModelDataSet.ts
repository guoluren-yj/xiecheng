/**
 * 新建逻辑模型总体DS
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

export default function (data, selection = '') {
  return {
    data,
    selection,
    paging: false,
    fields: [
      {
        name: 'existFlag',
        label: '是否存在',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'tableDataType',
        type: 'string',
        label: '物理模型表',
      },
      {
        name: 'modelDataType',
        type: 'string',
        label: '模型',
      },
      {
        name: 'tableRequiredFlag',
        type: 'number',
        label: '物理模型表',
      },
      {
        name: 'modelRequiredFlag',
        type: 'number',
        label: '模型',
      },
      {
        name: 'tableDataSize',
        type: 'string',
        label: '物理模型表',
      },
      {
        name: 'modelDataSize',
        type: 'string',
        label: '模型',
      },
      {
        name: 'tableDescription',
        type: 'string',
        label: '物理模型表',
      },
      {
        name: 'modelDescription',
        type: 'string',
        label: '模型',
      },
      {
        name: 'tableDefaultValue',
        type: 'string',
        label: '物理模型表',
      },
      {
        name: 'modelDefaultValue',
        type: 'string',
        label: '模型',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: '字段显示名称',
      },
    ],
  } as DataSetProps;
}
