/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:17:02
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-08-28 09:35:33
 */
import intl from 'utils/intl';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const tenantId = getCurrentOrganizationId();

const treeSelectCategory = (record) => {
  const { selectable, isSelected } = record;
  if (selectable) {
    record.set('selectedFlag', 1);
    if (!isSelected) record.isSelected = true;
  }
  const { children } = record;
  if (children) {
    children.forEach((child) => treeSelectCategory(child));
  }
};

const treeUnSelectCategory = (record) => {
  const { isSelected } = record;
  record.set('selectedFlag', 0);
  if (isSelected) record.isSelected = false;
  const { children } = record;
  if (children) {
    children.forEach((child) => treeUnSelectCategory(child));
  }
};

const attributeListDS = ({ autoQuery = false }) => {
  return {
    autoQuery,
    autoCreate: false,
    dataToJSON: 'all',
    selection: false,
    pageSize: 20,
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/category-attribute`,
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'attributeCode',
        type: 'string',
        required: true,
        maxLength: 50,
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
          disabled: ({ record }) => !!record.get('attributeId'),
        },
        label: intl.get(`${commonPrompt}.attributeCode`).d('属性编码'),
      },
      {
        name: 'attributeName',
        type: 'intl',
        required: true,
        maxLength: 200,
        label: intl.get(`${commonPrompt}.attributeName`).d('属性名称'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        required: true,
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'operate',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'attributeName',
        type: 'string',
        label: intl.get(`${commonPrompt}.attributeName`).d('属性名称'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.status').d('状态'),
      },
    ],
  };
};

const attributeValueListDS = ({ autoQuery = false }) => {
  return {
    autoQuery,
    autoCreate: false,
    dataToJSON: 'all',
    selection: false,
    pageSize: 20,
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/category-attribute-value`,
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'valueCode',
        type: 'string',
        required: true,
        maxLength: 50,
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
          disabled: ({ record }) => !!record.get('valueId'),
        },
        label: intl.get(`${commonPrompt}.valueCode`).d('属性值编码'),
      },
      {
        name: 'valueName',
        type: 'intl',
        required: true,
        maxLength: 200,
        label: intl.get(`${commonPrompt}.valueName`).d('属性值名称'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        required: true,
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'operate',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'valueName',
        type: 'string',
        label: intl.get(`${commonPrompt}.valueName`).d('属性值名称'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.status').d('状态'),
      },
    ],
  };
};

const attributeTemplateListDS = ({ autoQuery = false }) => {
  return {
    autoQuery,
    autoCreate: false,
    dataToJSON: 'all',
    selection: false,
    pageSize: 20,
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/category-attr-templates`,
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'templateCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.templateCode`).d('模版编码'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get(`${commonPrompt}.templateName`).d('模版名称'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'operate',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'templateName',
        type: 'string',
        label: intl.get(`${commonPrompt}.templateName`).d('模版名称'),
      },
      {
        name: 'enabledFlag',
        type: 'string',
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.status').d('状态'),
      },
    ],
  };
};

const categoryAssignListDS = ({ templateId, treeSelectFlag }) => {
  return {
    autoQuery: true,
    autoCreate: false,
    dataToJSON: 'all',
    cacheSelection: true,
    cacheModified: true,
    paging: 'server',
    idField: 'categoryId',
    parentField: 'parentCategoryId',
    primaryKey: 'categoryId',
    pageSize: 20,
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/category-attr-templates/assign-tree?templateId=${templateId}`,
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'categoryCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.categoryCode`).d('品类编码'),
      },
      {
        name: 'categoryName',
        type: 'string',
        label: intl.get(`${commonPrompt}.categoryName`).d('品类名称'),
      },
      {
        name: 'selectedFlag',
        type: 'number',
      },
    ],
    queryFields: [
      {
        name: 'categoryName',
        type: 'string',
        label: intl.get(`${commonPrompt}.categoryName`).d('品类名称'),
      },
    ],
    record: {
      dynamicProps: {
        selectable: (record) => record.get('allowSelectFlag') !== 0,
        defaultSelected: (record) => record.get('selectedFlag') !== 0,
      },
    },
    events: {
      batchSelect: ({ records }) => {
        records.forEach((record) => {
          if (treeSelectFlag) treeSelectCategory(record);
          else if (record.selectable) record.set('selectedFlag', 1);
        });
      },
      batchUnSelect: ({ records }) => {
        records.forEach((record) => {
          if (treeSelectFlag) treeUnSelectCategory(record);
          else record.set('selectedFlag', 0);
        });
      },
    },
  };
};

export { attributeListDS, attributeValueListDS, attributeTemplateListDS, categoryAssignListDS };
