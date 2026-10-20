import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import { SRM_SWBH } from '../../../components/utils/config';

import { getFieldTree } from '../FieldInformation/utils';

const fields = () => {
  return [
    { name: 'id', type: 'string' },
    { name: 'parentId', type: 'string', parentFieldName: 'id' },
    {
      name: 'businessObjectFieldName',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.fieldName').d('字段名称'),
    },
    {
      name: 'displayName',
      type: 'intl',
      label: intl.get('swbh.roManagement.view.message.header.displayName').d('显示名称'),
    },
    {
      name: 'aliasName',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.code').d('编码'),
    },
    {
      name: 'componentType',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.type').d('类型'),
      valueField: 'value',
      textField: 'title',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('swbh.roManagement.view.message.header.enableStatus').d('启用状态'),
      defaultValue: false,
    },
    {
      name: 'publishedFlag',
      type: 'boolean',
      label: intl.get('swbh.roManagement.view.message.header.publicStatus').d('发布状态'),
      defaultValue: false,
    },
    {
      name: 'operator',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.operator').d('操作'),
    },
  ];
};
const organizationId = getCurrentOrganizationId();
// 单据对象详情 右侧字段详情ds
export const rightFieldInformationDS = () => ({
  // primaryKey: 'businessObjectRelationId',
  primaryKey: '_token',
  autoQuery: false,
  // parentField: 'parentId',
  // idField: 'id',
  childrenField: 'businessObjectRelationFieldList',
  // expandField: 'expand', // 设置expandField后 跟节点会设置expandField的值 所以根节点会变成dirty数据 因此submit({data = []})中data会拿到dirty数据
  paging: false,
  selection: 'multiple',
  // queryFields,
  fields: fields(),
  transport: {
    read: () => {
      const url = isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-definitions/relations-tree?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-definitions/relations-tree`;
      return {
        url,
        method: 'get',
        dataKey: null,
        transformResponse: (data) => {
          if (!data) return null;
          try {
            const originData = JSON.parse(data);
            getFieldTree(originData);

            return originData;
          } catch (e) {
            return null;
          }
        },
      };
    },
  },
  // events: {
  //   select: (param) => handelSelect({ ...param, isSelect: true }),
  //   unSelect: (param) => handelSelect({ ...param, isSelect: false }),
  //   load: ({ dataSet }) => {
  //     dataSet.forEach((i) => {
  //       // refrencedFlag 为true标识字段有被引用，被引用过则不能删除
  //       // 当前租户角色 平台字段不能选中删除
  //       if (i?.get('refrencedFlag') || (isTenantRole && !i?.get('tenantId'))) {
  //         // eslint-disable-next-line no-param-reassign
  //         i.selectable = false;
  //       }
  //     });
  //   },
  // },
});

// 业务对象组合 查询字段信息弹窗搜索ds
export const searchDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'businessObjectFieldName',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.fieldName').d('字段名称'),
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
      label: intl.get('swbh.roManagement.fieldInfo.view.message.header.code').d('编码'),
    },
    {
      name: 'componentType',
      type: 'string',
      label: intl.get('swbh.roManagement.fieldInfo.view.message.header.type').d('类型'),
      valueField: 'value',
      textField: 'title',
    },
  ],
});

// 业务对象组合 查询字段信息弹窗搜索ds
export const rightSearchDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'nameOrCode',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.fieldNameOrCode').d('字段名称/编码'),
    },
  ],
});
