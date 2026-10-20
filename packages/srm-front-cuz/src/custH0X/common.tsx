import { FormItemProps } from 'hzero-ui/lib/form';
import { Icon, Tooltip } from 'hzero-ui';
import React, { cloneElement, ReactNode } from 'react';
import moment from "moment";
import intl from 'utils/intl';
import { numberRender } from '../utils';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { getCurrentUserDateFormatPerfer, getDateTimeFormat, getDateFormat } from 'hzero-front/lib/utils/utils';
import { isNil, isArray, isEmpty, isNumber, isUndefined } from 'lodash';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { FieldConfig } from '../interfaces';
import { Cache } from '../Customize';
import { selfValidator } from '../customizeTool';
import { getComputeComp } from '../CommonFlexComp';

export function getValuePropName(type) {
  if (type === 'UPLOAD') return 'attachmentUUID';
  if (type === 'CHECKBOX' || type === 'SWITCH') return 'checked';
  return 'value';
}

export function customizeFormOptions(fieldConfig: FieldConfig, rules: any[]) {
  const { fieldType, dateFormat = '', initialValue, includeNowDayFlag, numberMax, numberMin } = fieldConfig || {};
  let newInitialValue = initialValue;
  if (!isNil(newInitialValue) && fieldType === 'INPUT_NUMBER') {
    if (!isNil(numberMax)) {
      newInitialValue = Math.min(Number(newInitialValue), Number(numberMax));
    }
    if (!isNil(numberMin)) {
      newInitialValue = Math.max(Number(newInitialValue), Number(numberMin));
    }
  }
  const formOptions: any = {
    rules,
    valuePropName: getValuePropName(fieldType),
    initialValue: newInitialValue,
  };
  if (fieldType === 'DATE_PICKER') {
    let newDateFormat = dateFormat;
    if (includeNowDayFlag) {
      newDateFormat = `${DEFAULT_DATE_FORMAT} 23:59:59`;
    } else if (!/HH|hh|mm|ss/.test(dateFormat)) {
      newDateFormat = `${DEFAULT_DATE_FORMAT} 00:00:00`;
    } else {
      newDateFormat = 'YYYY-MM-DD HH:mm:ss'
    }
    formOptions.getValueProps = (dateStr) => ({
      value: dateStr ? moment(dateStr, newDateFormat) : dateStr,
    });
    formOptions.getValueFromEvent = (e) => {
      if (!e || !e.target) {
        return e && e.format ? e.format(newDateFormat) : e;
      }
      const { target } = e;
      return target.type === 'checkbox' ? target.checked : target.value;
    };
  }
  return formOptions;
}

/**
 * 对拿到数据做进一步的渲染适配
 * @param renderOptions 渲染类别
 */
export function getRender(fieldType, componentProps: any = {}) {
  switch (fieldType) {
    case 'SWITCH':
    case 'CHECKBOX':
      return (val) => yesOrNoRender(Number(val || 0));
    case 'CURRENCY':
    case 'INPUT_NUMBER':
      return isNil(componentProps.precision) && isNil(componentProps.allowThousandth)
        ? (val) => val
        : (val) =>
          numberRender(
            val,
            componentProps.precision,
            componentProps.allowThousandth,
            true
          );
    case 'DATE_PICKER':
      const showFormat = getCurrentUserDateFormatPerfer() ? (!/HH|hh|mm|ss/.test(componentProps.format) ? getDateFormat() : getDateTimeFormat()) : componentProps.showFormat;
      return (val) => val && moment(val).format(showFormat || componentProps.format || 'YYYY-MM-DD HH:mm:ss');
    default:
      return (val) => val && typeof val === "object" ? JSON.stringify(val) : val;
  }
}

type RulesOptions = {
  ctxParams: any;
  cache: { [k: string]: Cache };
  code: string;
  rowKey?: string | number;
  attachmentsCount?: { [uuid: string]: number };
};

/**
 * 用于调整FormItem类型的react-element对象的配置
 * @param {object} fieldConfig 个性化配置属性
 */
export function customizeFormRules(fieldConfig: FieldConfig, tools: RulesOptions) {
  const { textMinLength, required, fieldName, conValidDTO, fieldType, columnLength } = fieldConfig;
  let { textMaxLength } = fieldConfig;
  if (columnLength && (!textMaxLength || textMaxLength > columnLength)) {
    textMaxLength = columnLength;
  }
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
      const attachmentsCount = tools.attachmentsCount || {};
      rules.push({
        customize: true,
        isUpload: true,
        stdBucketName: undefined,
        validator: (_, value, cb) => {
          let msg;
          let bucketName = fieldConfig.bucketName;
          if (_.stdBucketName) bucketName = _.stdBucketName;
          if (value === undefined || !attachmentsCount || !attachmentsCount[`${value}#${bucketName || ""}`]) {
            msg = intl.get('hzero.common.message.confirm.attachment.atLeast');
          }
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

type MergeFormItemOptions = {
  form: any;
  rules: any[];
  dataSource: any;
  params: any;
  noLabel?: boolean;
  tools?: any;
  customFieldPropsIntercept?: { [k: string]: (props: any) => any };
};

/** 表格个性化需要用返回值确定原render是否为一个输入组件
 * */
export function mergeFormItemIndividual(
  props: any,
  fieldConfig: FieldConfig,
  options: MergeFormItemOptions
) {
  const {
    editable,
    fieldType,
    placeholder,
    multipleFlag,
    defaultValue,
    numberPrecision,
    lovMappings = [],
    textAreaMaxLine,
    defaultValueMeaning,
    numberMax,
    numberMin,
    dateFormat,
    fieldName,
    fieldCode,
    lovCode,
    allowThousandth,
    uploadShowFlag,
    breakpointResumeFlag,
    uploadRecordFlag,
    includeNowDayFlag,
    attachmentTemplate,
    hasLovToLov, // h0特有，非接口数据
    autoDisabledDate,
    attachmentLimitNum,
    trimFlag,
  } = fieldConfig;
  const { form, rules, params, dataSource = {}, customFieldPropsIntercept } = options;
  const newRulesCollection: any = { others: [], required: false, max: false, min: false };
  let newProps: any = {
    ...props,
  };
  if (props && props['data-__meta']) {
    const dataMeta = props['data-__meta'];
    const dataField = props['data-__field'];
    let uploadRule = false;
    const { rules: oldRules = [], name } = dataMeta;
    // 如果字段名称非空说明修改了字段名，在此进行必输信息的修正
    if (!isEmpty(rules) || fieldName !== undefined) {
      oldRules.forEach((k) => {
        if (k.required !== undefined) {
          newRulesCollection.required = k;
          // 如果存在自定义字段名称，覆盖默认的message数据
          if (fieldName) {
            k.message = intl.get('hzero.common.validation.notNull', {
              name: fieldName,
            });
          }
        } else if (k.max !== undefined) {
          newRulesCollection.max = k;
        } else if (k.min !== undefined) {
          newRulesCollection.min = k;
        } else if (k.isUpload) {
          uploadRule = k.customize ? false : k;
        } else if (!k.customize) {
          newRulesCollection.others.push(k);
        }
      });
      rules.forEach((k) => {
        if (k.required !== undefined) {
          newRulesCollection.required = k;
        } else if (k.max !== undefined) {
          newRulesCollection.max = k;
        } else if (k.min !== undefined) {
          newRulesCollection.min = k;
        } else if (k.isUpload) {
          k.stdBucketName = props.bucketName;
          uploadRule = k;
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
      const oldOnChange = newProps.onChange;
      newProps.onChange = (val, record, ...others) => {
        lovMappingsAction(lovMappings, form, record);
        // eslint-disable-next-line no-unused-expressions
        oldOnChange && oldOnChange(val, record, ...others);
      };
    }
    if (!isNil(defaultValue) && isUndefined(dataSource[name])) {
      dataMeta.initialValue = defaultValue;
      if (fieldType === 'INPUT_NUMBER') {
        if (!isNil(numberMax)) {
          dataMeta.initialValue = Math.min(Number(defaultValue), Number(numberMax));
        }
        if (!isNil(numberMin)) {
          dataMeta.initialValue = Math.max(Number(defaultValue), Number(numberMin));
        }
      }
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
    if (params) {
      newProps.queryParams = { ...newProps.queryParams, ...params };
    }
    if (typeof placeholder === 'string' && placeholder !== '') {
      newProps.placeholder = placeholder;
    }
    // eslint-disable-next-line no-unused-expressions
    editable !== -1 && !isNil(editable) && (newProps.disabled = !editable);
    /** 未列出的组件类型即是不推荐修改的 */
    switch (fieldType) {
      case 'INPUT':
        if (!isNil(trimFlag) && trimFlag !== -1) {
          newProps.trim = trimFlag !== 1;
          newProps.trimAll = trimFlag! === 1;
        }
        break;
      case 'TEXT_AREA':
        textAreaMaxLine !== undefined && (newProps.rows = textAreaMaxLine);
        break;
      case 'INPUT_NUMBER':
        allowThousandth !== -1 && !isNil(allowThousandth) && (newProps.allowThousandth = allowThousandth);
        numberPrecision !== undefined && (newProps.precision = numberPrecision);
        numberMax !== undefined && (newProps.max = Number(numberMax));
        numberMin !== undefined && (newProps.min = Number(numberMin));
        break;
      case 'DATE_PICKER':
        dateFormat !== undefined && (newProps.format = dateFormat);
        if (includeNowDayFlag) {
          newProps.processValue = (value) => (value ? value.endOf('d') : value);
        }
        const customizeDateCode = (params || {}).dateCode;
        customizeDateCode !== undefined && (newProps.dateCode = customizeDateCode);
        autoDisabledDate !== -1 && (newProps.autoDisabledDate = !!autoDisabledDate);
        break;
      case 'LOV':
        mapLovMeaningToWidgetProps(fieldCode, { form, widgetProps: newProps, hasLovToLov });
        lovCode !== undefined && (newProps.code = lovCode);
        break;
      case 'RADIOGROUP':
        lovCode !== undefined && (newProps.lovCode = lovCode);
        break;
      case 'UPLOAD':
        uploadShowFlag !== undefined && (newProps.uploadShowFlag = !!uploadShowFlag);
        if (attachmentTemplate !== undefined) {
          newProps.hasTemplate = true;
          newProps.templateAttachmentUUID = attachmentTemplate;
          newProps.templateBucketName = 'private-bucket';
        }
        if (breakpointResumeFlag !== -1 && !isNil(breakpointResumeFlag)) {
          newProps.chunkUpload = !!breakpointResumeFlag;
          newProps.chunkSize = 100 * 1024 * 1024;
        }
        if (uploadRecordFlag !== -1 && !isNil(uploadRecordFlag)) {
          newProps.showHistory = !!uploadRecordFlag;
        }
        if (!isNil(attachmentLimitNum)) {
          newProps.fileMaxNum = attachmentLimitNum;
        }
        break;
      // case 'TEXT_AREA':
      //   textAreaMaxLine !== undefined && (newProps.rows = textAreaMaxLine);
      //   break;
      default:
    }
  }
  if (customFieldPropsIntercept && customFieldPropsIntercept[fieldCode]) {
    const customFieldProps = customFieldPropsIntercept[fieldCode]({ fieldProps: newProps, record: dataSource });
    newProps = {
      ...newProps,
      ...customFieldProps,
    };
  }
  return newProps;
}

/**
 * 使用新规则替换FormItem原有的校验规则
 */
export function traversalFormItems(
  formItem: any,
  fieldConfig: FieldConfig,
  options: MergeFormItemOptions
): ReactNode {
  const { fieldName, initNewFormItemProps, helpMessage, renderOptions, renderRule, visible } =
    fieldConfig || {};
  const { tools, noLabel } = options;
  const useComputedRule = renderRule && renderOptions === 'TEXT';
  const children = formItem && formItem.props ? formItem.props.children : null;
  let newNode = formItem;
  interceptDefaultValue(fieldConfig);
  if (children) {
    const newFormItemProps: FormItemProps & { children: any } = { ...initNewFormItemProps };
    if (!noLabel) {
      if (!isNil(fieldName)) {
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
    }
    if (isArray(children)) {
      const newChildren: any[] = [];
      for (let i = 0; i < children.length; i++) {
        if (isNil(children[i])) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const newFieldProps = mergeFormItemIndividual(children[i].props, fieldConfig, options);
        if (useComputedRule && tools) {
          newFieldProps.children = getComputeComp(renderRule || '', tools);
        }
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
      const newFieldProps = mergeFormItemIndividual(children.props, fieldConfig, options);
      if (visible === 1 && newFieldProps) newFieldProps.hidden = false;
      if (useComputedRule && tools) {
        newFormItemProps.children = getComputeComp(renderRule || '', tools);
      } else {
        newFormItemProps.children = children.props
          ? cloneElement(children, newFieldProps)
          : children;
      }
      newNode = cloneElement(formItem, newFormItemProps);
    }
  }
  return newNode;
}

function interceptDefaultValue(fieldConfig: FieldConfig) {
  const { defaultValue } = fieldConfig;
  switch (fieldConfig.fieldType) {
    case 'DATE_PICKER':
      // eslint-disable-next-line no-param-reassign
      fieldConfig.defaultValue = isNil(defaultValue) ? undefined : moment(defaultValue);
      break;
    default:
  }
}

export const LOV_MEANING_KEY = "__CUZ_LOV_MEANING_KEY__";

export function mapLovMeaningToWidgetProps(fieldCode: string, { form, widgetProps, hasLovToLov = false }) {
  if (!hasLovToLov) return;
  if (!form) return;
  /**
   * registerField内部会判断是否已经注册过，如果是，该函数nothing to do
   * */
  form.registerField(LOV_MEANING_KEY, { hidden: true, initialValue: {} });
  const lovFieldMeaning = form.getFieldValue(LOV_MEANING_KEY);
  if (lovFieldMeaning && lovFieldMeaning[fieldCode]) {
    if (widgetProps.textField) {
      const oldValue = form.getFieldValue(widgetProps.textField);
      // 这里两边的值只能是null、undefined、string这三种类型，否则为功能模块逻辑bug
      if (oldValue !== lovFieldMeaning[fieldCode]) setTimeout(() => {
        // 这里设置一次以后把缓存的值清除，避免多次调用，相当于吧缓存的数据转移到textField
        form.setFieldsValue({[widgetProps.textField]: lovFieldMeaning[fieldCode]});
        // lovFieldMeaning[fieldCode];
      });
    } else {
      widgetProps.textValue = lovFieldMeaning[fieldCode];
    }
  }
}

/**
 * @param lovMappings 
 * @param form 
 * @param recordData 
 * @returns
 */
export function lovMappingsAction(lovMappings: { targetCode: string, sourceCode: string, lovInfo?, sourceDisplayField?}[] = [], form, recordData = {}) {
  if (!lovMappings.length) return;
  const cacheMeaning = {};
  const newValues = lovMappings.reduce(
    (pre, { sourceCode, targetCode, lovInfo, sourceDisplayField }) => {
      if (lovInfo) {
        const displayField = sourceDisplayField || lovInfo.displayField;
        cacheMeaning[targetCode] = recordData[displayField];
      }
      return { ...pre, [targetCode]: recordData[sourceCode] };
    },
    {}
  );
  if (!isEmpty(cacheMeaning)) {
    /**
     * 预防+设置值为hidden, 再调用一次注册
     * */
    form.registerField(LOV_MEANING_KEY, { hidden: true, initialValue: cacheMeaning });
    // 直接修改引用数据
    const oldCacheLovFieldMeaning = form.getFieldValue(LOV_MEANING_KEY) || {};
    Object.keys(cacheMeaning).forEach(k => {
      oldCacheLovFieldMeaning[k] = cacheMeaning[k];
    });
    newValues[LOV_MEANING_KEY] = oldCacheLovFieldMeaning;
  }
  form.setFieldsValue(newValues);
}