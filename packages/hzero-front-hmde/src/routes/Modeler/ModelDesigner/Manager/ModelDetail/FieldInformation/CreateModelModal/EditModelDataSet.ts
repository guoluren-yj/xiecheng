/**
 * 新建逻辑模型总体DS
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isTenantRoleLevel } from 'utils/utils';

export default function (
  id,
  dataModelFieldDataSet,
  baseTableFieldDataSet,
  resourceUponRoleHierarchy
) {
  const params =
    resourceUponRoleHierarchy === 'tenant' ? 'resourceLevel=ORGANIZATION' : 'resourceLevel=SITE';
  return {
    autoQuery: true,
    paging: false,
    fields: [
      {
        name: 'dataSourceType',
        type: 'string',
        label: '数据来源类型',
        // defaultValue: '数据表',
        // readOnly: true,
        required: true,
      },
      {
        name: 'refTable',
        type: 'object',
        label: '引用表',
        lovCode: isTenantRoleLevel() ? 'HMDE.REF_TABLE' : 'HMDE.REF_TABLE.SITE',
        required: true,
        ignore: 'always',
      },
      {
        name: 'refTableName',
        type: 'string',
        label: '引用表',
        required: true,
        bind: 'refTable.name',
      },
      {
        name: 'type',
        type: 'string',
        label: '模型分类',
        required: true,
      },
      {
        name: 'code',
        type: 'string',
        label: '模型编码',
        required: true,
      },
      {
        name: 'name',
        type: 'string',
        label: '逻辑模型名称',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: '逻辑模型描述',
        maxLength: 200,
      },
      {
        name: 'extendsParentName',
        type: 'string',
        label: '继承自模型',
      },
    ],
    transport: {
      read: () => {
        if (!id) return false;
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/logic-models/${id}${isTenantRoleLevel() ? '' : `?${params}`}`,
          method: 'get',
        };
      },
      submit: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/model-fields/${id}/batch-update/with-inheritance-info`,
          method: 'post',
          data: !isTenantRoleLevel()
            ? {
                // 平台级，租户级传递的数据是不一样的
                modelFields: constructPayloadData(dataModelFieldDataSet.toJSONData()),
                subCanAddFlagList: baseTableFieldDataSet
                  ?.toJSONData()
                  .filter((record) => record._status === 'update'),
              }
            : {
                modelFields: constructPayloadData(dataModelFieldDataSet.toJSONData()),
              },
        };
      },
    },
  } as DataSetProps;
}

function constructPayloadData(dataModelFieldData: any[]) {
  return dataModelFieldData.map((item) => {
    return {
      ...item,
      refTableId: item.metaTableId,
      metaTableId: undefined,
      // physicalFieldCode: item.code,
      // code: undefined,
      physicalFieldDecimalDigits: item.decimalDigits,
      decimalDigits: undefined,
      physicalFieldJdbcType: item.jdbcType,
      jdbcType: undefined,
    };
  });
}
