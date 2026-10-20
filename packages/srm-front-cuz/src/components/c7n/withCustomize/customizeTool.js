/* eslint-disable react/display-name */
/* eslint-disable no-new-func */
/* eslint-disable eqeqeq */
import React from 'react';
import request from 'utils/request';
import moment from "moment";
import {
  getCurrentOrganizationId,
  getResponse,
  getUserOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import {
  TextField,
  NumberField,
  Switch,
  Select,
  CheckBox,
  TextArea,
  Lov,
  // Upload,
  DatePicker,
} from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import Upload from 'srm-front-boot/lib/components/C7NUpload';
import { isArray, isNil } from 'lodash';
import intl from 'utils/intl';
import { FlexLink, FlexIntlField } from './FlexComponents';
import { FieldTrim } from 'choerodon-ui/dataset/data-set/enum';

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

export async function fetchFileList(uuid, name, record) {
  const err = intl.get('hzero.common.message.confirm.attachment.atLeast');
  const stateFileList = record.state[`__${name}__`] || [];
  if (uuid && (!record.getField(name).get('required') || stateFileList.length > 0)) {
    return true;
  }
  return err || '附件为必传项，请至少上传一个附件！';
}

/**
 * 处理组件的特有配置
 * @param contentProps
 */
export function parseProps(props = {}, tools, oldConfig = {}, others = {}) {
  const {
    numberMax,
    numberMin,
    numberPrecision,
    supplementZero,
    fieldType,
    textMaxLength,
    textMinLength,
    defaultValue,
    defaultValueMeaning,
    paramList,
    fieldName,
    lovCode,
    lovInfo,
    bucketName,
    bucketDirectory,
    templateUUID,
    dateFormat,
    multipleFlag,
    uploadShowFlag,
    uploadRecordFlag,
    trimFlag,
  } = props;

  const { viewOnly } = others;
  const extraProps = {
    maxLength: textMaxLength,
    minLength: textMinLength,
    max: isNil(numberMax) ? undefined : Number(numberMax),
    min: isNil(numberMin) ? undefined : Number(numberMin),
    defaultValue: preAdapterInitValue(fieldType, defaultValue),
    trim: trimFlag === 1 ? FieldTrim.ALL : FieldTrim.both,
  };

  if (fieldType !== undefined) {
    extraProps.type = getComponentType(fieldType);
  }
  if (fieldType === 'INPUT_NUMBER') {
    extraProps.step = typeof numberPrecision === 'number' ? 1 / 10 ** numberPrecision : undefined;
    extraProps.padDecimalZeros = isNil(supplementZero) || supplementZero === 1;
  }
  if (fieldType === 'LOV') {
    extraProps.multiple = multipleFlag === undefined ? undefined : multipleFlag === 1;
    extraProps.lovPara = { ...oldConfig.lovPara, ...getContextParams(paramList, tools) };
    extraProps.lovCode = lovCode || oldConfig.lovCode;
    if (lovInfo && defaultValue) {
      extraProps.defaultValue = {
        [lovInfo.valueField]: defaultValue,
        [lovInfo.displayField]: defaultValueMeaning,
      };
    }
  }
  if (fieldType === 'SELECT') {
    extraProps.multiple = multipleFlag === undefined ? undefined : multipleFlag === 1;
    extraProps.lovPara = { ...oldConfig.lovPara, ...getContextParams(paramList, tools) };
    extraProps.lookupCode = lovCode || oldConfig.lookupCode;
  }
  if (fieldType === 'UPLOAD') {
    extraProps.viewOnly = viewOnly;
    extraProps.btnText = fieldName;
    extraProps.isMultiple = true;
    extraProps.bucketName = bucketName;
    extraProps.bucjetDirectory = bucketDirectory;
    extraProps.uploadShowFlag = uploadShowFlag;
    extraProps.uploadRecordFlag = uploadRecordFlag;
    // 模版uuid功能个性化暂不配置，如有需要，再添加对应配置项
    extraProps.templateUUID = templateUUID;
    extraProps.hasTemplate = !!templateUUID;
  }
  if (fieldType === 'DATE_PICKER') {
    extraProps.format = dateFormat && dateFormat.replace(/hh/, 'HH');
    extraProps.type = /hh|mm|ss|HH/g.test(dateFormat) ? 'dateTime' : 'date';
  }
  return {
    ...oldConfig,
    ...filterNullValueObject(extraProps),
  };
}

export function transformCompProps(props = {}) {
  const {
    fieldCode,
    fieldType,
    linkTitle,
    dateFormat,
    linkHref,
    linkNewWindow,
    editable,
    placeholder,
    textAreaMaxLine,
    linkType,
    modalWidth,
    record,
    dataSet,
    helpMessage,
    enableHelp = true,
    // uploadAccept = [],
    // bucketName,
    // bucketDirectory,
  } = props;
  const commonProps = { placeholder };
  if (helpMessage && enableHelp) {
    commonProps.help = helpMessage;
    commonProps.showHelp = 'tooltip';
  }
  if (fieldType === 'LINK') {
    return {
      ...commonProps,
      name: fieldCode,
      dataSet,
      record,
      linkTitle,
      linkHref,
      linkNewWindow,
      linkType,
      modalWidth,
      disabled: !editable,
    };
  }
  if (fieldType === 'UPLOAD') {
    return { ...commonProps, name: fieldCode, dataSet, record };
  }
  if (fieldType === 'TEXT_AREA') {
    return {
      rows: textAreaMaxLine,
    };
  }
  if (fieldType === 'DATE_PICKER') {
    return {
      mode: /hh|mm|ss|HH/g.test(dateFormat) ? 'dateTime' : 'date',
    };
  }
  if (editable !== -1) {
    commonProps.disabled = !editable;
  }
  return commonProps;
}

/**
 * 根据类型参数生成不同的表单组件
 * @param type 组件类型
 */
export function getComponent(type, extra) {
  let Component = null;
  switch (type) {
    case 'EMPTY':
      Component = () => <div />;
      break;
    case 'INPUT':
      Component = props => <TextField {...props} />;
      break;
    case 'INPUT_NUMBER':
      Component = props => <NumberField {...props} />;
      break;
    case 'SELECT':
      Component = props => <Select {...props} />;
      break;
    // case 'RADIO_GROUP':
    //   Component = props => <FlexRadioGroup {...props} />;
    //   break;
    case 'CHECKBOX':
      Component = props => <CheckBox {...props} unCheckedValue={0} checkedValue={1} />;
      break;
    case 'SWITCH':
      Component = props => <Switch {...props} unCheckedValue={0} checkedValue={1} />;
      break;
    case 'LOV':
      Component = props => <Lov {...props} />;
      break;
    case 'DATE_PICKER':
      Component = props => <DatePicker {...props} />;
      break;
    case 'UPLOAD':
      Component = props => <Upload {...props} />;
      break;
    case 'TL_EDITOR':
      Component = FlexIntlField;
      break;
    case 'TEXT_AREA':
      Component = props => <TextArea {...props} />;
      break;
    case 'LINK':
      Component = props => <FlexLink {...props} extra={extra} />;
      break;
    default:
      Component = props => <TextField {...props} />;
  }
  return options => Component(options, extra);
}

/**
 * 根据类型参数生成不同的表单组件
 * 字段类型，可选值：boolean number string date dateTime time week month year email url intl object
 * @param type 组件类型
 */
export function getComponentType(type) {
  switch (type) {
    case 'LINK':
    case 'INPUT':
      return 'string';
    case 'INPUT_NUMBER':
      return 'number';
    case 'SELECT':
      return 'string';
    case 'CHECKBOX':
    case 'SWITCH':
      return 'boolean';
    case 'LOV':
      return 'object';
    case 'DATE_PICKER':
      return 'date';
    case 'UPLOAD':
      return 'string';
    case 'TL_EDITOR':
      return 'intl';
    default:
  }
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

// 查询用户个性化配置数据
export async function queryUserCustConfig(query) {
  return getResponse(
    await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/user-ui`, {
      query,
    })
  );
}

// 保存用户个性化配置数据
export async function saveUserCustConfig(params) {
  return getResponse(
    await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/user-ui`, {
      method: 'POST',
      body: params,
    })
  );
}

export function coverConfig(conditions = [], config, ignore = []) {
  const newConfig = {};
  conditions.forEach(i => {
    let { conExpression = '' } = i;
    if (conExpression !== '') {
      const isErr = isErrConExpression(conExpression);
      if (!isErr && !ignore.includes(i.conType)) {
        const conNoList = conExpression.match(/\s?\d+\s?/g);
        const result = calculateExpression(i.lines || [], config);
        if ((i.lines || []).length > 0) {
          conNoList.forEach(k => {
            const newKey = k.trim();
            conExpression = conExpression.replace(newKey, result[newKey] || false);
          });
          conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
          // eslint-disable-next-line no-eval
          newConfig[i.conType] = eval(conExpression) ? 1 : 0;
        }
      }
    }
  });
  return newConfig;
}

function isErrConExpression(exp) {
  const leftBracketNum = exp.match(/\(/g) || [].length;
  const rightBracketNum = exp.match(/\)/g) || [].length;
  const ruleConNo = /\s*\d+\s+\d+\s*/g.test(exp);
  const ruleConLogic = /\s*(AND|OR|and|or)\s*(AND|OR|and|or)\s*/g.test(exp);
  const illegalChar = /^(?!AND|OR|and|or|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

function calculateExpression(conditionList, tools = {}) {
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
    const sourceUnitType = tools.getCacheType(sourceUnitCode);
    if (!sourceUnitCode || !sourceUnitType) return result;
    const left = getFieldValueByCode(sourceUnitCode, sourceFieldCode, tools);
    let right = targetValue;
    if (targetType === 'formNow') {
      right = getFieldValueByCode(tools.code, targetFieldCode, tools);
    }
    result[conCode] = logicCompute(conExpression, left, right);
  });
  return result;
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
    case 'AFTER':
      return moment(left).isAfter(moment(right));
    case 'SAME':
      return moment(left).isSame(moment(right));
    case 'NOTSAME':
      return !moment(left).isSame(moment(right));
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

export function getContextParams(paramList = [], { isConfig, ...others } = {}) {
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
      paramObj[item.paramKey] = getFieldValueByCode(
        item.paramUnitCode,
        item.paramFieldCode,
        others
      );
    }
  });
  return paramObj;
}

// 还原用户个性化配置数据
export async function resetUserCustConfig(params) {
  return getResponse(
    await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/user-ui`, {
      method: 'DELETE',
      query: params,
    })
  );
}

export function getContext() {
  return {
    organizationId: getCurrentOrganizationId(),
    tenantId: getUserOrganizationId(),
  };
}

export function getFieldValueObject(relatedList = [], tools = {}, code) {
  const obj = {
    c: getContext(),
  };
  relatedList.forEach(({ unitCode, alias }) => {
    const newAlias = unitCode === code ? 'self' : alias;
    obj[newAlias] = getUnitDataByCode(unitCode, tools);
  });
  return obj;
}

function getFieldValueByCode(
  unitCode,
  fieldCode,
  { getArrayDataValue, getDataValue, getCacheType, index } = {}
) {
  const unitType = getCacheType(unitCode);
  switch (unitType) {
    case 'form':
      return getDataValue(unitCode)[fieldCode];
    case 'table':
      return getArrayDataValue(unitCode, index)[fieldCode];
    default:
  }
}

function getUnitDataByCode(
  unitCode,
  { getArrayDataValue, getDataValue, getCacheType, index } = {}
) {
  const unitType = getCacheType(unitCode);
  switch (unitType) {
    case 'form':
      return getDataValue(unitCode);
    case 'table':
      return getArrayDataValue(unitCode, index);
    default:
      return {};
  }
}

export function selfValidator(conValid = {}, config) {
  let { conLineList = [], conValidList = [] } = conValid;
  conLineList = isArray(conLineList) ? conLineList : [];
  conValidList = isArray(conValidList) ? conValidList : [];
  const result = calculateExpression(conLineList, config);
  const validation = [];
  conValidList.forEach(i => {
    let newExpression = i.conExpression;
    const isErr = isErrConExpression(newExpression);
    if (!isErr) {
      const conNoReg = /(\d+)/g;
      newExpression = newExpression.replace(conNoReg, (_, m) => result[m] || false);
      newExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
      // eslint-disable-next-line no-new-func
      validation.push({
        // eslint-disable-next-line no-new-func
        isCorrect: new Function(`try {return ${newExpression};}catch(e){console.error(e)}`)(),
        message: i.errorMessage,
      });
    }
  });
  for (let k = 0; k < validation.length; k += 1) {
    if (!validation[k].isCorrect) {
      // eslint-disable-next-line no-useless-return
      return validation[k].message;
    }
  }
}

export function defaultValueFx(config, fieldConfig) {
  let { conLineList = [], conValidList = [] } = fieldConfig.defaultValueConDTO || {};
  conLineList = isArray(conLineList) ? conLineList : [];
  conValidList = isArray(conValidList) ? conValidList : [];
  const result = calculateExpression(conLineList, config);
  for (let i = 0; i < conValidList.length; i++) {
    const condition = conValidList[i];
    let { conExpression = '' } = condition;
    const isErr = isErrConExpression(conExpression);
    if (!isErr) {
      const conNoReg = /(\d+)/g;
      conExpression = conExpression.replace(conNoReg, (_, m) => result[m] || false);
      conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!new Function(`return ${conExpression};`)()) {
        const { value: defaultValue, valueMeaning: defaultValueMeaning } = condition;
        return { defaultValue, defaultValueMeaning };
      }
    }
  }
  const { defaultValue, defaultValueMeaning } = fieldConfig;
  return { defaultValue, defaultValueMeaning };
}
