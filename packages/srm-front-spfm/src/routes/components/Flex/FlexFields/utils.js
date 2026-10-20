/**
 * service 弹性域组件utils工具包
 * @date: 2019-4-25
 * @version: 0.0.1
 * @author: lijun <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hands
 */

import React from 'react';
import { isNumber, isFunction, uniqBy, omit, isEmpty, isArray, groupBy, find, chunk } from 'lodash';
import { Input, Select, DatePicker, InputNumber, Form, Row, Col } from 'hzero-ui';
import staticEval from 'static-eval';
import { parse } from 'esprima';
import moment from 'moment';
import intl from 'utils/intl';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

// FormItem组件初始化
const FormItem = Form.Item;

// Option组件初始化
const { Option } = Select;

// 租户ID初始化
const organizationId = getCurrentOrganizationId();

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

/**
 * arrayInsertByIndex - 指定数组下脚标插入元素
 *
 * @param {*} [arr=[]]
 * @param {*} index
 * @param {*} item
 */
function arrayInsertByIndex(arr = [], index, item) {
  arr.splice(index, 0, item);
}

// 静态变量:弹性域触发器
const FLEX_FIELDS_DEFAULT_FIELD_NAME = 'FLEX_FIELDS_TRIGGERS';

/**
 * getFlexFormItemComponent - 获取弹性域form元素组件
 *
 * @export
 * @param {*} flexFormItemName - 组件类型
 * @param {*} [form={}] - form双向绑定
 * @returns function
 */
export function getFlexFormItemComponent(flexFormItemName, form = {}) {
  const { getFieldDecorator = () => {} } = form;
  const defaultFlexFormItems = {
    INPUT: ({ fieldName, formItemProps = {}, fieldDecoratorOptions = {}, fieldItemProps = {} }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(`FLEX_${fieldName}`, fieldDecoratorOptions)(
          <Input {...fieldItemProps} />
        )}
      </FormItem>
    ),
    NUMBER: ({
      fieldName,
      formItemProps = {},
      fieldDecoratorOptions = {},
      fieldItemProps = {},
    }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(`FLEX_${fieldName}`, fieldDecoratorOptions)(
          <InputNumber {...fieldItemProps} />
        )}
      </FormItem>
    ),
    LOV: ({ fieldName, formItemProps = {}, fieldDecoratorOptions = {}, fieldItemProps = {} }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(`FLEX_${fieldName}`, fieldDecoratorOptions)(<Lov {...fieldItemProps} />)}
      </FormItem>
    ),
    LANG: ({ fieldName, formItemProps = {}, fieldDecoratorOptions = {}, fieldItemProps = {} }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(`FLEX_${fieldName}`, fieldDecoratorOptions)(
          <TLEditor {...fieldItemProps} />
        )}
      </FormItem>
    ),
    SELECT: ({
      fieldName,
      formItemProps = {},
      fieldDecoratorOptions = {},
      fieldItemProps = {},
      dataSource = [],
    }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(`FLEX_${fieldName}`, fieldDecoratorOptions)(
          <Select {...fieldItemProps}>
            {dataSource.map(n => (
              <Option key={n} value={n}>
                {n}
              </Option>
            ))}
          </Select>
        )}
      </FormItem>
    ),
    DATE: ({ fieldName, formItemProps = {}, fieldDecoratorOptions = {}, fieldItemProps = {} }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(`FLEX_${fieldName}`, {
          ...fieldDecoratorOptions,
          initialValue: fieldDecoratorOptions.initialValue
            ? moment(fieldDecoratorOptions.initialValue)
            : undefined,
        })(<DatePicker {...fieldItemProps} />)}
      </FormItem>
    ),
  };
  const flexItem = defaultFlexFormItems[flexFormItemName];
  return isFunction(flexItem) ? flexItem : () => {};
}

/**
 * 查询规则明细配置及字段
 * @async
 * @function getFlexFieldsConfig
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export function getFlexFieldsConfig(flexRuleCode) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/detail-config`, {
    query: { ruleCode: flexRuleCode },
  }).then(res => (res && !res.failed ? res : []));
}

/**
 * 查询规则明细配置及字段
 * @async
 * @function queryFlexFieldsConfig
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export function queryFlexFieldsConfig(flexRuleCode) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/detail-config`, {
    query: { ruleCode: flexRuleCode },
  }).then(res => (res && !res.failed ? res : []));
}

/**
 * 角色级弹性域规则明细列表
 * @async
 * @function queryFlexRuleDetails
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export function queryFlexRuleDetails(scope, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/${scope}`, {
    query,
  }).then(res => (res && !res.failed ? res : {}));
}

/**
 * 保存弹性域规则明细
 * @async
 * @function saveFlexRuleDetails
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function saveFlexRuleDetails(ruleCode, scope, data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/${scope}`, {
    method: 'POST',
    body: data,
    query: {
      ruleCode,
    },
  });
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}

/**
 * flexFieldColumnsFactory - 组装弹性域表格列
 *
 * @export
 * @param {*} triggerId - 触发器ID
 * @param {*} isTriggered - 是否触发
 * @param {*} [config=[]] - 触发器配置
 * @returns Array
 */
export function flexFieldColumnsFactory(triggerId, isTriggered, config = []) {
  return isTriggered
    ? config
        .map(o =>
          o.ruleDetailId === triggerId
            ? Object.assign(
                {
                  title: o.description,
                  width: o.Width || o.defaultWidth || 100,
                  dataIndex: o.fieldName,
                  fieldType: o.fieldType,
                  FLEX_seq: o.c,
                  formItemProps: o.formItemProps,
                  fieldDecoratorOptions: o.fieldDecoratorOptions,
                  fieldItemProps: o.fieldItemProps,
                  ...(o.otherTableProps || {}),
                },
                isFunction(o.render) ? { render: o.render } : {}
              )
            : false
        )
        .filter(Boolean)
    : [];
}

/**
 * flexFieldFormItemFactory - 组装弹性域表单
 *
 * @export
 * @param {*} triggerId - 触发器ID
 * @param {*} isTriggered- 是否触发
 * @param {*} [config=[]] - 触发器配置
 * @param {*} form - form双向绑定机制
 * @returns Array
 */
export function flexFieldFormItemFactory(triggerId, isTriggered, config = [], form) {
  return config
    .map(o => {
      const {
        fieldName,
        fieldType,
        c,
        r,
        formItemProps,
        fieldDecoratorOptions,
        fieldItemProps,
        valueSource,
      } = o;
      const item = {
        key: fieldName,
        type: fieldType,
        c,
        r,
        component: (rest = {}) =>
          getFlexFormItemComponent(fieldType, form)({
            fieldName: `FLEX_${fieldName}`,
            formItemProps: { ...formItemProps, ...(rest.formItemProps || {}) },
            fieldDecoratorOptions: {
              ...fieldDecoratorOptions,
              ...(rest.fieldDecoratorOptions || {}),
            },
            fieldItemProps: {
              ...fieldItemProps,
              ...(fieldType === 'LOV' ? { code: valueSource } : {}),
              ...(rest.fieldItemProps || {}),
            },
            dataSource: rest.dataSource,
          }),
      };
      return triggerId === o.ruleDetailId && isTriggered ? item : false;
    })
    .filter(Boolean);
}

/**
 * flexFieldTriggerFactory - 组装触发器
 *
 * @export
 * @param {*} triggerId - 触发器ID
 * @param {*} [options={}] - 触发器配置选项
 * @param {*} [sourceFieldsValues={}] - 表单数据源
 * @returns Object
 */
export function flexFieldTriggerFactory(triggerId, options = {}, sourceFieldsValues = {}) {
  let isTriggered = false;
  try {
    const ast = (((parse((options || {}).condition || []) || {}).body || [])[0] || {}).expression;
    const fieldsValues = {};
    (options.fieldsKeys || []).forEach(n => {
      fieldsValues[n] = undefined;
    });
    isTriggered =
      isEmpty(options.condition) ||
      (staticEval(ast, {
        ...fieldsValues,
        ...sourceFieldsValues,
        like: (x = '', y) => x.includes(y),
      }) ||
        false);
    // isEmpty(flexCondition) || flexFieldsRuleConfig.every(o => o.ruleDetailId === triggerId && (!isNull(sourceFieldsValues[o.fieldName]) && !isUndefined(sourceFieldsValues[o.fieldName])) && sourceFieldsValues[o.fieldName] === o.fieldValue);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return { triggerId, isTriggered };
}

/**
 * getFlexFieldTriggers - 获取触发器
 *
 * @export
 * @param {*} [flexFieldsConfig=[]] - 弹性域配置信息
 * @param {*} [sourceFieldsValues={}] - 表单数据源用于激活触发器的钥匙
 * @returns Array
 */
export function getFlexFieldTriggers(flexFieldsConfig = [], sourceFieldsValues = {}) {
  return flexFieldsConfig.map(o => ({
    ...flexFieldTriggerFactory(
      o.ruleDetailId,
      { condition: o.flexCondition, fieldsKeys: o.fieldList },
      sourceFieldsValues
    ),
    config: assignFlexFieldsConfigList(o.detailConfigList),
  }));
}

/**
 * assignFlexFieldsConfigList - 组装弹性域组件配置
 *
 * @export
 * @param {*} [detailConfigList=[]] - 弹性域涞源配置信息
 * @returns Array
 */
export function assignFlexFieldsConfigList(detailConfigList) {
  return (detailConfigList || []).map(o => ({
    fieldName: o.fieldName,
    fieldType: o.fieldType,
    description: o.fieldDescription,
    c: o.orderSeq,
    r: o.fieldColumnNumber,
    width: o.fieldColumnWidth,
    formItemProps: {
      label: o.fieldDescription,
    },
    fieldDecoratorOptions: {
      rules: [{ required: o.requiredFlag === 1 }],
    },
    fieldItemProps: {
      disabled: o.readableFlag === 1,
    },
    valueSource: o.valueSource,
    ruleDetailId: o.ruleDetailId,
  }));
}

/**
 * getFlexFieldsConfigListAll
 *
 * @export
 * @param {*} [flexFieldsConfig=[]]
 * @returns
 */
export function getFlexFieldsConfigListAll(flexFieldsConfig = []) {
  const flexFieldsConfigList = {};
  flexFieldsConfig.forEach(n => {
    flexFieldsConfigList[n.ruleDetailId] = assignFlexFieldsConfigList(n.detailConfigList);
  });
  return flexFieldsConfigList;
}

/**
 * getFlexFieldsTableColumns - 获取弹性域表格列
 *
 * @export
 * @param {*} [triggers=[]] - 弹性域触发器
 * @returns Array
 */
export function getFlexFieldsTableColumns(triggers = []) {
  let flexFieldColumns = [];
  triggers.forEach(n => {
    const { triggerId, isTriggered, config } = n;
    flexFieldColumns = flexFieldColumns.concat(
      flexFieldColumnsFactory(triggerId, isTriggered, config)
    );
  });
  return uniqBy(flexFieldColumns, 'dataIndex');
}

/**
 * getFlexFieldFormItems - 获取弹性域表单组件
 *
 * @export
 * @param {*} [triggers=[]] - 弹性域触发器
 * @param {*} [form={}] - 表单双向绑定
 * @returns
 */
export function getFlexFieldFormItems(triggers = [], form = {}) {
  let flexFieldFormItems = [];
  triggers.forEach(n => {
    const { triggerId, isTriggered, config } = n;
    flexFieldFormItems = flexFieldFormItems.concat(
      flexFieldFormItemFactory(triggerId, isTriggered, config, form)
    );
  });
  return uniqBy(flexFieldFormItems, 'key');
}

/**
 * 应用页面查询API默认绑定弹性域默认查询参数
 * @function withFlexFieldsQueryParams
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @example
 * const { params, flexRuleCode, tenantId } = this.props;
 * withFlexFieldsQueryParams(params)(flexModelCode, tenantId);
 *
 * @returns {object} fetch Promise
 */
export function withFlexFieldsQueryParams(params = {}) {
  return (flexRuleCode, tenantId) =>
    omit({ ...params, flexRuleCode, tenantId: isNumber(tenantId) ? tenantId : params.tenantId }, [
      FLEX_FIELDS_DEFAULT_FIELD_NAME,
    ]);
}

/**
 * withListDataSourceFlex - 应用页面组装表格数据源
 * 弹性域表格需要数据源需要解析flex字段
 *
 * @export
 * @param {*} [dataSource=[]] - 表格数据源
 * @example
 * const { dataSource = [] } = this.props;
 * const tableProps = {
 *  dataSource: withListDataSourceFlex(dataSource),
 *  // ...other props;
 * };
 *
 * @returns Array
 */
export function withListDataSourceFlex(dataSource = []) {
  return dataSource.map(o => {
    const flexFieldsKeys = Object.keys(o.flex || {});
    const item = o;
    flexFieldsKeys.forEach(n => {
      item[n] = o.flex[n];
    });
    return item;
  });
}

/**
 * withFormDataSourceFlex - 弹性域应用页面表单数据源flex解析
 *
 * @export
 * @param {*} [dataSource={}] - 表单数据源
 * @example
 * const { formDataSource } = this.props;
 * withFormDataSourceFlex(formDataSource);
 *
 * @returns Object
 */
export function withFormDataSourceFlex(dataSource = {}) {
  return omit({ ...dataSource, ...(dataSource.flex || {}) }, [FLEX_FIELDS_DEFAULT_FIELD_NAME]);
}

export function withFormDataFlex(data = {}) {
  const flexFieldsKeys =
    Object.keys(data).filter(o => o.includes('FLEX_') && o !== FLEX_FIELDS_DEFAULT_FIELD_NAME) ||
    [];
  const flex = {};
  flexFieldsKeys.forEach(n => {
    flex[n.split('_')[1]] = data[n];
  });
  return { ...withFormDataSourceFlex(omit(data, flexFieldsKeys)), flex };
}

/**
 * withTableFlexColumns - 弹性域应用页面表格列合并
 *
 * @export
 * @param {*} [defaultColumns=[]] - 默认表格列
 * @example
 * const columns = [
 *  // ...
 * ];
 * const { flexFieldsTriggers = [] } = this.props;
 * const tableProps = {
 *  columns: withTableFlexColumns(columns)(flexFieldsTriggers, flexFieldsTableColumns => {
 *    ...
 *  }),
 * }
 *
 *
 * @returns Array
 */
// export function withTableFlexColumns(defaultColumns = []) {
//   const newColumns = [...defaultColumns];
//   return (flexFieldsTriggers = [], cb = () => {}) => {
//     const tableflexColumns = cb(getFlexFieldsTableColumns(flexFieldsTriggers));
//     tableflexColumns.forEach(o => {
//       arrayInsertByIndex(newColumns, o.FLEX_seq, o);
//     });
//     return uniqBy(newColumns, 'dataIndex');
//   };
// }

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

export function getFormItemsLayout(formComponentObject = {}) {
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
  const result = {};
  if (!isEmpty((formComponentObject.props || {}).children)) {
    recurveFormObject((formComponentObject.props || {}).children);
    const formItemsLayoutGroup = groupBy(formItemsLayoutArr, 'index');
    let formItemsLayout = [];
    Object.keys(formItemsLayoutGroup).forEach(n => {
      formItemsLayout = formItemsLayout.concat(
        formItemsLayoutGroup[n].map((m, i) => {
          return { ...m, row: i, col: m.index };
        })
      );
    });
    const cols = Object.keys(formItemsLayoutGroup || {}) || [];
    const withElementCountRows = (cols.map(o => formItemsLayoutGroup[o].length) || []).sort();
    const maxCol = Number(cols[cols.length - 1] || 0) + 1;
    const maxRow = Number(withElementCountRows[withElementCountRows.length - 1] || 0);
    result.layout = formItemsLayout;
    result.maxCol = maxCol;
    result.maxRow = maxRow;
  }
  return result;
}

export function isCheckedByFlexCondition(flexCondition = '', fieldsValues = {}) {
  let checked = false;
  try {
    if (!isEmpty(flexCondition)) {
      const ast = ((parse(flexCondition).body || [])[0] || {}).expression;
      checked = staticEval(ast, { ...fieldsValues, like: (x = '', y) => x.includes(y) }) || false;
    } else {
      checked = true;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    window.console.warn(e);
  }

  return checked;
}

export function getCheckedDetailConfigList(config = [], triggerForm = {}) {
  const { getFieldsValue = () => {} } = triggerForm;
  const checkedConfig = config.filter(
    o =>
      o.enabledFlag === 1 && isCheckedByFlexCondition(o.flexCondition, getFieldsValue(o.fieldList))
  );
  const checkedDetailConfigList = [].concat(...checkedConfig.map(o => o.detailConfigList));
  return uniqBy(checkedDetailConfigList, 'fieldName');
}

export function formItemsFactory(
  config = [],
  triggerForm = {},
  targetForm = {},
  dataSource = {},
  setFormItemsProps = () => {}
) {
  const checkedDetailConfigList = getCheckedDetailConfigList(config, triggerForm) || [];
  setFormItemsProps(checkedDetailConfigList);

  return checkedDetailConfigList.map((o = {}) => ({
    ...o,
    component: getFlexFormItemComponent(o.fieldType, targetForm)({
      fieldName: o.fieldName,
      formItemProps: {
        key: o.fieldName,
        label: o.fieldDescription,
        ...EDIT_FORM_ITEM_LAYOUT,
        ...(o.formItemProps || {}),
      },
      fieldDecoratorOptions: {
        initialValue: dataSource[o.fieldName],
        ...(o.requiredFlag === 1
          ? {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: o.fieldDescription,
                  }),
                },
              ],
            }
          : {}),
        ...(o.fieldDecoratorOptions || {}),
      },
      fieldItemProps: {
        disabled: o.readableFlag === 1,
        ...(o.fieldType === 'LOV' ? { code: o.valueSource } : {}),
        ...(o.fieldItemProps || {}),
      },
      dataSource: o.valueSource,
    }),
  }));
}

export function withFlexFieldsFormRender(formComponentObject = {}) {
  const newFormComponentObject = formComponentObject;

  const formLayout = getFormItemsLayout(newFormComponentObject);
  const { maxCol } = formLayout;
  return ({
    flexFieldsConfig = {},
    triggerForm = {},
    targetForm = {},
    setFormItemsProps = () => {},
    dataSource = {},
    targetFormLayout = 'default',
    defaultFormItemLayout,
  }) => {
    const formItemsConfigList =
      formItemsFactory(
        flexFieldsConfig.config,
        triggerForm,
        targetForm,
        dataSource,
        setFormItemsProps
      ) || [];
    let TempRow;
    const targetFormLayoutArr = targetFormLayout.split(',');
    if (!isEmpty(defaultFormItemLayout)) {
      formItemsConfigList.forEach(n => {
        const item = n;
        item.component.props.labelCol = defaultFormItemLayout.labelCol;
        item.component.props.wrapperCol = defaultFormItemLayout.wrapperCol;
      });
    }
    if (!isEmpty((newFormComponentObject.props || {}).children)) {
      const layoutActionMap = {
        default: () => {
          TempRow = chunk(formItemsConfigList, maxCol).map(n => (
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              {n.map(
                o =>
                  !isEmpty(o.component) && <Col span={Math.round(24 / maxCol)}>{o.component}</Col>
              )}
            </Row>
          ));
          if (newFormComponentObject.props && isArray(newFormComponentObject.props.children)) {
            newFormComponentObject.props.children.push(TempRow);
          }
        },
        NO_COL: () => {
          TempRow = formItemsConfigList.map(o => o.component);
        },
        EDIT_FORM_ROW: () => {
          layoutActionMap.NO_COL();
          TempRow = <Row {...EDIT_FORM_ROW_LAYOUT}>{TempRow}</Row>;
        },
        NO_ROW: () => layoutActionMap.NO_COL(),
        SINGLE_COLUMN: () => {
          if (newFormComponentObject.props && isArray(newFormComponentObject.props.children)) {
            newFormComponentObject.props.children = newFormComponentObject.props.children.concat(
              TempRow
            );
          }
        },
      };
      const layoutActionMapKeys = Object.keys(layoutActionMap);
      if (
        targetFormLayoutArr.indexOf('default') > -1 ||
        layoutActionMapKeys.every(o => targetFormLayoutArr.indexOf(o) === -1)
      ) {
        layoutActionMap.default();
        return formComponentObject;
      }
      layoutActionMapKeys.forEach(n => {
        if (targetFormLayoutArr.indexOf(n) > -1 && layoutActionMap[n]) {
          layoutActionMap[n]();
        }
      });

      // formItemsConfigList.forEach((n) => {
      //   if (!isEmpty(n.component)) {
      //     const col = n.fieldColumnNumber;
      //     const row = n.orderSeq;
      //     debugger;
      //   }
      // });
    }
    return formComponentObject;
  };
}

export function withFlexFieldsTableColumnsRender(
  config,
  columns = [],
  triggerForm = {},
  setColumns = () => {},
  editable = false
) {
  const checkedDetailConfigList = getCheckedDetailConfigList(config, triggerForm).filter(
    o => o.readableFlag === 0
  );
  const tableflexColumns = checkedDetailConfigList.map(n => ({
    dataIndex: n.fieldName,
    title: n.fieldDescription,
    width: n.fieldColumnWidth,
  }));
  const defaultColumns = columns;
  tableflexColumns.forEach(n => {
    const { fieldType, readableFlag, requiredFlag, fieldDescription, fieldColumnNumber } =
      checkedDetailConfigList.find(o => o.fieldName === n.dataIndex) || {};
    defineProperty(n, 'getFlexFieldColumnProperty', () => {
      const formItemProps = {
        disabled: readableFlag === 1,
      };
      const fieldDecoratorOptions = {
        initialValue: null,
      };
      if (requiredFlag === 1) {
        fieldDecoratorOptions.rules = [
          {
            required: true,
            message: intl.get('hzero.common.validation.notNull', {
              name: fieldDescription,
            }),
          },
        ];
      }
      return {
        formItemProps,
        fieldColumnNumber,
        fieldName: n.dataIndex,
        fieldType,
        fieldDecoratorOptions,
      };
    });
    // item.render = (val, record) => {
    //   const FlexFieldFormItem = getFlexFormItemComponent(fieldType, record.$form);
    //   const formItemProps = {
    //     disabled: readableFlag === 1,
    //   };
    //   const fieldDecoratorOptions = {
    //     initialValue: val,
    //   };
    //   if (requiredFlag === 1) {
    //     fieldDecoratorOptions.rules = [
    //       {
    //         required: true,
    //         message: intl.get('hzero.common.validation.notNull', {
    //           name: fieldDescription,
    //         }),
    //       },
    //     ];
    //   }
    //   return record._status === 'create' ? (
    //     <FlexFieldFormItem
    //       fieldName={n.dataIndex}
    //       formItemProps={formItemProps}
    //       fieldDecoratorOptions={fieldDecoratorOptions}
    //     />
    //   ) : (
    //     val
    //   );
    // };
  });
  setColumns(tableflexColumns, checkedDetailConfigList);

  tableflexColumns.forEach(o => {
    arrayInsertByIndex(defaultColumns, o.getFlexFieldColumnProperty().fieldColumnNumber - 1, o);
  });

  return editable ? withTableFlexColumns(defaultColumns) : defaultColumns;
}

export function withTableFlexColumns(columns = []) {
  return columns.map(n =>
    isFunction(n.getFlexFieldColumnProperty)
      ? {
          ...n,
          render: (value, record) => {
            const {
              formItemProps,
              fieldName,
              fieldType,
              fieldDecoratorOptions,
            } = n.getFlexFieldColumnProperty();
            return record._status === 'create'
              ? getFlexFormItemComponent(fieldType, record.$form)({
                  fieldName,
                  formItemProps,
                  fieldDecoratorOptions,
                })
              : value;
          },
        }
      : n
  );
}
