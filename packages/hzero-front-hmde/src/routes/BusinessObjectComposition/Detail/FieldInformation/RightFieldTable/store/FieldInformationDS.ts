import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'srm-front-boot/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

import {
  // getFieldTree,
  flatTree,
} from '../../utils';

const isTenantRole: boolean = isTenantRoleLevel();

// 拿到孩子们（records）
// const getChildrenArr = (ds, parentRecord, isSelect) => {
//   const childList = ds.filter(
//     (_record) => parentRecord.id && _record.get('parentId') === parentRecord.id
//   );
//   childList.forEach((_record) => {
//     if (_record.get('businessObjectId') && _record.get('parentId')) {
//       handelSelect({ dataSet: ds, record: _record, isSelect });
//     }
//   });
//   return childList;
// };
const getChildrenArr = (ds, parentRecord) => {
  const childList = ds.filter(
    _record =>
      parentRecord.id && _record.get('parentId') === parentRecord.id && !_record.get('relateType')
  );
  return childList;
};

const handelSelect = ({ dataSet, record, isSelect }) => {
  const _record = record.toData();
  // 非主字段可以移动
  const modelCode = _record.parentId;
  const isBusinessObject = _record.businessObjectId;
  if (!modelCode || isBusinessObject) {
    // 父级
    const childrenArr = getChildrenArr(dataSet, _record);
    childrenArr.forEach(item => {
      if (item.selectable) {
        if (isSelect) {
          dataSet.select(item);
        } else {
          dataSet.unSelect(item);
        }
      }
    });
  } else {
    // 子集
    const parentRecord = dataSet.find(item => item.get('id') === _record.parentId);
    if (!isSelect && parentRecord) {
      parentRecord.isSelected = false;
    }
  }
};
const fields = [
  { name: 'id', type: 'string' },
  { name: 'parentId', type: 'string', parentFieldName: 'id' },
  {
    name: 'businessObjectFieldName',
    type: 'string',
    label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
  },
  {
    name: 'displayName',
    type: 'intl',
    label: intl.get('hmde.common.view.message.displayName').d('显示名称'),
  },
  {
    name: 'aliasName',
    type: 'string',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.header.code').d('编码'),
  },
  {
    name: 'componentType',
    type: 'string',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.header.type').d('类型'),
    valueField: 'value',
    textField: 'title',
  },
  {
    name: 'enabledFlag',
    type: 'boolean',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.enableStatus').d('启用状态'),
    defaultValue: false,
  },
  {
    name: 'publishedFlag',
    type: 'boolean',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.publicStatus').d('发布状态'),
    defaultValue: false,
  },
  {
    name: 'operator',
    type: 'string',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.operator').d('操作'),
  },
];
const createFields = [
  { name: 'id', type: 'string' },
  { name: 'parentId', type: 'string', parentFieldName: 'id' },
  {
    name: 'businessObjectAssociateCode',
    type: 'string',
  },
  {
    name: 'businessObjectFieldName',
    type: 'string',
    label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
  },
  {
    name: 'displayName',
    type: 'intl',
    label: intl.get('hmde.common.view.message.displayName').d('显示名称'),
  },
  {
    name: 'businessObjectFieldCode',
    type: 'string',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.header.code').d('编码'),
  },
  {
    name: 'componentType',
    type: 'string',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.header.type').d('类型'),
    valueField: 'value',
    textField: 'title',
  },
  {
    name: 'reverseLinkFlag',
    type: 'boolean',
    label: intl.get('hmde.boComposition.fieldInfo.view.message.header.reverseSwitch').d('反向开关'),
    defaultValue: false,
  },
];

// 业务对象组合 右侧字段详情ds
export const rightFieldInformationDS = businessObjectCombineId =>
  ({
    // primaryKey: 'businessObjectRelationId',
    primaryKey: '_token',
    autoQuery: false,
    parentField: '_parentId_',
    idField: '_id_',
    // childrenField: 'businessObjectRelationFieldList',
    // expandField: 'expand', // 设置expandField后 跟节点会设置expandField的值 所以根节点会变成dirty数据 因此submit({data = []})中data会拿到dirty数据
    paging: false,
    selection: 'multiple',
    // queryFields,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'parentId', type: 'string', parentFieldName: 'id' },
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
      },
      {
        name: 'displayName',
        type: 'intl',
        label: intl.get('hmde.common.view.message.displayName').d('显示名称'),
      },
      {
        name: 'aliasName',
        type: 'string',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.header.code').d('编码'),
      },
      {
        name: 'componentType',
        type: 'string',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.header.type').d('类型'),
        valueField: 'value',
        textField: 'title',
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.enableStatus').d('启用状态'),
        defaultValue: false,
      },
      {
        name: 'publishedFlag',
        type: 'boolean',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.publicStatus').d('发布状态'),
        defaultValue: false,
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.operator').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'nameOrCode',
        type: 'string',
        label: intl
          .get('hmde.boComposition.view.message.header.fieldNameOrCode')
          .d('字段名称/编码'),
        merge: true,
      },
    ],
    transport: {
      read: () => {
        // const businessObjectCombineId = dataSet?.getState('businessObjectCombineId');
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-relations/${businessObjectCombineId}/tree?ignoreRelateFlag=false&includeFieldFlag=true`,
          method: 'get',
          dataKey: null,
          transformResponse: data => {
            if (!data) return null;
            try {
              // return getFieldTree(JSON.parse(data));
              // const originData = JSON.parse(data);
              // getFieldTree(originData);
              // return originData;

              const originData = JSON.parse(data);
              return flatTree(originData);
            } catch (e) {
              return null;
            }
          },
        };
      },
      destroy: ({ data = [] }: { data: any}) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-relation-fields/batch`,
        method: 'delete',
        data: data.filter(item => !item.businessObjectId),
      }),
      submit: ({ data = [] }: { data: any }) => {
        const businessObjectRelationList = data.filter(item => item.relateType) || [];
        const businessObjectRelationFieldList = data.filter(item => !item.relateType) || [];
        const map = {
          // 批量更新的关系列表
          businessObjectRelationList,
          // 批量更新的字段列表
          businessObjectRelationFieldList,
        };
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-relation-fields/batch`,
          method: 'put',
          // data: data.filter((item) => !item.businessObjectId),
          data: map,
        };
      },
    },
    events: {
      select: param => handelSelect({ ...param, isSelect: true }),
      unSelect: param => handelSelect({ ...param, isSelect: false }),
      load: ({ dataSet }) => {
        dataSet.forEach(i => {
          // refrencedFlag 为true标识字段有被引用，被引用过则不能删除
          // 当前租户角色 平台字段不能选中删除
          if (i?.get('refrencedFlag') || (isTenantRole && !i?.get('tenantId'))) {
            // eslint-disable-next-line no-param-reassign
            i.selectable = false;
          }
        });
      },
    },
  } as any);
// 业务对象组合 查询字段信息弹窗ds
export const createFieldInformationDS = () =>
  ({
    primaryKey: 'id',
    autoQuery: false,
    parentField: 'parentId',
    idField: 'id',
    expandField: 'expand',
    paging: false,
    fields: createFields,
    events: {
      // batchSelect: (props) => handleSelectAll(props, true),
      // batchUnSelect: (props) => handleSelectAll(props, false),
      select: param => handelSelect({ ...param, isSelect: true }),
      unSelect: param => handelSelect({ ...param, isSelect: false }),
    },
  } as DataSetProps);

// 业务对象组合 查询字段信息弹窗搜索ds
export const searchDS = () =>
  ({
    autoCreate: true,
    fields: [
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.header.code').d('编码'),
      },
      {
        name: 'componentType',
        type: 'string',
        label: intl.get('hmde.boComposition.fieldInfo.view.message.header.type').d('类型'),
        valueField: 'value',
        textField: 'title',
      },
    ],
  } as DataSetProps);

// 业务对象组合 查询字段信息弹窗搜索ds
export const rightSearchDS = () =>
  ({
    autoCreate: true,
    fields: [
      {
        name: 'nameOrCode',
        type: 'string',
        label: intl
          .get('hmde.boComposition.view.message.header.fieldNameOrCode')
          .d('字段名称/编码'),
      },
    ],
  } as DataSetProps);
