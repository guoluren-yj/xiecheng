/*
 * @filename:
 * @Date: 2020-09-16 11:28:52
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default (logicModelId): DataSetProps => ({
  autoQuery: false,
  selection: false,
  primaryKey: 'mappingFieldCode',
  paging: false,
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/model-api-binds/${logicModelId}/parameter/list`,
      method: 'get',
    }),
  },
  fields: [
    {
      name: 'mappingFieldName',
      type: 'string' as FieldType,
      label: '参数名',
    },
    {
      name: 'modelField',
      type: 'object' as FieldType,
      label: '模型字段名',
      textField: 'modelFieldName',
      valueField: 'modelFieldCode',
      // ignore: 'always',
      required: true,
    },
    {
      name: 'modelFieldName',
      type: 'string' as FieldType,
      bind: 'modelField.modelFieldName',
    },
    {
      name: 'modelFieldCode',
      type: 'string' as FieldType,
      bind: 'modelField.modelFieldCode',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.records.forEach((record) => {
        record.set('status', 'update');
      });
    },
  },
});
