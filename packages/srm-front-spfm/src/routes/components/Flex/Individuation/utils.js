/**
 * utils 个性化
 * @date: 2019-4-25
 * @version: 0.0.1
 * @author: lijun <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hands
 */
import { isEmpty, isString, find, isArray, groupBy, isNumber } from 'lodash';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const levelCodeMap = {
  T: 'tenant',
  R: 'role',
  U: 'user',
};

export const organizationId = getCurrentOrganizationId();

export function stringToJSON(str) {
  return !isEmpty(str) && isString(str) ? JSON.parse(str) : undefined;
}

export function getFormItemsSchema() {
  return [
    {
      key: 'ant-input',
      displayName: 'Input',
      propsKeys: ['size', 'typeCase', 'dbc2sbc', 'trim', 'trimAll', 'disabled'],
      type: 'antComponents',
    },
    {
      key: 'ant-select',
      displayName: 'Select',
      propsKeys: ['size', 'disabled'],
      type: 'antComponents',
    },
    {
      key: 'ant-input-number',
      displayName: 'InputNumber',
      propsKeys: ['size', 'allowThousandth', 'max', 'min', 'precision', 'disabled'],
      type: 'antComponents',
    },
    {
      key: 'Switch',
      displayName: 'Switch',
      propsKeys: ['size', 'disabled'],
      type: 'antComponents',
    },
    {
      key: 'Lov',
      displayName: 'Lov',
      propsKeys: ['disabled'],
      type: 'customizedComponents',
    },
    {
      key: 'TLEditor',
      displayName: 'TLEditor',
      propsKeys: ['disabled'],
      type: 'customizedComponents',
    },
    {
      key: 'HzeroSwitch',
      displayName: 'HzeroSwitch',
      propsKeys: ['disabled', 'size'],
      type: 'customizedComponents',
    },
  ];
}

export function isFormInputsComponent(type = {}) {
  const formItemsSchema = getFormItemsSchema();
  const schemaItem = find(
    formItemsSchema,
    o =>
      o.key === (type.defaultProps || {}).prefixCls ||
      o.key === type.name ||
      o.key === type.displayName
  );
  return schemaItem
    ? {
        key: (type.defaultProps || {}).prefixCls || type.name || type.displayName,
        propsKeys: schemaItem.propsKeys,
        fieldType: schemaItem.displayName,
      }
    : false;
}

export function getFormItemNode(node = {}, index) {
  const formItemNode = {};
  const colProps = node.props || {};
  if (colProps.children && !isArray(colProps.children)) {
    const formItemProps = colProps.children.props || {};
    if (formItemProps.children && !isArray(formItemProps.children)) {
      const schema = isFormInputsComponent((formItemProps.children || {}).type || {});
      if (schema) {
        formItemNode.node = node;
        formItemNode.index = index;
        formItemNode.schema = schema;
        formItemNode.fieldName = (formItemProps.children.props || {})['data-__field'].name;
      }
    }
  }
  return formItemNode;
}
/**
 * 个性化明细列表
 * @async
 * @function queryIndividuationFormDetails
 * @param {object} 个性化明细列表 - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryIndividuationFormDetails(code) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-form/${code}`);
}

/**
 * 个性化明细列表
 * @async
 * @function queryIndividuationFormDetails
 * @param {object} 个性化明细列表 - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryIndividuationFormDetailsByScope(scope, code) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-form/${scope}/${code}`);
}

/**
 * 创建个性化明细
 * @async
 * @function saveIndividuationFormDetails
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function saveIndividuationFormDetails(code, scope, data = {}) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-form/${scope}/${code}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 获取动态表格数据
 * @returns {Array}
 */
export async function getUiTables() {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table`, {
    method: 'GET',
  });
}

/**
 * 获取动态表格数据
 * @returns {Array}
 */
export async function getUiTablesByScope(scope) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table/${levelCodeMap[scope]}`, {
    method: 'GET',
  });
}

/**
 * 获取动态表格数据
 * @returns {Array}
 */
export async function getUiTablesBaseConfigByScope(scope) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table/${scope}`, {
    method: 'GET',
  });
}

/**
 * 获取当前表格UI配置
 * @param {number} tableConfId 表格配置id
 */
export async function getCurrentTableConfig(tableConfId) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table/${tableConfId}`, {
    method: 'GET',
  });
}

/**
 * 保存UI表格配置
 * @param {Object} data 表格UI配置信息
 */
export async function saveCurrentTableConfig(data, scope) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table/${levelCodeMap[scope]}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 保存UI表格配置
 * @param {Object} data 表格UI配置信息
 */
export async function saveUiTableConfig(data, scope) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table/${scope}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 删除UI表格配置
 */
export async function deleteTableConfig(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-table`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 对象property属性定义方法
 * @function defineProperty
 * @param {!object} obj - 目标对象
 * @param {!string} property - 对象属性名称
 * @param {any} value - 属性值
 * @returns
 */
export function defineProperty(obj, property, value) {
  Object.defineProperty(obj, property, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export function getFormItemsLayout(formComponentObject, flatIndividualizedFormConfig = {}) {
  const formItemsLayoutArr = [];
  const getFormItemNodeAll = (item = {}, index) => {
    const formItemNode = getFormItemNode(item || {}, index);
    if (!isEmpty(formItemNode)) {
      formItemsLayoutArr.push(formItemNode);
    } else {
      recurveFormObject((item.props || {}).children, item);
    }
  };

  function recurveFormObject(collection = [], parentItem) {
    if (isArray(collection)) {
      collection.forEach((n, i) => {
        getFormItemNodeAll(n, i, parentItem);
      });
    }
  }
  recurveFormObject((formComponentObject.props || {}).children);
  const formItemsLayoutGroup = groupBy(formItemsLayoutArr, 'index');
  let formItemsLayout = [];
  Object.keys(formItemsLayoutGroup).forEach(n => {
    formItemsLayout = formItemsLayout.concat(
      formItemsLayoutGroup[n].map((m, i) => {
        const { fieldProps = {} } = flatIndividualizedFormConfig[m.fieldName] || {};
        const { row, col } = fieldProps;
        return { ...m, row: isNumber(row) ? row : i, col: isNumber(col) ? col : m.index };
      })
    );
  });
  const cols = Object.keys(formItemsLayoutGroup || {}) || [];
  const withElementCountRows = (cols.map(o => formItemsLayoutGroup[o].length) || []).sort();
  const maxCol = Number(cols[cols.length - 1] || 0) + 1;
  const maxRow = Number(withElementCountRows[withElementCountRows.length - 1] || 0);
  return { layout: formItemsLayout, maxRow, maxCol };
}

export function getFormConfigWithLayout(
  formComponentObject = {},
  flatIndividualizedFormConfig = {}
) {
  const formConfig = flatIndividualizedFormConfig;
  const formItemsLayoutArr = [];
  const getFormItemNodeAll = (item = {}, index) => {
    const formItemNode = getFormItemNode(item || {}, index);
    if (!isEmpty(formItemNode)) {
      formItemsLayoutArr.push(formItemNode);
    } else {
      recurveFormObject((item.props || {}).children, item);
    }
  };

  function recurveFormObject(collection = [], parentItem) {
    if (isArray(collection)) {
      collection.forEach((n, i) => {
        getFormItemNodeAll(n, i, parentItem);
      });
    }
  }
  recurveFormObject((formComponentObject.props || {}).children);
  const formItemsLayoutGroup = groupBy(formItemsLayoutArr, 'index');
  Object.keys(formItemsLayoutGroup).forEach(n => {
    formItemsLayoutGroup[n].forEach((m, i) => {
      const item = formConfig[m.fieldName] || {
        fieldName: m.fieldName,
        fieldType: (m.schema || {}).fieldType,
        fieldEnabledFlag: 1,
      };
      if (!item.fieldProps) {
        item.fieldProps = {};
      }
      const { row, col } = item.fieldProps || {};
      item.fieldProps.row = isNumber(row) ? row : i;
      item.fieldProps.col = isNumber(col) ? col : m.index;
      if (!formConfig[m.fieldName]) {
        formConfig[m.fieldName] = item;
      }
    });
  });
  const cols = Object.keys(formItemsLayoutGroup || {}) || [];
  const withElementCountRows = (cols.map(o => formItemsLayoutGroup[o].length) || []).sort();
  const maxCol = Number(cols[cols.length - 1] || 0) + 1;
  const maxRow = Number(withElementCountRows[withElementCountRows.length - 1] || 0);

  return { formConfig, maxCol, maxRow };
}

export const LOCAL_TABLE_CONFIG_KEY = 'hzeroLastModifiedIndiTableConf';

export const UI_TABLE_BASE_CONFIG = 'UI_TABLE_BASE_CONFIG';
