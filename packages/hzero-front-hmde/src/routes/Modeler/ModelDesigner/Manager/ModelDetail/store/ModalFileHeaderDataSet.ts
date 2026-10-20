/**
 * ModalFileHeaderDataSet
 * @date: 2021-08-19
 * @author: zhongji.huang <zhongji.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { lowcodeOrganizationURL } from '@/utils/common';
import { HZERO_HMDE } from '@/utils/config';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default function ModalFileHeaderDataSet(tableId) {
  return {
    paging: false,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'dataSourceType',
        type: FieldType.string,
        label: '数据来源类型',
        required: true,
      },
      {
        name: 'refServiceCode',
        type: FieldType.string,
        label: '服务名',
        required: true,
      },
      {
        name: 'refSchemaName',
        type: FieldType.string,
        label: '数据库名',
        dynamicProps: true,
        required: true,
      },
      {
        name: 'refTableName',
        type: FieldType.string,
        label: '引用表名',
        dynamicProps: true,
        required: true,
      },
      {
        // 扩展表名
        name: 'redundantTableName',
        type: FieldType.string,
        label: '扩展表名',
        required: false,
      },
      {
        name: 'redundantMode',
        type: FieldType.string,
        label: '扩展模式',
        lookupCode: 'HMDE.REDUNDANT_MODE',
      },
      {
        name: 'name',
        type: FieldType.string,
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
      { name: 'code', type: FieldType.string, label: '模型编码', maxLength: 200 },
      { name: 'description', type: FieldType.string, label: '描述', maxLength: 200 },
    ],
    transport: {
      read: () => {
        return {
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/logic-models/${tableId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/logic-models/${tableId}`,
          method: 'put',
          data: {
            ...data[0],
          },
        };
      },
    },
  };
}
