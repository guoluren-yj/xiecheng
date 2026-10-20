/* eslint-disable eqeqeq */
/**
 * 个性化组件utils工具包
 * @date: 2019-12-15
 * @version: 0.0.1
 * @author: zhaotong <tong.zhao@hand-china.com>
 * @copyright Copyright (c) 2019, Hands
 */

import React, { cloneElement, ReactNode } from 'react';
import moment from "moment";
import { Form, Icon, Input, InputNumber, Tooltip } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
// import { groupBy, isNil, isArray, isEmpty } from 'lodash';
import { isNil, isArray, isEmpty, isNumber, omit, isUndefined } from 'lodash';
import TLEditor from 'components/TLEditor';
// @ts-ignore
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { numberRender } from '../../utils';
import { yesOrNoRender } from 'utils/renderer';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import {
  getCurrentOrganizationId,
  getResponse,
  getUserOrganizationId,
} from 'hzero-front/lib/utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { queryFileList } from 'hzero-front/lib/services/api';
import { FormItemProps } from 'hzero-ui/lib/form';
import {
  FlexSelect,
  // FlexRadioGroup,
  FlexLov,
  FlexDatePicker,
  FlexCheckbox,
  FlexSwitch,
  FlexLink,
} from './FlexComponents';
import LovMulti from './LovMulti';
import { FieldConfig, ParamList, ConditionHeaderDTO, ConValid, UnitAlias } from './interfaces';
import template from '../../utils/template';
// FormItem组件初始化
const FormItem = Form.Item;

/* 接口部分 */

// const mockapi = '/api/hpfm';

export async function queryCode(params = {}) {
  return getResponse(
    await request(`${HZERO_PLATFORM}/v1/lovs/value`, {
      query: params,
    })
  );
}

export async function queryUnitCustConfigPost(params = {}, queryParams, uiQueryError) {
  return getResponse(
    await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/ui-customize`, {
      body: params,
      query: queryParams,
      method: 'POST',
    },
    { beforeCatch: e => {uiQueryError();throw e;} }),
    undefined
  );
}

export async function fetchFileList(uuid, bucketName) {
  const tenantId = getCurrentOrganizationId();
  const err = intl.get('hzero.common.message.confirm.attachment.atLeast');
  if (
    uuid &&
    (await queryFileList({
      tenantId,
      bucketName,
      attachmentUUID: uuid,
    }).then(fileList => {
      if ((getResponse as any)(fileList)) {
        if (fileList.length > 0) return true;
        else return false;
      }
      return false;
    }))
  ) {
    return;
  }
  return err || '附件为必传项，请至少上传一个附件！';
}

/**
 * 对拿到数据做进一步的渲染适配
 * @param renderOptions 渲染类别
 */
export function getRender(fieldType, componentProps: any = {}) {
  switch (fieldType) {
    case 'SWITCH':
    case 'CHECKBOX':
      return val => yesOrNoRender(Number(val));
    case 'INPUT_NUMBER':
      return isNil(componentProps.precision)
        ? val => val
        : val => numberRender(val, componentProps.precision, true, true);
    case 'DATE_PICKER':
      return val => val && moment(val).format(componentProps.format);
    default:
      return val => val;
  }
}

export function getValuePropName(type) {
  if (type === 'UPLOAD') return 'attachmentUUID';
  if (type === 'CHECKBOX' || type === 'SWITCH') return 'checked';
  return 'value';
}

export function customizeFormOptions(options: FieldConfig, rules: any[]) {
  const { fieldType, dateFormat = '', initialValue } = options || {};

  const formOptions: any = {
    rules,
    valuePropName: getValuePropName(fieldType),
    initialValue,
  };
  // if(fieldType === 'RADIO_GROUP'){
  //   formOptions.getValueProps = e => (e||{target: {}}).target.value;
  //   formOptions.getValueFromEvent = e => {
  //     return e.target.value;
  //   };
  // }
  if (fieldType === 'DATE_PICKER') {
    // const onlyDateFormat = dateFormat.match(/(^\S+DD)/) || ['YYYY/MM/DD'];
    const newDateFormat = /HH|hh|mm|ss/.test(dateFormat)
      ? dateFormat
      : `${DEFAULT_DATE_FORMAT} 00:00:00`;
    formOptions.getValueProps = dateStr => ({
      value: dateStr ? moment(dateStr, newDateFormat) : dateStr,
    });
    formOptions.getValueFromEvent = e => {
      if (!e || !e.target) {
        return e && e.format ? e.format(newDateFormat) : e;
      }
      const { target } = e;
      return target.type === 'checkbox' ? target.checked : target.value;
    };
  }
  return formOptions;
}

export function parseContentProps(contentProps: FieldConfig, code: string | undefined) {
  const {
    lovCode,
    editable,
    fieldCode,
    fieldName,
    numberMax,
    numberMin,
    numberPrecision,
    dateFormat = '',
    bucketName,
    bucketDirectory,
    textAreaMaxLine,
    fieldType,
    linkTitle,
    linkHref,
    linkNewWindow,
    linkType,
    modalWidth,
    lovMappings,
    dataSource = {},
    paramList = [],
    defaultValue,
    defaultValueMeaning,
    isGrid,
    placeholder,
    getValueFromCache,
    viewOnly,
    supplementZero,
    trimFlag,
    ...rest
  } = contentProps || {};
  const disabled = editable === 0;
  let value = dataSource[fieldCode];
  let meaning = dataSource[`${fieldCode}Meaning`];
  if (isNil(value)) {
    value = defaultValue;
    meaning = defaultValueMeaning;
  }
  if (!isNil(meaning)) {
    meaning =
      typeof meaning === 'object' && fieldType !== 'LOV'
        ? Object.values(meaning).join('/')
        : meaning;
  } else {
    meaning = value;
  }
  let initialValue = preAdapterInitValue(fieldType, value);
  if (!isNil(initialValue) && fieldType === 'INPUT_NUMBER') {
    if (!isNil(numberMax)) {
      initialValue = Math.min(Number(initialValue), Number(numberMax));
    }
    if (!isNil(numberMin)) {
      initialValue = Math.max(Number(initialValue), Number(numberMin));
    }
  }
  const commonProps: any = {
    initialValue,
    initialMeaning: meaning,
    placeholder,
    disabled,
    dataSource,
    ...omit(rest, [
      'conditionHeaderDTOs',
      'renderOptions',
      'required',
      'visible',
      'standardField',
      'isStandardField',
    ]),
  };
  let tempProps: any = {};
  if (fieldType === 'INPUT') {
    tempProps = {
      trim: trimFlag !== 1,
      trimAll: trimFlag == 1,
    };
  }
  if (fieldType === 'TEXT_AREA') {
    tempProps = {
      rows: textAreaMaxLine || 2,
    };
  }
  if (fieldType === 'INPUT_NUMBER') {
    tempProps = {
      max: isNil(numberMax) ? undefined : Number(numberMax),
      min: isNil(numberMin) ? undefined : Number(numberMin),
    };
    if (numberPrecision !== undefined) {
      tempProps.precision = numberPrecision;
    }
    tempProps.padDecimalZeros = isNil(supplementZero) || supplementZero === 1;
  }
  if (fieldType === 'DATE_PICKER') {
    tempProps = {
      fieldCode,
      showTime: /HH|hh|mm|ss/.test(dateFormat),
      format: dateFormat,
    };
  }
  if (fieldType === 'LOV') {
    tempProps = {
      code: lovCode,
      lovMappings,
      textValue: meaning,
      queryParams: getContextParams(paramList, {
        code,
        getValueFromCache,
        isGrid,
        targetForm: rest.form,
        targetDataSource: dataSource,
      }),
    };
    if (rest.multipleFlag === 1) {
      delete tempProps.lovMappings;
      tempProps.translateData = tempProps.textValue;
      delete tempProps.textValue;
    }
  }
  if (fieldType === 'TL_EDITOR') {
    tempProps = {
      label: fieldName,
      field: fieldCode,
      token: dataSource._token,
    };
  }
  if (fieldType === 'UPLOAD') {
    tempProps = {
      label: fieldName,
      field: fieldCode,
      viewOnly: disabled || viewOnly,
      bucketName,
      bucketDirectory,
    };
    delete commonProps.disabled;
  }
  if (fieldType === 'LINK') {
    tempProps = {
      linkTitle,
      linkHref,
      linkNewWindow,
      linkType,
      modalWidth,
      form: rest.form,
      dataSource,
    };
  }
  if (fieldType === 'SELECT') {
    tempProps = {
      lovCode,
      lovMappings,
      fieldCode,
      multipleFlag: rest.multipleFlag === 1,
      params: getContextParams(paramList, {
        getValueFromCache,
        isGrid,
        code,
        targetForm: rest.form,
        targetDataSource: dataSource,
      }),
    };
  }
  // eslint-disable-next-line no-param-reassign
  if (fieldType === 'SWITCH') delete commonProps.style;
  return {
    ...commonProps,
    ...tempProps,
  };
}

/**
 * 根据类型参数生成不同的表单组件
 * @param type 组件类型
 */
export function getFormItemComponent(fieldType, renderOptions, code?: string) {
  let Component;
  switch (fieldType) {
    case 'INPUT':
      Component = props => <Input {...props} />;
      break;
    case 'INPUT_NUMBER':
      Component = props => <InputNumber {...props} />;
      break;
    case 'SELECT':
      Component = props => <FlexSelect {...props} />;
      break;
    // case 'RADIO_GROUP':
    //   Component = props => <FlexRadioGroup {...props} />;
    //   break;
    case 'CHECKBOX':
      Component = FlexCheckbox;
      break;
    case 'SWITCH':
      Component = props => <FlexSwitch {...props} />;
      break;
    case 'LOV':
      Component = FlexLov;
      break;
    case 'DATE_PICKER':
      Component = FlexDatePicker;
      break;
    case 'UPLOAD':
      Component = props => <Upload {...props} />;
      break;
    case 'TL_EDITOR':
      Component = props => <TLEditor {...props} />;
      break;
    case 'TEXT_AREA':
      Component = props => <Input.TextArea {...props} />;
      break;
    case 'LINK':
      Component = props => <FlexLink {...props} />;
      break;
    default:
      Component = props => <Input {...props} />;
  }
  return options => {
    const {
      form,
      isEdit = true, // 表单默认true
      readOnly,
      wrapProps,
      contentProps,
      fieldCode,
      formOptions = {},
      rules,
      numberMax,
      numberMin,
    } = options;
    const viewOnly = !isEdit || readOnly || renderOptions !== 'WIDGET' || !form;
    const hasFormDec = !!form;
    contentProps.form = form;
    const { initialValue, initialMeaning, ...componentProps } = parseContentProps(
      { ...contentProps, viewOnly },
      code
    );
    const newFormOptions = customizeFormOptions({ ...formOptions, initialValue }, rules);
    if (!isNil(newFormOptions.initialValue) && fieldType === 'INPUT_NUMBER') {
      if (!isNil(numberMax)) {
        newFormOptions.initialValue = Math.min(Number(newFormOptions.initialValue), Number(numberMax));
      }
      if (!isNil(numberMin)) {
        newFormOptions.initialValue = Math.max(Number(newFormOptions.initialValue), Number(numberMin));
      }
    }
    let component;
    const forceUseComponent =
      fieldType === 'UPLOAD' ||
      fieldType === 'LINK' ||
      (contentProps.multipleFlag === 1 && fieldType === 'LOV');
    // 调整component
    if (viewOnly && !forceUseComponent) {
      if (hasFormDec) {
        component = form.getFieldDecorator(fieldCode, newFormOptions)(
          <span style={{ wordBreak: 'break-word' }}>no-init</span>
        );
      } else {
        component = <span style={{ wordBreak: 'break-word' }}>no-init</span>;
      }
      const values = { ...componentProps.dataSource, ...(form && form.getFieldsValue()) };
      const newValue = preAdapterInitValue(fieldType, values[fieldCode]);
      let newMeaning = initialMeaning;
      if (newValue !== initialValue) {
        newMeaning = newValue;
      }
      // 只读但不使用组件自带的只读模式
      component = (
        <span style={{ wordBreak: 'break-word' }}>
          {getRender(fieldType, componentProps)(
            fieldType === 'LOV' || fieldType === 'SELECT' ? newMeaning : newValue
          )}
        </span>
      );
      return isEdit ? <FormItem {...wrapProps}>{component}</FormItem> : component;
    }
    component =
      fieldType === 'LOV' && contentProps.multipleFlag === 1 ? (
        <LovMulti {...componentProps} viewOnly={viewOnly} />
      ) : (
        Component(componentProps)
      );
    if (viewOnly) {
      // 只读并使用组件自带的只读模式需手动设置组件对应的value
      component =
        fieldType === 'UPLOAD'
          ? cloneElement(component, { attachmentUUID: initialValue })
          : cloneElement(component, { value: initialValue });
    }
    // 如果form存在，value将由form接管
    if (hasFormDec) {
      component = form.getFieldDecorator(fieldCode, newFormOptions)(component);
    }
    return isEdit ? <FormItem {...wrapProps}>{component}</FormItem> : component;
  };
}

/**
 * 对initialValue进行预处理
 * @param type 处理类型
 * @param value 表单值
 */
export function preAdapterInitValue(type, value) {
  switch (type) {
    case 'CHECKBOX':
    case 'SWITCH':
      // eslint-disable-next-line eqeqeq
      return isNil(value) ? value : Number(value);
    default:
      return value;
  }
}

type RulesOptions = {
  getValueFromCache: Function;
  code: string;
  rowKey?: string | number;
};

/**
 * 用于调整FormItem类型的react-element对象的配置
 * @param {object} individual 个性化配置属性
 */
export function customizeFormRules(individual: FieldConfig, tools: RulesOptions) {
  const { textMaxLength, textMinLength, required, fieldName, conValidDTO, fieldType } =
    individual || {};
  const rules: any[] = [];
  if (textMaxLength !== -1 && textMaxLength !== undefined) {
    rules.push({
      max: textMaxLength,
      message: intl.get('hzero.common.validation.max', {
        max: textMaxLength,
      }),
    });
  }
  if (textMinLength !== -1 && textMinLength !== undefined) {
    rules.push({
      min: textMinLength,
      message: intl.get('hzero.common.validation.min', {
        min: textMinLength,
      }),
    });
  }
  if (required !== -1 && required !== undefined) {
    if (fieldType === 'UPLOAD' && required) {
      rules.push({
        customize: true,
        isUpload: true,
        validator: async (_, value, cb) => {
          const msg = await fetchFileList(value, individual.bucketName);
          if (msg !== undefined) {
            cb(msg);
            return;
          }
          cb();
        },
      });
    } else {
      rules.push({
        required: !!required,
        message: intl.get('hzero.common.validation.notNull', {
          name: fieldName,
        }),
      });
    }
  }
  if (conValidDTO) {
    rules.push({
      customize: true,
      validator(_, _1, cb) {
        const msg = selfValidator(conValidDTO, tools);
        if (msg !== undefined) {
          cb(msg);
          return;
        }
        cb();
      },
    });
  }
  return rules;
}

/**
 * 调整FormItem的行列结构
 * @param targetRows 原存储FormItem行列信息的对象，key为行数
 * @param formItem 插入的表单项
 * @param Object 配置对象
 */
export function adjustRowAndCol(
  targetRows = {},
  formItem,
  { row, col, rowProps, colProps, tempItems }
) {
  const newRow = row - 1;
  const newCol = col - 1;
  if (row === undefined || col === undefined || !isNumber(newRow) || !isNumber(newCol)) {
    tempItems.push({ formItem, rowProps, colProps });
    return;
  }
  const parseRows = targetRows;
  // 如果被检测行不存在，会在targetRows中初始化一个行
  if (!parseRows[newRow]) {
    parseRows[newRow] = {
      rowProps: {},
      formItemList: [],
    };
  }
  if (parseRows[newRow].formItemList[newCol]) {
    tempItems.push({ formItem, rowProps, colProps });
    return;
  }
  parseRows[newRow].rowProps = rowProps;
  parseRows[newRow].formItemList[newCol] = {
    colProps,
    formItem,
  };
}

/**
 * 使用新规则替换FormItem原有的校验规则
 * @param formItem FormItem的reactElement
 * @param rules 新的规则项
 */
export function traversalFormItems(formItem: any = {}, fieldConfig: FieldConfig): ReactNode {
  const { fieldName, initNewFormItemProps, helpMessage } = fieldConfig || {};
  const children = formItem && formItem.props ? formItem.props.children : null;
  let newNode = formItem;
  if (children) {
    const newFormItemProps: FormItemProps & { children: any } = { ...initNewFormItemProps };
    if (fieldName) {
      // eslint-disable-next-line no-param-reassign
      newFormItemProps.label = fieldName;
    }
    if (helpMessage) {
      newFormItemProps.label = (
        <>
          {newFormItemProps.label || formItem.props.label}
          <Tooltip title={helpMessage}>
            <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
          </Tooltip>
        </>
      );
    }
    if (isArray(children)) {
      const newChildren: any[] = [];
      for (let i = 0; i < children.length; i++) {
        if (isNil(children[i])) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const newFieldProps = mergeFormItemIndividual(children[i].props, fieldConfig);
        // 根据props是否存在判断该节点是否为react节点
        if (children[i].props) {
          newChildren.push(cloneElement(children[i], newFieldProps));
        } else {
          newChildren.push(children[i]);
        }
      }
      newFormItemProps.children = newChildren;
      newNode = cloneElement(formItem, newFormItemProps);
    } else {
      const newFieldProps = mergeFormItemIndividual(children.props, fieldConfig);
      newFormItemProps.children = children.props ? cloneElement(children, newFieldProps) : children;
      newNode = cloneElement(formItem, newFormItemProps);
    }
  }
  return newNode;
}

// 表格个性化需要用返回值确定原render是否为一个输入组件
function mergeFormItemIndividual(props, fieldConfig: FieldConfig) {
  const {
    rules,
    lovMappings = [],
    form,
    editable,
    defaultValue,
    // paramList = [],
    queryParams,
    numberPrecision,
    defaultValueMeaning,
    dataSource = {},
    fieldType,
    multipleFlag,
    placeholder,
    textAreaMaxLine,
    numberMax,
    numberMin,
    dateFormat,
    lovCode,
    supplementZero,
    trimFlag
  } = fieldConfig;
  const newRulesCollection: any = { others: [], required: false, max: false, min: false };
  const newProps: any = {
    ...props,
  };
  if (props && props['data-__meta']) {
    const dataMeta = props['data-__meta'];
    const dataField = props['data-__field'];
    let uploadRule = false;
    const { rules: oldRules = [], name } = dataMeta;
    if (!isEmpty(rules)) {
      oldRules.forEach(k => {
        if (k.required !== undefined) {
          newRulesCollection.required = k;
        } else if (k.max !== undefined) {
          newRulesCollection.max = k;
        } else if (k.min !== undefined) {
          newRulesCollection.min = k;
        } else if (k.isUpload) {
          uploadRule = k.customize ? false : k;
        } else {
          newRulesCollection.others.push(k);
        }
      });
      rules.forEach(k => {
        if (k.required !== undefined) {
          newRulesCollection.required = k;
        } else if (k.max !== undefined) {
          newRulesCollection.max = k;
        } else if (k.isUpload) {
          uploadRule = k;
        } else if (k.min !== undefined) {
          newRulesCollection.min = k;
        } else {
          newRulesCollection.others.push(k);
        }
      });
      const { required, max, min, others } = newRulesCollection;
      const newRules = [required, max, min, uploadRule, ...others].filter(Boolean);
      newProps['data-__meta'].rules = newRules;
      newProps['data-__meta'].validate = [
        {
          rules: newRules,
          trigger: ['onChange'],
        },
      ];
    }
    if (lovMappings.length > 0) {
      const oldOnChange = props.onChange;
      newProps.onChange = (val, record, ...others) => {
        const newFields = lovMappings.reduce(
          (prev, cur) => ({
            ...prev,
            [cur.targetCode]: record[cur.sourceCode],
          }),
          {}
        );
        form.setFieldsValue(newFields);
        // eslint-disable-next-line no-unused-expressions
        oldOnChange && oldOnChange(val, record, ...others);
      };
    }
    if (!isNil(defaultValue) && isUndefined(dataSource[name])) {
      dataMeta.initialValue = defaultValue;
      if (!dataField.touched && !('value' in dataField)) {
        // 如有问题，去掉dataField.value的赋值
        newProps.value = defaultValue;
      }
      if (fieldType === 'LOV' && (dataField.value === defaultValue || !('value' in dataField))) {
        if (multipleFlag === 1) {
          newProps.translateData = defaultValueMeaning;
        } else {
          // !!textField && (newProps.textField = textField);
          newProps.textValue = isNil(defaultValueMeaning) ? defaultValue : defaultValueMeaning;
        }
      }
    }
    if (queryParams) {
      newProps.queryParams = { ...newProps.queryParams, ...queryParams };
    }
    if (typeof placeholder === 'string' && placeholder !== '') {
      newProps.placeholder = placeholder;
    }
    // eslint-disable-next-line no-unused-expressions
    editable !== -1 && !isNil(editable) && (newProps.disabled = !editable);
    /** 未列出的组件类型即是不推荐修改的 */
    if (fieldType === 'INPUT') {
      if (!isNil(trimFlag) && trimFlag !== -1) {
        newProps.trim = trimFlag !== 1;
        newProps.trimAll = trimFlag === 1;
      }
    } else if (fieldType === 'TEXT_AREA') {
      textAreaMaxLine !== undefined && (newProps.rows = textAreaMaxLine);
    } else if (fieldType === 'INPUT_NUMBER') {
      numberPrecision !== undefined && (newProps.precision = numberPrecision);
      numberMax !== undefined && (newProps.max = Number(numberMax));
      numberMin !== undefined && (newProps.min = Number(numberMin));
      newProps.padDecimalZeros = isNil(supplementZero) || supplementZero === 1;
    } else if (fieldType === 'DATE_PICKER') {
      dateFormat !== undefined && (newProps.format = dateFormat);
    } else if (fieldType === 'LOV') {
      lovCode !== undefined && (newProps.code = lovCode);
    }
  }
  return newProps;
}

export function coverConfig(originConfig, conditions: ConditionHeaderDTO[] = [], config) {
  const newConfig = originConfig;
  conditions.forEach(i => {
    let { conExpression = '' } = i;
    if (conExpression !== '') {
      const isErr = isErrConExpression(conExpression);
      if (!isErr) {
        const conNoReg = /(\d+)/g;
        const result = calculateExpression(i.lines || [], config);
        if ((i.lines || []).length > 0) {
          conExpression = conExpression.replace(conNoReg, (_, m) => result[m] || false);
          conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
          // eslint-disable-next-line no-new-func
          newConfig[i.conType] = new Function(`return ${conExpression};`)() ? 1 : 0;
        }
      }
    }
  });
  return newConfig;
}

function isErrConExpression(exp) {
  const leftBracketNum = (exp.match(/\(/g) || []).length;
  const rightBracketNum = (exp.match(/\)/g) || []).length;
  const ruleConNo = /\s*\d+\s+\d+\s*/g.test(exp);
  const ruleConLogic = /\s*(AND|OR|and|or)\s*(AND|OR|and|or)\s*/g.test(exp);
  const illegalChar = /^(?!AND|OR|and|or|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

function calculateExpression(
  conditionList,
  { getValueFromCache, isGrid, code, isGridVisible, targetForm, targetDataSource }
) {
  const result = {};
  conditionList.forEach(i => {
    const {
      conCode,
      sourceFieldCode = '',
      sourceUnitCode,
      conExpression,
      targetType,
      targetFieldCode = '',
      targetValue,
    } = i;
    if (!sourceUnitCode || !sourceFieldCode) return result;
    if (isGridVisible && (code === sourceUnitCode || targetType === 'formNow')) {
      result[conCode] = true;
      return result;
    }
    let left;
    let right = targetValue;
    const targetAllValue = {
      ...targetDataSource,
      ...(targetForm ? targetForm.getFieldsValue() : {}),
    };
    if (isGrid && code === sourceUnitCode) {
      left = targetAllValue[sourceFieldCode];
    } else {
      left = getValueFromCache(sourceUnitCode, sourceFieldCode);
    }
    if (isGrid && targetType === 'formNow') {
      if (!targetFieldCode) return result;
      right = targetAllValue[targetFieldCode];
    } else if (targetType === 'formNow') {
      right = getValueFromCache(code, targetFieldCode);
    }
    result[conCode] = logicCompute(conExpression, left, right);
  });
  return result;
}

export function getContextParams(paramList: ParamList[] | never[] = [], options?: any) {
  const { getValueFromCache = () => {}, isGrid, targetForm, targetDataSource, isConfig, code } =
    options || {};
  const paramObj = {};
  const { search } = window.location;
  const urlParams = {};
  if (search) {
    search
      .substr(1)
      .split('&')
      .forEach(item => {
        if (item) {
          const [key, value] = item.split('=');
          urlParams[key] = value;
        }
      });
  }
  const c = getContext();
  paramList.forEach(item => {
    if (item.paramType === 'context') {
      switch (item.paramValue) {
        case 'organizationId':
          paramObj[item.paramKey] = c.organizationId;
          break;
        case 'tenantId':
          paramObj[item.paramKey] = c.tenantId;
          break;
        default:
      }
    } else if (item.paramType === 'url') {
      paramObj[item.paramKey] = urlParams[item.paramKey];
    } else if (item.paramType === 'fixed') {
      paramObj[item.paramKey] = item.paramValue;
    } else if (!isConfig) {
      // eslint-disable-next-line prefer-const
      let value = getValueFromCache(item.paramUnitCode, item.paramFieldCode);
      if (isGrid && code === item.paramUnitCode) {
        value = { ...targetDataSource, ...(targetForm ? targetForm.getFieldsValue() : {}) }[
          item.paramFieldCode || ''
        ];
      }
      paramObj[item.paramKey] = value;
    }
  });
  return paramObj;
}

function logicCompute(type, left, right) {
  if (math.isBigNumber(left) || math.isBigNumber(right)) {
    switch (type) {
      case '=':
        return math.eq(left, right);
      case '>=':
        return math.gte(left, right);
      case '<=':
        return math.lte(left, right);
      case '!=':
        return !math.eq(left, right);
      case '>':
        return math.gt(left, right);
      case '<':
        return math.lt(left, right);
      default:
        return false;
    }
  }
  switch (type) {
    case '=':
      return left == right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '!=':
      return left != right;
    case '>':
      return left > right;
    case '<':
      return left < right;
    case 'ISNULL':
      return left === undefined || left === null;
    case 'NOTNULL':
      return left !== undefined && left !== null;
    case 'BEFORE':
      return moment(left).isBefore(moment(right));
    case 'SAME':
      return moment(left).isSame(moment(right));
    case 'NOTSAME':
      return !moment(left).isSame(moment(right));
    case 'AFTER':
      return moment(left).isAfter(moment(right));
    case '~BEFORE':
      return !moment(left).isBefore(moment(right));
    case '~AFTER':
      return !moment(left).isAfter(moment(right));
    case 'LIKE':
      return new RegExp(right, 'g').test(String(left));
    case 'UNLIKE':
      return !new RegExp(right, 'g').test(String(left));
    case '~LIKE':
      return new RegExp(left, 'g').test(String(right));
    case '~UNLIKE':
      return !new RegExp(left, 'g').test(String(right));
    default:
      return false;
  }
}

export function getFieldValueObject(relatedList: UnitAlias[] = [], getCache, code) {
  const obj = {
    c: getContext(),
  };
  relatedList.forEach(({ unitCode, alias }) => {
    const newAlias = unitCode === code ? 'self' : alias;
    const { form, dataSource } = getCache(unitCode);
    obj[newAlias] = { ...dataSource, ...(form && form.getFieldsValue()) };
  });
  return obj;
}

export function getComputeComp(renderRule, options: any) {
  const { wrapProps, unitData = {}, isGrid, form, dataSource } = options;
  if (isGrid) {
    // eslint-disable-next-line no-param-reassign
    unitData.self = { ...dataSource, ...(form && form.getFieldsValue()) };
    return <span dangerouslySetInnerHTML={{ __html: template.render_old(renderRule, unitData) }} />;
  }
  return (
    <FormItem {...wrapProps}>
      {/* eslint-disable-next-line react/no-danger */}
      <span dangerouslySetInnerHTML={{ __html: template.render_old(renderRule, unitData) }} />
    </FormItem>
  );
}

export function getContext() {
  return {
    organizationId: getCurrentOrganizationId(),
    tenantId: getUserOrganizationId(),
  };
}

export function selfValidator(conValid: ConValid | undefined, config) {
  let { conLineList = [], conValidList = [] } = conValid || {};
  conLineList = isArray(conLineList) ? conLineList : [];
  conValidList = isArray(conValidList) ? conValidList : [];
  const result = calculateExpression(conLineList, config);
  let key = '';
  const errors: any[] = [];
  conValidList.forEach(i => {
    let newExpression = i.conExpression || '';
    const isErr = isErrConExpression(newExpression);
    if (!isErr) {
      const conNoReg = /(\d+)/g;
      newExpression = newExpression.replace(conNoReg, (_, m) => result[m] || false);
      newExpression = newExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
      // eslint-disable-next-line no-new-func
      const isCorrect = new Function(`try {return ${newExpression};}catch(e){console.error(e)}`)();
      key = `${key}${isCorrect}`;
      if (!isCorrect) {
        const error = new Error(i.errorMessage || 'default');
        error.name = 'customize';
        errors.push(error);
      }
    }
  });
  return errors;
}

export function defaultValueFx(config, fieldConfig: FieldConfig) {
  let { conLineList = [], conValidList = [] } = fieldConfig.defaultValueConDTO || {};
  conLineList = isArray(conLineList) ? conLineList : [];
  conValidList = isArray(conValidList) ? conValidList : [];
  const result = calculateExpression(conLineList, config);
  for (let i = 0; i < conValidList.length; i++) {
    const condition: any = conValidList[i];
    let { conExpression = '' } = condition;
    const isErr = isErrConExpression(conExpression);
    if (!isErr) {
      const conNoReg = /(\d+)/g;
      conExpression = conExpression.replace(conNoReg, (_, m) => result[m] || false);
      conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
      // eslint-disable-next-line no-new-func
      if (new Function(`return ${conExpression};`)()) {
        const { value: defaultValue, valueMeaning: defaultValueMeaning } = condition;
        return { defaultValue, defaultValueMeaning };
      }
    }
  }
  const { defaultValue, defaultValueMeaning } = fieldConfig;
  return { defaultValue, defaultValueMeaning };
}
