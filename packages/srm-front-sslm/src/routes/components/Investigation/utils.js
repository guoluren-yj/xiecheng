/*
 * @Date: 2022-06-09 14:25:33
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { useState, useCallback } from 'react';
import {
  forEach,
  isFunction,
  isString,
  startsWith,
  get,
  isObject,
  isArray,
  isUndefined,
  isNil,
  isPlainObject,
  isEmpty,
  camelCase,
  divide,
  round,
  toString,
} from 'lodash';
import {
  TextField,
  TextArea,
  CheckBox,
  Select,
  DatePicker,
  DateTimePicker,
  IntlField,
  Switch,
  Lov,
  NumberField,
  Attachment,
  DataSet,
} from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { reaction, runInAction } from 'mobx';

const organizationId = getCurrentOrganizationId();
const contextPrefix = 'this.';

// 整合state
export const useSetState = initialState => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    newState => {
      set(prevState => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

// 属性映射，转化为c7n属性
export const attributeMapping = {
  fileMaxNum: 'max',
};

// 获取ds的type类型
export const getDataSetType = (componentType, fieldCode) => {
  switch (componentType) {
    case 'Lov':
    case 'TransferLov': // 多选lov
      return 'object';
    case 'Upload':
      // 处理资质附件
      if (fieldCode === 'attachment') {
        return 'string';
      } else {
        return 'attachment';
      }
    case 'Switch':
    case 'Checkbox':
      return 'boolean';
    case 'InputNumber':
      return 'number';
    case 'DateTimePicker':
      return 'dateTime';
    case 'DatePicker':
      return 'date';
    case 'TLEditor':
      return 'intl';
    default:
      return 'string';
  }
};

// 获取组件类型
export const getComponentType = componentType => {
  switch (componentType) {
    case 'ValueList':
      return Select;
    case 'TextArea':
      return TextArea;
    case 'Checkbox':
      return CheckBox;
    case 'DatePicker':
      return DatePicker;
    case 'DateTimePicker':
      return DateTimePicker;
    case 'TLEditor':
      return IntlField;
    case 'Switch':
      return Switch;
    case 'Lov':
    case 'TransferLov': // 多选lov
      return Lov;
    case 'InputNumber':
      return NumberField;
    case 'Upload':
      return Attachment;
    default:
      return TextField;
  }
};

// 处理调查表组件属性中的配置
export const commonDealForProps = (config = {}, context) => {
  const { props, componentType } = config;
  const attributeObj = {};
  const contextProps = {};
  forEach(props, prop => {
    let dealProp = prop.attributeValue;
    const defaultValueMeaning = prop.attributeValueMeaning;
    if (isString(dealProp) && startsWith(dealProp, contextPrefix)) {
      const attributePath = dealProp.substr(5);
      dealProp = undefined;
      Object.defineProperty(contextProps, prop.attributeName, {
        get: () => get(context, attributePath),
        enumerable: true,
      });
    }
    // 附件过滤multiple属性，ds不支持multiple属性，要支持fileMaxNum配置，multiple需为true
    const fileMultipleFlag = componentType === 'Upload' && prop.attributeName === 'multiple';
    if (dealProp !== undefined && !fileMultipleFlag) {
      const mappingKey = attributeMapping[prop.attributeName];
      if (mappingKey) {
        attributeObj[mappingKey] = dealProp;
      }
      attributeObj[prop.attributeName] = dealProp;
    }
    if (defaultValueMeaning) {
      attributeObj.defaultValueMeaning = defaultValueMeaning;
    }
  });
  const allProps = { ...attributeObj, ...contextProps };
  // 过滤onClear，onChange等属性属性值不是函数
  const attributeKeys = Object.keys(allProps);
  (attributeKeys || []).forEach(item => {
    if (item === 'onChange' || item === 'onClear') {
      if (!isFunction(allProps[item])) {
        delete allProps[item];
      }
    }
  });
  return allProps;
};

// 处理reserve1-10以外的拓展字段文本类型长读限制
const handleReserveLength = fieldCode => {
  if (
    fieldCode &&
    fieldCode.startsWith('reserve') &&
    fieldCode.length > 8 &&
    fieldCode !== 'reserve10'
  ) {
    return true;
  }
  return false;
};

// checkbox组件额外属性
const getCheckboxProps = ({ configProps, column }) => {
  const { defaultValue = 0 } = configProps;
  const { configName, fieldCode } = column;
  const formatConfigName = camelCase(configName);
  const formatFieldCode = camelCase(fieldCode);
  const finalValue = !isNil(defaultValue) ? +defaultValue : 0;
  return (formatConfigName === 'sslmInvestgBankAccount' && formatFieldCode === 'mainAccountFlag') ||
    (formatConfigName === 'sslmInvestgContact' && formatFieldCode === 'defaultContactFlag')
    ? {
        trueValue: 1,
        falseValue: 0,
        computedProps: {
          defaultValue: ({ dataSet }) => (isEmpty(dataSet.toData()) ? 1 : 0),
        },
        renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
      }
    : {
        trueValue: 1,
        falseValue: 0,
        defaultValue: finalValue,
        renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
      };
};

// 日期组件额外属性
const getDatePickerProps = ({ column }) => {
  const { fieldCode, configName } = column;
  const formatConfigName = camelCase(configName);
  let computedProps = {};
  // 勾选长期，文件到期日不可编辑，放在最后即使配了fx也不生效
  if (
    fieldCode === 'expirationDate' &&
    ['sslmInvestgAuth', 'sslmInvestgAttachment'].includes(formatConfigName)
  ) {
    computedProps = {
      disabled: ({ record }) => {
        const disabledFlag = !!record.get('longEffectiveFlag');
        return disabledFlag;
      },
      min: ({ record }) => {
        if (record.get('lastUploadDate')) {
          return 'lastUploadDate';
        } else {
          return null;
        }
      },
    };
  }
  return {
    format: 'YYYY-MM-DD',
    computedProps,
  };
};

// 日期时间组件额外属性
const getDateTimePickerProps = () => {
  return {
    format: 'YYYY-MM-DD HH:mm:ss',
  };
};

// lov组件额外属性
const getLovProps = ({ configProps, dataSet }) => {
  const { onChange, extSetMap } = configProps;
  return {
    onChange: lovRecord => {
      if (isFunction(onChange)) {
        onChange({ extSetMap, record: dataSet?.current, lovRecord });
      }
    },
  };
};

// lov多选组件额外属性
const getTransferLovProps = () => ({
  multiple: true,
});

// 数字框组件额外属性
const getInputNumberProps = ({ configProps }) => {
  const { allowThousandth, ...rest } = configProps;
  return {
    numberGrouping: !!allowThousandth,
    ...rest,
  };
};

// 开关组件额外属性
const getSwitchProps = ({ configProps, column }) => {
  const { defaultValue = 0 } = configProps;
  const { configName, fieldCode } = column;
  const formatConfigName = camelCase(configName);
  const formatFieldCode = camelCase(fieldCode);
  let finalValue = !isNil(defaultValue) ? +defaultValue : 0;
  if (
    (formatConfigName === 'sslmInvestgBankAccount' && formatFieldCode === 'enabledFlag') ||
    (formatConfigName === 'sslmInvestgContact' && formatFieldCode === 'enabled')
  ) {
    finalValue = 1;
  }
  return {
    trueValue: 1,
    falseValue: 0,
    defaultValue: finalValue,
    // Output组件渲染
    renderer: ({ value }) => yesOrNoRender(value),
  };
};

// 多行文本组件额外属性
const getTextAreaProps = ({ column }) => {
  const props = {
    newLine: true,
  };
  const maxLengthFlag = handleReserveLength(column.fieldCode);
  if (maxLengthFlag) {
    props.maxLength = 100;
  }
  return props;
};

// 输入框组件额外属性
const getInputProps = ({ column }) => {
  const { fieldCode, renderer } = column;
  const props = {};
  const maxLengthFlag = handleReserveLength(fieldCode);
  if (maxLengthFlag) {
    props.maxLength = 100;
  }
  if (renderer) {
    props.renderer = renderer;
  }
  return props;
};

// 下拉框组件额外属性
const getValueListProps = () => {};

// 附件上传组件额外属性
const getUploadProps = ({ configProps, column }) => {
  const { templateAttachmentUUID, viewOnly, hasTemplate = true, ...rest } = configProps;
  let template = {};
  if (hasTemplate) {
    template = {
      attachmentUUID: templateAttachmentUUID,
      bucketName: PRIVATE_BUCKET,
    };
  }
  return {
    viewMode: 'popup',
    template,
    readOnly: viewOnly,
    ...rest,
    crossTenant: true,
    bucketDirectory: 'sslm-lifecycle',
    // 附件组件没有disabled 状态，把逻辑合并到 readOnly 属性上
    computedProps: {
      disabled: () => false,
      readOnly: ({ record }) => handleDisabled({ record, line: column }) || viewOnly,
    },
  };
};

// 多语言组件额外属性
const getTLEditorProps = () => {};

// 获取公共属性
const getCommonProps = ({ configProps, column }) => {
  const { colspan } = column;
  const commonProps = {
    ...configProps,
    colSpan: colspan,
  };
  return commonProps;
};

export const propUtils = {
  Checkbox: getCheckboxProps,
  DatePicker: getDatePickerProps,
  DateTimePicker: getDateTimePickerProps,
  Lov: getLovProps,
  TransferLov: getTransferLovProps,
  InputNumber: getInputNumberProps,
  Switch: getSwitchProps,
  TextArea: getTextAreaProps,
  Input: getInputProps,
  ValueList: getValueListProps,
  Upload: getUploadProps,
  TLEditor: getTLEditorProps,
};

// 获取组件属性
export const getComponentProps = (componentType, column, context, dataSet) => {
  const propFunc = propUtils[componentType];
  const configProps = commonDealForProps(column, context);
  const commonProps = getCommonProps({ configProps, column });
  let componentProps = getInputProps({ configProps, column });
  if (isFunction(propFunc)) {
    componentProps = propFunc({ configProps, column, dataSet });
  }
  return { ...commonProps, ...componentProps };
};

// 处理必输
export const handleRequired = ({ record, line, lines = [] }) => {
  const { requiredFlag, fieldCode, fxProps, configName } = line;
  const formatConfigName = camelCase(configName);
  let required = Boolean(requiredFlag);
  let expirationDateRequired = !record.get('longEffectiveFlag');
  let longEffectiveFlagRequired = !record.get('expirationDate');
  let supplierAttFlag = required;
  // 附件页签和资质信息页签对于文件到期日必填逻辑不一样需要区分，src-8914
  // 附件信息-文件到期日必填逻辑是先取采购方预定义的行的供应商上传必填，没有配置再取模版的供应商上传必填配置有一个配置必填文件到期日就必填
  // 资质信息只按没勾选长期就必填
  // 1. 获取采购方模板定义的必填标识
  if (formatConfigName === 'sslmInvestgAttachment') {
    // 获取采购方预定义模版标识
    const purchaserTemptAttFlag = !!record.get('purchaserFlag');
    const purchaserTemptAttRequiredFlag = !!record.get('supplierAttFlag');
    // 获取调查表模版供应商上传必填配置
    const supplierAttachmentObj = (lines || []).find(
      item => item.fieldCode === 'supplierAttachmentUuid'
    );
    const { requiredFlag: supplierAttachmentRequiredFlag } = supplierAttachmentObj || {};
    supplierAttFlag = purchaserTemptAttFlag
      ? purchaserTemptAttRequiredFlag
      : !!supplierAttachmentRequiredFlag;
    // 附件必填文件到期日和长期有效必填一个
    expirationDateRequired = supplierAttFlag ? !record.get('longEffectiveFlag') : false;
    longEffectiveFlagRequired = supplierAttFlag ? !record.get('expirationDate') : false;
  }

  switch (fieldCode) {
    case 'expirationDate':
      // 供应商附件必填，则文件到期日和长期有效字段必填一个
      required = expirationDateRequired;
      break;
    case 'longEffectiveFlag':
      // 供应商附件必填，则文件到期日和长期有效字段必填一个
      required = longEffectiveFlagRequired;
      break;
    case 'stockSymbol':
    case 'ownershipStructureAtmUuid': {
      // 是否上市有值且为"是"，取模版必填配置，"否"则非必填
      const listedCompanyFlag = record.get('listedCompanyFlag');
      required = isNil(listedCompanyFlag)
        ? Boolean(requiredFlag)
        : listedCompanyFlag
        ? Boolean(requiredFlag)
        : false;
      break;
    }
    case 'purchaserAttachmentUuid':
      required = false;
      break;
    case 'supplierAttachmentUuid': {
      required = supplierAttFlag;
      break;
    }
    default:
      break;
  }
  // 处理fx属性
  const params = {
    record,
    config: {
      required,
      fieldProperty: fxProps,
    },
  };
  const { required: newRequiredFlag } = handleConditionConfig(params);
  return newRequiredFlag;
};

// 处理编辑
export const handleDisabled = ({ record, line }) => {
  const { editableFlag, fxProps } = line;
  const params = {
    record,
    config: {
      fieldProperty: fxProps || [],
      editable: !!editableFlag,
    },
  };
  const { disabled } = handleConditionConfig(params);
  return disabled;
};

// 处理正则
export const handlePattern = ({ record = {}, componentProps = {}, line = {} } = {}) => {
  const { pattern, patternCondition } = componentProps;
  let patternFlag = !!pattern;
  if (patternCondition) {
    const fieldConfig = patternCondition.split(':') || [];
    if (fieldConfig.length > 1) {
      const fieldName = fieldConfig[0]?.trim();
      const fieldValue = fieldConfig[1]?.trim();
      const flag = record.get(fieldName) === fieldValue;
      patternFlag = patternFlag && flag;
    }
  }
  if (patternFlag) {
    const { fxProps } = line;
    const params = {
      record,
      config: {
        fieldProperty: fxProps || [],
        pattern: patternFlag,
      },
    };
    const { pattern: newPatternFlag } = handleConditionConfig(params);
    return newPatternFlag;
  }
  return patternFlag;
};

// 处理条件配置渲染
function handleConditionConfig(params = {}) {
  const { record, config = {} } = params;
  const toolsObj = {
    record,
  };
  // 处理不含条件配置的必输和编辑配置
  const originConfig = {
    required: !!config.required,
    editable: !!config.editable,
    pattern: !!config.pattern,
  };
  // 处理fx配置
  const newConfig = handleInvestgConfig(originConfig, config.fieldProperty, toolsObj, true);
  const { required, editable, pattern } = newConfig;
  return { required: !!required, disabled: !editable, pattern: !!pattern };
}

// 获取级联参数
export const getCascadeParams = (componentProps, record) => {
  const params = {};
  const { parentRelationField = '', relationParamName = '' } = componentProps;
  if (parentRelationField && relationParamName) {
    const parentId = record.get(parentRelationField);
    params[relationParamName] = isArray(parentId) ? parentId.join(',') : parentId;
  }
  return params;
};

// 处理Lov默认值
export const handleLovDefaultValue = ({
  isMultiple = false,
  valueField,
  displayField,
  componentProps,
}) => {
  const { defaultValue, defaultValueMeaning } = componentProps;
  if (!isMultiple) {
    const defaultValueObj = {};
    if (valueField && defaultValue) {
      defaultValueObj[valueField] = defaultValue;
    }
    if (displayField && defaultValueMeaning) {
      defaultValueObj[displayField] = defaultValueMeaning;
    }
    return defaultValueObj;
  } else {
    const arr = [];
    if (isObject(defaultValueMeaning)) {
      for (const key in defaultValueMeaning) {
        if (Object.hasOwnProperty.call(defaultValueMeaning, key)) {
          const element = defaultValueMeaning[key];
          arr.push({
            [valueField]: key,
            [displayField]: element,
          });
        }
      }
    }
    return arr;
  }
};

// 处理下拉框默认值
export const handleValueListDefaultValue = ({ isMultiple, componentProps }) => {
  const { defaultValue } = componentProps;
  if (!isNil(defaultValue)) {
    if (isMultiple) {
      return defaultValue.split(',');
    } else {
      return defaultValue;
    }
  }
};

// 处理多选lov翻译取值问题
export const hanldeMultipleLovMeaning = ({
  record,
  fieldCode,
  valueField,
  displayField,
  defaultValue,
}) => {
  const fieldCodeMeaning = record[`${fieldCode}Meaning`];
  // 当后端接口返回当前字段是undefined时默认值生效
  const fieldCodeValue = (record || {})[fieldCode];
  let arr = [];
  if (isObject(fieldCodeMeaning)) {
    for (const key in fieldCodeMeaning) {
      if (Object.hasOwnProperty.call(fieldCodeMeaning, key)) {
        const element = fieldCodeMeaning[key];
        arr.push({
          [valueField]: key,
          [displayField]: element,
        });
      }
    }
  } else if (isUndefined(fieldCodeValue)) {
    if (!isEmpty(defaultValue)) {
      arr = defaultValue;
    }
  }
  return arr;
};

// 获取查询、删除url
export const getOperationUrl = (configName, type = 'query') => {
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      return 'investigate-basics';
    // 业务信息
    case 'sslmInvestgBusiness':
      return 'investigate-businesses';
    // 产品及服务
    case 'sslmInvestgProservice':
      return type === 'query' ? 'investigate-proservices/page' : 'investigate-proservices';
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      return 'investg-supplier-cates';
    // 近三年财务状况
    case 'sslmInvestgFin':
      return 'investigate-finances';
    // 分支机构
    case 'sslmInvestgFinBranch':
      return 'investigate-finances-branchs';
    // 资质信息
    case 'sslmInvestgAuth':
      return 'investigate-authes';
    // 联系人信息
    case 'sslmInvestgContact':
      return 'investigate-contacts';
    // 地址信息
    case 'sslmInvestgAddress':
      return 'investigate-addresses';
    // 开户行信息
    case 'sslmInvestgBankAccount':
      return 'investigate-bank-accounts';
    // 主要客户情况
    case 'sslmInvestgCustomer':
      return 'investigate-customers';
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      return 'investigate-sub-suppliers';
    // 设备信息
    case 'sslmInvestgEquipment':
      return 'investigate-equipments';
    // 研发能力
    case 'sslmInvestgRd':
      return 'investigate-rds';
    // 生产能力
    case 'sslmInvestgProduce':
      return 'investigate-produces';
    // 质保能力
    case 'sslmInvestgQa':
      return 'investigate-qas';
    // 售后服务
    case 'sslmInvestgCustservice':
      return 'investigate-custservices';
    // 附件信息
    case 'sslmInvestgAttachment':
      return 'investigate-attachments';
    // 预留表格页签1
    case 'sslmInvestgReserve1':
      return 'investg-reserve1s';
    // 预留表格页签2
    case 'sslmInvestgReserve2':
      return 'investg-reserve2s';
    // 预留表格页签3
    case 'sslmInvestgReserve5':
      return 'investg-reserve5s';
    // 预留表格页签4
    case 'sslmInvestgReserve6':
      return 'investg-reserve6s';
    // 预留表格页签5
    case 'sslmInvestgReserve7':
      return 'investg-reserve7s';
    // 预留表格页签6
    case 'sslmInvestgReserve8':
      return 'investg-reserve8s';
    // 预留表格页签7
    case 'sslmInvestgReserve9':
      return 'investg-reserve9s';
    // 预留表单页签1
    case 'sslmInvestgReserve3':
      return 'investg-reserve3s';
    // 预留表单页签2
    case 'sslmInvestgReserve4':
      return 'investg-reserve4s';
    // 预留表单页签3
    case 'sslmInvestgReserve10':
      return 'investg-reserve10s';
    // 预留表单页签4
    case 'sslmInvestgReserve11':
      return 'investg-reserve11s';
    // 预留表单页签5
    case 'sslmInvestgReserve12':
      return 'investg-reserve12s';
    // 预留表单页签6
    case 'sslmInvestgReserve13':
      return 'investg-reserve13s';
    // 预留表单页签7
    case 'sslmInvestgReserve14':
      return 'investg-reserve14s';
    default:
      return '';
  }
};

// 获取保存url
export const getSaveUrl = configName => {
  switch (configName) {
    // 产品及服务
    case 'sslmInvestgProservice':
      return 'investigate-proservices';
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      return 'investg-supplier-cates/createOrUpdate';
    // 近三年财务状况
    case 'sslmInvestgFin':
      return 'investigate-finances';
    // 分支机构
    case 'sslmInvestgFinBranch':
      return 'investigate-finances-branchs';
    // 资质信息
    case 'sslmInvestgAuth':
      return 'investigate-authes/createOrUpdate';
    // 联系人信息
    case 'sslmInvestgContact':
      return 'investigate-contacts/createOrUpdate';
    // 地址信息
    case 'sslmInvestgAddress':
      return 'investigate-addresses/createOrUpdate';
    // 开户行信息
    case 'sslmInvestgBankAccount':
      return 'investigate-bank-accounts/createOrUpdate';
    // 主要客户情况
    case 'sslmInvestgCustomer':
      return 'investigate-customers/createOrUpdate';
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      return 'investigate-sub-suppliers/createOrUpdate';
    // 设备信息
    case 'sslmInvestgEquipment':
      return 'investigate-equipments';
    // 附件信息
    case 'sslmInvestgAttachment':
      return 'investigate-attachments';
    // 预留表格页签1
    case 'sslmInvestgReserve1':
      return 'investg-reserve1s/createOrUpdate';
    // 预留表格页签2
    case 'sslmInvestgReserve2':
      return 'investg-reserve2s/createOrUpdate';
    // 预留表格页签3
    case 'sslmInvestgReserve5':
      return 'investg-reserve5s/createOrUpdate';
    // 预留表格页签4
    case 'sslmInvestgReserve6':
      return 'investg-reserve6s/createOrUpdate';
    // 预留表格页签5
    case 'sslmInvestgReserve7':
      return 'investg-reserve7s/createOrUpdate';
    // 预留表格页签6
    case 'sslmInvestgReserve8':
      return 'investg-reserve8s/createOrUpdate';
    // 预留表格页签7
    case 'sslmInvestgReserve9':
      return 'investg-reserve9s/createOrUpdate';
    default:
      return '';
  }
};

// table的rowKey
export const rowKeys = {
  sslmInvestgProservice: 'investgProserviceId',
  sslmInvestgSupplierCate: 'investgSupplierCateId',
  sslmInvestgFin: 'investgFinId',
  sslmInvestgFinBranch: 'investgFinBranchId',
  sslmInvestgAuth: 'investgAuthId',
  sslmInvestgContact: 'investgContactId',
  sslmInvestgAddress: 'investgAddressId',
  sslmInvestgBankAccount: 'investgBankAccountId',
  sslmInvestgCustomer: 'investgCustomerId',
  sslmInvestgSubSupplier: 'investgSubSupplierId',
  sslmInvestgEquipment: 'investgEquipmentId',
  sslmInvestgAttachment: 'investgAttachmentId',
  sslmInvestgReserve1: 'investgReserve1Id',
  sslmInvestgReserve2: 'investgReserve2Id',
  sslmInvestgReserve5: 'investgReserve5Id',
  sslmInvestgReserve6: 'investgReserve6Id',
  sslmInvestgReserve7: 'investgReserve7Id',
  sslmInvestgReserve8: 'investgReserve8Id',
  sslmInvestgReserve9: 'investgReserve9Id',
};

// 判断哪些是form
export const questionnaireForm = {
  sslmInvestgBasic: true, // 基本信息
  sslmInvestgBusiness: true, // 业务信息
  sslmInvestgRd: true, // 研发能力
  sslmInvestgProduce: true, // 生产能力
  sslmInvestgQa: true, // 质保能力
  sslmInvestgCustservice: true, // 售后服务
  sslmInvestgReserve3: true, // 预留表单1
  sslmInvestgReserve4: true, // 预留表单2
  sslmInvestgReserve10: true, // 预留表单3
  sslmInvestgReserve11: true, // 预留表单4
  sslmInvestgReserve12: true, // 预留表单5
  sslmInvestgReserve13: true, // 预留表单6
  sslmInvestgReserve14: true, // 预留表单7
};

export function getCacheValue(value, options) {
  const { valueField } = options;
  if (typeof value === 'number') {
    if (isNaN(value)) return 'NaN';
    if (math.isBigNumber(value)) return value.toString();
    return value;
  }
  if (isArray(value)) {
    return value.map(v => (isPlainObject(v) && valueField ? v[valueField] : v)).join();
  }
  if (isPlainObject(value)) {
    return valueField ? value[valueField] : value;
  }
  // if (moment.isMoment(value)) return value.valueOf();
}

export function useReaction(dataSet, columns, reactionFields, cacheDefaultValues) {
  return reaction(
    () => {
      const res = [];

      // 拆分配置获取公式配置项字段
      let configItemFields = [];
      Object.keys(reactionFields).forEach(fieldCode => {
        const currentFieldConfig = reactionFields[fieldCode];
        const { reactionFieldList = [] } = currentFieldConfig || {};
        configItemFields = configItemFields.concat(reactionFieldList);
      });
      // 字段去重
      configItemFields = [...new Set(configItemFields)];

      configItemFields.forEach(fieldCode => {
        // isField true ----- 表单字段， false ----- 常量数值
        const isField = fieldCode.indexOf('#') === -1;
        if (isField) {
          const dsField = dataSet.getField(fieldCode);
          if (!dsField) return;
        }
        // 循环ds
        (dataSet.records || []).forEach(record => {
          if (record.status === 'sync') {
            // eslint-disable-next-line no-param-reassign
            record.status = 'update';
          }
          // 这一步是undefined - cacheDefaultValue -> {a: ['oldDefault', 'newDefault']}
          let cacheDefaultValue = cacheDefaultValues.get(record.id);
          if (cacheDefaultValue === undefined) {
            // map Map<string, [any, any, any]> string：字段名， [旧值, 新值, any]
            cacheDefaultValue = new Map();
            cacheDefaultValues.set(record.id, cacheDefaultValue);
          }
          // 存储整行的关联字段 changeFields: { name: string(字段名); value: any(默认值); }
          let changeFields = [];
          const [oldDefaultValue, oldUnusedDefaultValue] = cacheDefaultValue.get(fieldCode) || [];
          // 获取默认值配置过当前字段的集合
          const defaultValutConfigField = [];
          Object.keys(reactionFields).forEach(i => {
            // 获取当前字段配置的公式配置
            const currentFieldConfig = reactionFields[i];
            const { reactionFieldList = [], defaultValueStr } = currentFieldConfig || {};
            if (reactionFieldList.includes(fieldCode)) {
              defaultValutConfigField.push({
                sourceField: i,
                defaultValueStr,
                reactionFieldList,
              });
            }
          });
          const defaultValueList = [];
          // 处理默认值
          defaultValutConfigField.forEach(i => {
            const { defaultValueStr, sourceField, reactionFieldList = [] } = i;
            if (sourceField && defaultValueStr && !isEmpty(reactionFieldList)) {
              let newDefaultValueStr = defaultValueStr;
              // 处理公式值
              reactionFieldList.forEach(code => {
                let val = code.indexOf('#') === -1 ? record.get(code) : code.replace('#', '');
                val = Number(val) ? val : 0;
                newDefaultValueStr = newDefaultValueStr.replace(code, val);
              });

              // 注意校验数字格式 todo
              // eslint-disable-next-line no-new-func
              newDefaultValueStr = new Function(`return ${newDefaultValueStr};`)();
              defaultValueList.push({
                sourceField,
                defaultValue: newDefaultValueStr,
              });
            }
          });
          const currentFieldCodeValue = record.get(fieldCode);
          // 获取可以放到缓存内的当前值，方便后续比对逻辑, 页面新值
          if (
            (!cacheDefaultValue.has(fieldCode) ||
              oldUnusedDefaultValue === currentFieldCodeValue) &&
            isField
          ) {
            cacheDefaultValue.set(fieldCode, [currentFieldCodeValue, currentFieldCodeValue]);
            return;
          }
          const diffValue1 = oldDefaultValue;
          const diffValue2 = currentFieldCodeValue;
          if (isField) {
            if (diffValue1 !== diffValue2) {
              cacheDefaultValue.set(fieldCode, [currentFieldCodeValue, null]);
              // 当前字段变化影响的所有关联字段
              changeFields = defaultValueList.map(i => {
                const { sourceField, defaultValue } = i;
                return {
                  name: sourceField,
                  value: defaultValue,
                };
              });
            }
          } else {
            changeFields = defaultValueList.map(i => {
              const { sourceField, defaultValue } = i;
              return {
                name: sourceField,
                value: defaultValue,
              };
            });
          }

          if (changeFields.length > 0) {
            res.push([record, changeFields]);
          }
        });
      });

      return { changeRecords: res, configItemFields };
    },
    ({ changeRecords, configItemFields }) => {
      const fieldCodes = configItemFields.filter(fieldCode => fieldCode.indexOf('#') === -1);
      let flag = false;
      // 只有当被依赖项发生改变时，才更新计算值
      fieldCodes.forEach(fieldCode => {
        const dsField = dataSet.getField(fieldCode);
        if (dsField && dataSet.current && dsField.isDirty(dataSet.current)) {
          flag = true;
        }
      });
      if (flag) {
        runInAction(() => {
          changeRecords.forEach(([record, changeFields]) => {
            changeFields.forEach(({ name, value, replaceValue }) => {
              if (replaceValue) record.set(name, value);
              else record.init(name, value);
            });
          });
        });
      }
    },
    { fireImmediately: true }
  );
}

export const handleFinValues = (divisor, dividend) => {
  let value = null;
  if ((divisor || divisor === 0) && (dividend || dividend === 0)) {
    const divideValue = divide(divisor, dividend);
    value = isFinite(divideValue) ? `${(round(divideValue, 4) * 100).toFixed(2)}%` : null;
  }
  return value;
};

// 处理【财务状况】页签数据
export const handleFinanceData = data => {
  const {
    totalLiabilities,
    totalAssets,
    currentAssets,
    currentLiabilities,
    netProfit,
    assetLiabilityRatio,
    currentRatio,
    returnOnTotalAssets,
  } = data;
  const newAssetLiabilityRatio = handleFinValues(totalLiabilities, totalAssets);
  const finalAssetLiabilityRatio = newAssetLiabilityRatio || assetLiabilityRatio;
  const newCurrentRatio = handleFinValues(currentAssets, currentLiabilities);
  const finalCurrentRatio = newCurrentRatio || currentRatio;
  const newReturnOnTotalAssets = handleFinValues(netProfit, totalAssets);
  const finalReturnOnTotalAssets = newReturnOnTotalAssets || returnOnTotalAssets;
  return {
    ...data,
    assetLiabilityRatio: finalAssetLiabilityRatio,
    currentRatio: finalCurrentRatio,
    returnOnTotalAssets: finalReturnOnTotalAssets,
  };
};

/**
 * 处理调查表配置
 */
export function handleInvestgConfig(
  originConfig = {},
  fieldProperty = [],
  config = {},
  c7nFlag = false
) {
  const newConfig = originConfig;
  if (fieldProperty) {
    fieldProperty.forEach(i => {
      const {
        requiredFlag,
        editableFlag,
        valueType,
        requireFx = '',
        editableFx = '',
        conditionCombination = '',
      } = i;
      if (valueType) {
        // 条件表达式
        let conditionFx = '';
        switch (valueType) {
          case 'required':
            newConfig[i.valueType] = !!Number(requiredFlag);
            conditionFx = requireFx;
            break;
          case 'editable':
            newConfig[i.valueType] = !!Number(editableFlag);
            conditionFx = editableFx;
            break;
          case 'pattern':
            // 配置正则条件时，先把正则置为false,后边通过条件成立修改成true
            newConfig[i.valueType] = false;
            conditionFx = conditionCombination;
            break;
          default:
            break;
        }
        if (conditionFx) {
          const isErr = isErrConExpression(conditionFx);
          if (!isErr) {
            const conNoReg = /(\d+)/g;
            let result = {};
            if (c7nFlag) {
              result = c7nCalculateExpression(i.lineFxList || [], config);
            } else {
              result = calculateExpression(i.lineFxList || [], config);
            }
            if ((i.lineFxList || []).length > 0) {
              conditionFx = conditionFx.replace(conNoReg, (_, m) => result[m] || false);
              conditionFx = conditionFx.replace(/AND/g, '&&').replace(/OR/g, '||');
              // eslint-disable-next-line no-new-func
              newConfig[i.valueType] = new Function(`return ${conditionFx};`)() ? 1 : 0;
            }
          }
        }
      }
    });
  }
  return newConfig;
}

// 校验筛选逻辑是否合法
function isErrConExpression(exp) {
  const leftBracketNum = (exp.match(/\(/g) || []).length;
  const rightBracketNum = (exp.match(/\)/g) || []).length;
  // 暂时不支持10个以上条件配置
  const ruleConNo = /\s*\d+\s*\d+\s*/g.test(exp);
  const ruleConLogic = /\s*(AND|OR)\s*(AND|OR)\s*/g.test(exp);
  const illegalChar = /^(?!AND|OR|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

// 拆分条件c7n
function c7nCalculateExpression(conditionList, { record = {} } = {}) {
  const result = {};
  conditionList.forEach(i => {
    const { lineNum, fieldName = '', relation, fieldValue } = i;
    // 转化小驼峰
    let newSourceFieldCode = fieldName;
    newSourceFieldCode = newSourceFieldCode ? camelCase(newSourceFieldCode) : newSourceFieldCode;
    const newExpression = relation;
    const newConCode = lineNum;

    const right = fieldValue;
    const left = record.get(newSourceFieldCode);
    result[newConCode] = logicCompute(newExpression, left, right);
  });
  return result;
}

// 拆分条件
function calculateExpression(conditionList, { targetForm, record = {} } = {}) {
  const result = {};
  conditionList.forEach(i => {
    const { lineNum, fieldName = '', relation, fieldValue } = i;
    // 转化小驼峰
    let newSourceFieldCode = fieldName;
    newSourceFieldCode = newSourceFieldCode ? camelCase(newSourceFieldCode) : newSourceFieldCode;
    const newExpression = relation;
    const newConCode = lineNum;

    const right = fieldValue;
    const targetAllValue = {
      ...record,
      ...(targetForm ? (targetForm.getFieldsValue && targetForm.getFieldsValue()) || {} : {}),
    };
    const left = targetAllValue[newSourceFieldCode];
    // 方便以后使用, 暂时无用
    // if (targetFieldCode) {
    //   right = targetAllValue[targetFieldCode];
    // }
    result[newConCode] = logicCompute(newExpression, left, right);
  });
  return result;
}

// 条件拼接
function logicCompute(type, left, right) {
  // 转化为字符串比较
  const newLeft = isToString(left) ? toString(left) : left;
  switch (type) {
    case '=':
      return newLeft === right;
    case '>=':
      return newLeft >= right;
    case '<=':
      return newLeft <= right;
    case '!=':
      return newLeft !== right;
    case '>':
      return newLeft > right;
    case '<':
      return newLeft < right;
    case 'ISNULL':
      return isNil(left) || left === '';
    case 'NOTNULL':
      return !(isNil(left) || left === '');
    // case 'BEFORE':
    //   return moment(left).isBefore(moment(right));
    // case 'SAME':
    //   return moment(left).isSame(moment(right));
    // case 'NOTSAME':
    //   return !moment(left).isSame(moment(right));
    // case 'AFTER':
    //   return moment(left).isAfter(moment(right));
    // case '~BEFORE':
    //   return !moment(left).isBefore(moment(right));
    // case '~AFTER':
    //   return !moment(left).isAfter(moment(right));
    // case 'LIKE':
    //   return new RegExp(right, 'g').test(String(left));
    // case 'UNLIKE':
    //   return !new RegExp(right, 'g').test(String(left));
    // case '~LIKE':
    //   return new RegExp(right, 'g').test(String(left));
    // case '~UNLIKE':
    //   return !new RegExp(right, 'g').test(String(left));
    default:
      return false;
  }
}

/**
 * 判断是否可以转化为string
 * @param {String} str
 */
function isToString(str) {
  try {
    toString(str);
    return true;
  } catch (e) {
    return false;
  }
}

// 获取按钮权限
export const getButtonPermissionList = (code = {}, type = '') => {
  const permissionObj = {};
  const meaning = type === 'add' ? '新建' : type === 'delete' ? '删除' : '保存';
  for (const key in code) {
    if (Object.hasOwnProperty.call(code, key)) {
      const ele = code[key];
      permissionObj[key] = [
        {
          code: ele,
          type: 'button',
          meaning,
        },
      ];
    }
  }
  return permissionObj;
};

// 处理调查表模板配置查询出的属性
export const dealConfigData = config => {
  const { investigateConfigHeaders, investigateConfigLines, investigateConfigComponents } = config;
  const configHeaders = {};
  const configList = [];
  const tabValidate = {};
  const tabDescription = {};
  forEach(investigateConfigHeaders, header => {
    const { investgCfHeaderId, configName, validated, configDescription } = header;
    configHeaders[investgCfHeaderId] = header;
    configHeaders[investgCfHeaderId].lines = [];
    tabValidate[configName] = validated;
    tabDescription[configName] = configDescription;
    configList.push(header);
  });

  const configLines = {};
  forEach(investigateConfigLines, line => {
    const { investgCfHeaderId, investgCfLineId, componentType, fieldCode } = line;
    const formatFieldCode = camelCase(fieldCode);
    configLines[investgCfLineId] = line;
    configLines[investgCfLineId].fieldCode = formatFieldCode;
    configLines[investgCfLineId].props = [];
    configLines[investgCfLineId].fxProps = [];
    const lines = configHeaders[investgCfHeaderId] && configHeaders[investgCfHeaderId].lines;
    switch (formatFieldCode) {
      case 'attachmentType':
        if (componentType === 'ValueList') {
          configLines[investgCfLineId].componentType = 'Cascader';
        }
        break;
      default:
        break;
    }
    if (lines) {
      lines.push(line);
    }
  });

  // 后端不返回组件属性为空的组件属性
  forEach(investigateConfigComponents, prop => {
    const { investgCfLineId } = prop;
    const props = configLines[investgCfLineId] && configLines[investgCfLineId].props;
    if (props) {
      props.push(prop);
    }
    const fieldCode =
      configLines[prop.investgCfLineId] && configLines[prop.investgCfLineId].fieldCode;
    if (fieldCode) {
      if (prop.attributeName === 'toValueListFlag' && prop.attributeValue) {
        configLines[prop.investgCfLineId].componentType = 'ValueList';
        switch (fieldCode) {
          case 'attachmentType':
            configLines[prop.investgCfLineId].lovCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
            break;
          case 'authenticationType':
            configLines[prop.investgCfLineId].lovCode = 'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
            break;
          default:
            break;
        }
      }
    }
  });
  // 处理fx属性
  forEach(config.investigateConfigLineFXs, fieldFxProp => {
    const fxProps =
      configLines[fieldFxProp.investgCfLineId] && configLines[fieldFxProp.investgCfLineId].fxProps;
    if (fxProps) {
      fxProps.push(fieldFxProp);
    }
  });
  return {
    configList,
    tabValidate,
    tabDescription,
  };
};

export const getCommonTableProps = (fieldProps = {}) => {
  const { componentType, fieldCode } = fieldProps;
  let tableProps = {};
  switch (componentType) {
    case 'Switch':
    case 'Checkbox':
      tableProps = {
        renderer: ({ value }) => {
          const formatValue = Number(value) ? 1 : 0;
          return yesOrNoRender(formatValue);
        },
      };
      break;
    case 'Input':
      if (fieldCode === 'authenticationType') {
        tableProps = {
          renderer: ({ value, record }) => {
            return record ? record.get(`${fieldCode}Meaning`) || value : value;
          },
        };
      }
      break;
    default:
      break;
  }
  return tableProps;
};

export const getAttachmentTypeOption = ({ tenantId } = {}) =>
  new DataSet({
    autoQuery: true,
    childrenField: 'children',
    transport: {
      read: {
        url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/tree`,
        method: 'GET',
        params: {
          tenantId,
          'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
          'SPFM.COMPANY.SUB_ATTACHMENT': 2,
        },
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (dataSet) {
          dataSet.forEach(record => {
            const { children, parentValue } = record.get(['children', 'parentValue']);
            if (!children && !parentValue) {
              record.set('disabled', true);
            }
          });
        }
      },
    },
  });

// 获取埋点处理后的列
export const getRemoteColumns = (param = {}) => {
  const { configName, columns = [], investgRemote, otherRemoteProps = {} } = param;
  const newColumns = investgRemote
    ? investgRemote.process('SSLM_INVESTIGATION_TAB_TABLE_COLUMNS', columns, {
        ...(otherRemoteProps || {}),
        configName,
      })
    : columns;
  return newColumns;
};

// 获取埋点处理后的lov
export const getRemoteLovProps = (param = {}) => {
  const { lovProps = {}, investgRemote, remoteParams = {} } = param;
  const props = investgRemote
    ? investgRemote.process('SSLM_INVESTIGATION_TAB_LOV_PROPS', lovProps, remoteParams)
    : lovProps;
  return props;
};
