import { isNil } from 'lodash';

import intl from 'utils/intl';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const tenantId = getCurrentOrganizationId();

const baseInfoDS = () => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'templateCode',
      label: intl.get(`${commonPrompt}.templateCode`).d('模版编码'),
      maxLength: 50,
      required: true,
      validator: (value) => {
        if (value) {
          const reg = /^[a-zA-Z][0-9a-zA-Z_]*$/;
          if (!reg.test(value)) {
            return intl
              .get(`${commonPrompt}.attributeCodeVaildator`)
              .d('请输入字母开头，字母/数字/下划线组合的维度编码。');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      dynamicProps: {
        disabled: ({ record }) =>
          !(!record.get('templateId') || record.get('templateId') === 'new'),
      },
    },
    {
      name: 'templateName',
      required: true,
      maxLength: 200,
      type: 'intl',
      label: intl.get(`${commonPrompt}.templateName`).d('模版名称'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'HPFM.ENABLED_FLAG',
      required: true,
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      format: getDateTimeFormat(),
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      type: 'dateTime',
    },
    {
      name: 'lastUpdatedByName',
      disabled: true,
      label: intl.get(`${commonPrompt}.lastUpdatedName`).d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      disabled: true,
      format: getDateTimeFormat(),
      label: intl.get(`${commonPrompt}.updateDate`).d('更新时间'),
      type: 'dateTime',
    },
  ],
});

const templateLineDS = ({ templateId, filterValueIds, selection = 'multiple' }) => ({
  autoQuery: false,
  autoLocateFirst: true,
  cacheSelection: true,
  cacheModified: true,
  selection,
  dataToJSON: 'all',
  primaryKey: 'propertyId',
  pageSize: 20,
  fields: [
    {
      name: 'attributeCode',
      type: 'object',
      lovCode: 'SMDM.CATEGORY_ATTRIBUTE',
      required: true,
      textField: 'attributeCode',
      label: intl.get(`${commonPrompt}.attributeCode`).d('属性编码'),
      transformResponse(value, data) {
        if (value) {
          return {
            attributeCode: value,
            attributeId: data.attributeId,
            attributeName: data.attributeName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value?.attributeCode,
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId,
            templateId: templateId === 'new' ? undefined : templateId,
            filterValueIds,
          };
        },
        disabled: ({ record }) =>
          !(!record.get('templateId') || record.get('templateId') === 'new'),
      },
    },
    {
      name: 'attributeName',
      type: 'string',
      bind: 'attributeCode.attributeName',
      disabled: true,
      label: intl.get(`${commonPrompt}.attributeName`).d('属性名称'),
    },
    {
      name: 'attributeId',
      bind: 'attributeCode.attributeId',
    },
    {
      name: 'maintenanceMethod',
      type: 'string',
      required: true,
      lookupCode: 'SMDM.CATEGORY_ATTRIBUTE_MM',
      label: intl.get(`${commonPrompt}.maintenanceMethod`).d('维护方式'),
    },
    {
      name: 'requiredFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
      required: true,
      label: intl.get(`${commonPrompt}.requiredFlag`).d('是否必填'),
    },
    {
      name: 'customizeFlag',
      type: 'sring',
      lookupCode: 'SMDM.CATEGORY_ATTR_CUSTOM_FLAG',
      defaultValue: '1',
      required: true,
      label: intl.get(`${commonPrompt}.customizeFlag`).d('值集类属性是否允许自定义属性值'),
      dynamicProps: {
        disabled: ({ record }) => !['RADIO', 'MULTIPLE'].includes(record.get('maintenanceMethod')),
      },
    },
    {
      name: 'scale',
      type: 'number',
      label: intl.get(`${commonPrompt}.digitsNoPrecision`).d('位数（精度）'),
      precision: 0,
      min: 0,
      dynamicProps: {
        disabled: ({ record }) => !['INTEGER', 'FLOAT'].includes(record.get('maintenanceMethod')),
      },
    },
    {
      name: 'sort',
      type: 'number',
      label: intl.get(`${commonPrompt}.sort`).d('排序'),
      precision: 0,
      min: 0,
      defaultValue: 0,
      transformRequest: (value) => (isNil(value) ? 0 : value), // 功能设计前端始终赋值，不为空
    },
    {
      name: 'operate',
      type: 'string',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'maintenanceMethod') {
        if (!['RADIO', 'MULTIPLE'].includes(value)) {
          record.set({
            customizeFlag: '0',
          });
        }
        if (!['INTEGER', 'FLOAT'].includes(value)) record.set({ scale: null });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/category-attr-template-property?templateId=${templateId}`,
        method: 'GET',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/category-attr-template-property?templateId=${templateId}`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const attributeValueLineDS = ({ params }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  cacheSelection: true,
  cacheModified: true,
  primaryKey: 'valueId',
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/category-attr-template-property/value-assign`,
        method: 'GET',
        data: { ...data, ...params },
      };
    },
  },
  fields: [
    {
      name: 'valueName',
      type: 'string',
      label: intl.get(`${commonPrompt}.valueName`).d('属性值名称'),
    },
    {
      name: 'valueCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.valueCode`).d('属性值编码'),
    },
  ],
  queryFields: [
    {
      name: 'valueName',
      type: 'string',
      label: intl.get(`${commonPrompt}.valueName`).d('属性值名称'),
    },
  ],
  record: {
    // dynamicProps: {
    //   selectable: (record) => Number(record.get('enabledFlag')) === 1,
    // },
  },
});

export { templateLineDS, attributeValueLineDS, baseInfoDS };
