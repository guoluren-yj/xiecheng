/**
 * 模型关系表格页的DS （展示模型关系信息和删除单行）
 *
 */
import { HZERO_HMDE } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { lowcodeOrganizationURL } from '@/utils/common';
import { omit } from 'lodash';

export default function (id, code) {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'description',
        type: 'string',
        label: '关系描述',
      },
      {
        name: 'code',
        type: 'string',
        label: '代码',
      },
      { name: 'name', type: 'string', label: '关系名称', required: true },
      {
        name: 'relationModel',
        type: 'object',
        label: '关联模型',
        lovCode: 'HMDE.LOGIC_MODEL.ID',
        ignore: 'always',
      },
      { name: 'relationLogicModelName', type: 'string', label: '关联模型' }, // 返回的关联逻辑模型名称
      {
        name: 'relationLogicModelCode',
        type: 'string',
        bind: 'relationModel.code',
        defaultValue: '5086582817ba41fda4cd6dac7decdaba',
      }, // LOV关联模型的code (先写死)
      { name: 'relationType', type: 'string', label: '关系类型' },
      { name: 'mainModel', type: 'string', label: '主模型' },
      { name: 'mainFieldName', type: 'string', label: '主字段显示名称' },
      { name: 'relationFieldName', type: 'string', label: '关联字段显示名称' },
      { name: 'id', type: 'string' },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-relations/${id}/page`,
        method: 'get',
      },
      destroy: (args) => {
        // 删除单行
        const { data, dataSet } = args;
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/model-relations/${id}/${data[0].id}`,
          method: 'delete',
          data: {
            ...data[0],
            masterLogicModelCode: code,
            tenantId: dataSet.getState('selectedTenantId')
              ? dataSet.getState('selectedTenantId')
              : getCurrentOrganizationId(),
          },
        };
      },
      update: ({ data, dataSet }) => {
        const newDate = data[0];
        const masterLogicModelCode = dataSet.getQueryParameter('masterLogicModelCode');
        const masterLogicModelName = dataSet.getQueryParameter('masterLogicModelName');
        const relationFields = []; // 这个字段不允许更新，不允许传给后端
        return {
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-relations/${id}/${
            newDate.id
          }`,
          method: 'put',
          data: omit(
            {
              ...data[0],
              tenantId: '0',
              masterLogicModelCode,
              masterLogicModelName,
              relationFields,
            },
            ['__id', '_status']
          ),
        };
      },
    },
  };
}
