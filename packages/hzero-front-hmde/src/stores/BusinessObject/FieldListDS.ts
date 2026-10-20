import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

enum FieldType {
  STANDARD = 'STANDARD', // 标准
  EXTEND = 'EXTEND', // 扩展
}

const tableDs = (type) => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  pageSize: 20,
  queryFields: [
    // {
    //   name: 'businessObjectFieldName',
    //   type: 'string',
    //   label: intl.get('hiam.tenants.model.title.mainTable').d('显示名称'),
    // },
    type !== FieldType.EXTEND && {
      name: 'nameOrCode',
      type: 'string',
      label: intl.get('hmde.bo.field.nameOrCode').d('名称/编码'),
      merge: true,
    },
    type === FieldType.EXTEND && {
      name: 'extendFieldCode',
      type: 'string',
      label: intl.get('hmde.bo.field.code').d('字段编码'),
      display: true,
    },
    {
      name: 'componentType',
      type: 'string',
      label: intl.get('hmde.bo.field.componentType').d('字段类型'),
      lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD_TYPE',
      display: true,
    },
    type !== FieldType.EXTEND && {
      name: 'requiredFlag',
      type: 'boolean',
      label: intl.get('hzero.common.title.individuation.required').d('是否必输'),
      display: true,
      optionsData: [
        {
          value: true,
          meaning: intl.get('hzero.common.status.yes').d('是'),
        },
        {
          value: false,
          meaning: intl.get('hzero.common.status.no').d('否'),
        },
      ],
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hmde.common.label.remark').d('描述'),
      display: true,
    },
    !type && {
      name: 'inheritSourceType',
      type: 'string',
      label: intl.get('hmde.bo.field.sourceType').d('来源类型'),
      display: true,
      optionsData: [
        {
          value: FieldType.STANDARD,
          meaning: intl.get('hmde.bo.field.view.message.tab.standardField').d('标准字段'),
        },
        {
          value: FieldType.EXTEND,
          meaning: intl.get('hmde.bo.field.view.message.tab.extendField').d('扩展字段'),
        },
      ],
    },
  ].filter(Boolean),
  fields: [
    {
      name: 'businessObjectFieldName',
      type: 'string',
      label: intl.get('hmde.common.view.message.displayName').d('显示名称'),
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
      label: intl.get('hmde.bo.field.code').d('字段编码'),
    },
    // 扩展字段的字段编码
    {
      name: 'extendFieldCode',
      type: 'string',
      label: intl.get('hmde.bo.field.code').d('字段编码'),
    },
    {
      name: 'componentType',
      type: 'string',
      label: intl.get('hmde.bo.field.componentType').d('字段类型'),
      lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD_TYPE',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('hmde.bo.field.enableStatus').d('启用状态'),
      defaultValue: false,
    },
    {
      name: 'publishedFlag',
      type: 'boolean',
      label: intl.get('hmde.bo.field.publicStatus').d('发布状态'),
      defaultValue: false,
    },
    {
      name: 'requiredFlag',
      type: 'number',
      label: intl.get('hzero.common.title.individuation.required').d('是否必输'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hmde.common.label.remark').d('描述'),
    },
    {
      // 增加字段来源类型 扩展字段
      // name: 'extendCategory',
      name: 'inheritSourceType',
      type: 'string',
      label: intl.get('hmde.bo.field.sourceType').d('来源类型'),
    },
  ],
  transport: {
    read: () => {
      const platformPath =
        type === FieldType.EXTEND ? 'business-object-extend-field' : 'business-object-fields';
      const prefixUrl = !type ? 'business-object-inherit-field' : platformPath;
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/${prefixUrl}/page`,
        method: 'GET',
      };
    },
    destroy: ({ dataSet, data }) => {
      const {
        queryParameter: { businessObjectFieldId, businessObjectId },
      } = dataSet;
      const { extendFieldId, inheritFieldId } = data[0] || {};
      if (type && type === FieldType.EXTEND) {
        // 平台层扩展字段
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-extend-field`,
          method: 'DELETE',
          data: data[0],
          params: { extendFieldId },
        };
      }
      if (type && type === FieldType.STANDARD) {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-fields/${businessObjectFieldId}?businessObjectId=${businessObjectId}`,
          method: 'DELETE',
        };
      }
      // 租户层配置
      return {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-inherit-field/${inheritFieldId}?businessObjectId=${businessObjectId}`,
        method: 'DELETE',
      };
    },
  },
});

export { tableDs };
