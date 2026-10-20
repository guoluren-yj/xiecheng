import React, { cloneElement, ReactNode, useCallback, useMemo, useState } from 'react';
import { isString, isNil, isArray, isFunction } from 'lodash';
import { queryUnifyIdpValue } from 'services/api';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import {
  Form,
  Input,
  InputNumber,
  Icon,
  Select,
  DatePicker,
  Checkbox,
  Switch,
  Rate,
} from 'hzero-ui';
import Lov from 'srm-front-boot/lib/components/LovSrm';
import TLEditor from 'components/TLEditor';
// @ts-ignore
import Upload from 'srm-front-boot/lib/components/Upload';
import RadioGroup from 'srm-front-boot/lib/components/RadioGroup';
import { getAttachmentUrl, getCurrentUserDateFormatPerfer, getDateFormat, getDateTimeFormat } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { Modal, Progress } from 'choerodon-ui/pro';
// @ts-ignore
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import template from '../utils/template';
import { getFieldValueObject, getParams, preAdapterInitValue } from '../customizeTool';
import { Cache } from '../Customize';
import { FieldConfig } from '../interfaces';
import { customizeFormOptions, getRender, lovMappingsAction, mapLovMeaningToWidgetProps } from './common';
import LovMulti from './LovMulti';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { Size } from 'choerodon-ui/lib/_util/enum';

const FormItem = Form.Item;
type ParseOptions = {
  code: string;
  ctxParams: any;
  cache: { [x: string]: Cache };
  rowKey?: string | number;
  dataSource: any;
};

export function parseTextProps(fieldConfig: FieldConfig) {
  const { numberMax, numberMin, numberPrecision, dateFormat = '', fieldType, allowThousandth, trimFlag } =
    fieldConfig || {};

  const commonProps: any = {};
  let tempProps: any = {};
  switch (fieldType) {
    case 'INPUT':
      if (!isNil(trimFlag) && trimFlag !== -1) {
        tempProps.trim = trimFlag !== 1;
        tempProps.trimAll = trimFlag === 1;
      }
      break;
    case 'TEXT_AREA':
      break;
    case 'CURRENCY':
    case 'INPUT_NUMBER':
      tempProps = {
        max: isNil(numberMax) ? undefined : Number(numberMax),
        min: isNil(numberMin) ? undefined : Number(numberMin),
      };
      if (allowThousandth !== -1 && !isNil(allowThousandth)) {
        tempProps.allowThousandth = !!allowThousandth;
      }
      if (numberPrecision !== undefined) {
        tempProps.precision = numberPrecision;
      }
      break;
    case 'DATE_PICKER':
      tempProps = {
        format: dateFormat,
      };
      break;
    case 'LOV':
      break;
    case 'TL_EDITOR':
      break;
    case 'UPLOAD':
      break;
    case 'LINK':
      break;
    case 'SELECT':
      break;
    case 'SWITCH':
    default:
  }
  return {
    ...commonProps,
    ...tempProps,
  };
}

export function parseContentProps(contentProps: FieldConfig, options: ParseOptions & ComponentOptions) {
  const {
    lovCode,
    lovInfo,
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
    paramList = [],
    defaultValue,
    defaultValueMeaning,
    placeholder,
    viewOnly,
    uploadShowFlag,
    allowThousandth,
    includeNowDayFlag,
    queryUsePost,
    autoDisabledDate,
    attachmentLimitNum,
    breakpointResumeFlag,
    uploadRecordFlag,
    trimFlag,
    ...rest
  } = contentProps || {};
  const { ctxParams, cache, rowKey, dataSource = {}, code, form, customFieldPropsIntercept } = options;
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
  let initialValue = preAdapterInitValue(contentProps, value);
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
    style: { width: '100%' },
    initialMeaning: meaning,
    placeholder,
    disabled,
    key: fieldCode,
  };
  let tempProps: any = {};
  switch (fieldType) {
    case 'INPUT': 
      if (!isNil(trimFlag) && trimFlag!== -1) {
        tempProps.trim = trimFlag !== 1;
        tempProps.trimAll = trimFlag === 1;
      }
      break;
    case 'TEXT_AREA':
      tempProps = {
        rows: textAreaMaxLine || 2,
      };
      break;
    case 'CURRENCY':
    case 'INPUT_NUMBER':
      tempProps = {
        max: isNil(numberMax) ? undefined :  Number(numberMax),
        min: isNil(numberMin) ? undefined : Number(numberMin),
      };
      if (allowThousandth !== -1 && !isNil(allowThousandth)) {
        tempProps.allowThousandth = !!allowThousandth;
      }
      if (numberPrecision !== undefined) {
        tempProps.precision = numberPrecision;
      }
      break;
    case 'DATE_PICKER':
      const showFormat = getCurrentUserDateFormatPerfer() ? (!/HH|hh|mm|ss/.test(dateFormat) ? getDateFormat() : getDateTimeFormat()) : dateFormat;
      tempProps = {
        fieldCode,
        showTime: /HH|hh|mm|ss/.test(dateFormat),
        showFormat,
        // eslint-disable-next-line no-shadow
        processValue: includeNowDayFlag ? (value) => (value ? value.endOf('d') : value) : undefined,
        dateCode: getParams({ paramList, ctxParams, cache, rowKey }).dataCode,
      };

      if (autoDisabledDate !== -1) (tempProps.autoDisabledDate = !!autoDisabledDate);
      break;
    case 'LOV':
      tempProps = {
        code: lovCode,
        lovMappings,
        textValue: meaning,
        queryParams: getParams({ paramList, ctxParams, cache, rowKey }),
      };
      if (rest.multipleFlag === 1) {
        tempProps.queryUsePost = queryUsePost;
        delete tempProps.lovMappings;
        tempProps.translateData = tempProps.textValue;
        delete tempProps.textValue;
      }
      mapLovMeaningToWidgetProps(fieldCode, { form, widgetProps: tempProps, hasLovToLov: rest.hasLovToLov });
      break;
    case 'TL_EDITOR':
      tempProps = {
        label: fieldName,
        field: fieldCode,
        token: dataSource._token,
      };
      break;
    case 'UPLOAD':
      tempProps = {
        label: fieldName,
        field: fieldCode,
        uploadShowFlag,
        viewOnly: disabled || viewOnly,
        hasTemplate: !!rest.attachmentTemplate,
        chunkUpload: (breakpointResumeFlag === -1 || isNil(breakpointResumeFlag)) ? undefined : !!breakpointResumeFlag,
        showHistory: (uploadRecordFlag === -1 || isNil(uploadRecordFlag)) ? undefined : !!uploadRecordFlag,
        chunkSize: 100 * 1024 * 1024,
        templateAttachmentUUID: rest.attachmentTemplate,
        templateBucketName: 'private-bucket',
        bucketName,
        bucketDirectory,
        fileMaxNum: attachmentLimitNum,
      };
      delete commonProps.disabled;
      break;
    case 'LINK':
      tempProps = {
        bucketName,
        linkTitle,
        linkHref,
        linkNewWindow,
        linkType,
        modalWidth,
        name: fieldCode,
        cache,
        unitCode: code,
        form: rest.form,
        dataSource,
      };
      break;
    case 'SELECT':
      tempProps = {
        lovCode,
        fieldCode,
        ...lovInfo,
        multipleFlag: rest.multipleFlag === 1,
        params: getParams({ paramList, ctxParams, cache, rowKey }),
      };
      break;
    case 'RADIOGROUP':
      tempProps = {
        lovCode,
        ...lovInfo,
        params: getParams({ paramList, ctxParams, cache, rowKey }),
      };
      break;
    case 'SWITCH':
      delete commonProps.style;
      break;
    case 'RATE':
      tempProps = {
        allowHalf: true,
        allowClear: true,
      };
      break;
    default:
  }
  let newProps = {
    ...commonProps,
    ...tempProps,
  };
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
 * 根据类型参数生成不同的表单组件
 * @param type 组件类型
 */
export function getInternalComponent(
  fieldType,
  customizeWidgetHook?
): (args1: any, args2?: { form, dataSource, ctxParams, cache, rowKey }) => ReactNode {
  let customizeWidget;
  if (customizeWidgetHook) customizeWidget = customizeWidgetHook(fieldType);
  if (!!customizeWidget) return customizeWidget;
  switch (fieldType) {
    case 'INPUT':
      return (props) => <Input {...props} />;
    case 'CURRENCY':
    case 'INPUT_NUMBER':
      return (props) => <InputNumber {...props} />;
    case 'SELECT':
      return (props) => <FlexSelect {...props} />;
    case 'CHECKBOX':
      return FlexCheckbox;
    case 'SWITCH':
      return FlexSwitch;
    case 'LOV':
      return (props) => <FlexLov {...props} />;
    case 'DATE_PICKER':
      return FlexDatePicker;
    case 'UPLOAD':
      return (props) => <Upload {...props} />;
    case 'TL_EDITOR':
      return (props) => <TLEditor {...props} />;
    case 'TEXT_AREA':
      return (props) => <Input.TextArea {...props} />;
    case 'LINK':
      return (props, extra) => <FlexLink {...props} extra={extra} />;
    case 'RATE':
      return (props) => <Rate {...props} />;
    case 'RADIOGROUP':
      return (props) => <RadioGroup {...props} />;
    default:
      return (props) => <Input {...props} />;
  }
}

type ComponentOptions = {
  isEdit: boolean;
  form: any;
  readOnly?: boolean;
  wrapProps: any;
  rules: any[];
  customizeWidgetHook?: (fieldType: string) => Function;
  customFieldPropsIntercept?: { [k: string]: (props: any) => any };
};
export default function getComponent(
  fieldConfig: FieldConfig,
  options: ParseOptions & ComponentOptions
) {
  const {
    form,
    isEdit = true, // 表单默认true
    readOnly,
    wrapProps,
    dataSource,
    ctxParams,
    cache,
    rowKey,
    rules,
    customizeWidgetHook,
  } = options;
  const extraProps = { form, dataSource, ctxParams, cache, rowKey };
  const { fieldCode, fieldType, multipleFlag, renderOptions, numberMax, numberMin } = fieldConfig;
  const viewOnly = !isEdit || readOnly || renderOptions !== 'WIDGET' || !form;
  const hasFormDec = !!form;
  const { initialValue, initialMeaning, ...componentProps } = parseContentProps(
    { ...fieldConfig, viewOnly, isH0: true },
    options
  );
  const newFormOptions = customizeFormOptions({ ...fieldConfig, initialValue }, rules);
  if (fieldType === 'INPUT_NUMBER' && !isNil(newFormOptions.initialValue)) {
    if (!isNil(numberMax)) {
      newFormOptions.initialValue = Math.min(Number(newFormOptions.initialValue), Number(numberMax));
    }
    if (!isNil(numberMin)) {
      newFormOptions.initialValue = Math.max(Number(newFormOptions.initialValue), Number(numberMin));
    }
  }
  let component;
  const forceUseComponent =
    ['UPLOAD', 'LINK', 'RADIOGROUP'].includes(fieldType || '') ||
    (multipleFlag == 1 && fieldType === 'LOV');
  // 调整component
  if (viewOnly && !forceUseComponent) {
    if (hasFormDec) {
      component = form.getFieldDecorator(
        fieldCode,
        newFormOptions
      )(<TextViewField>no-init</TextViewField>);
    } else {
      component = <TextViewField>no-init</TextViewField>;
    }
    const values = { ...dataSource, ...(form && form.getFieldsValue()) };
    const newValue = preAdapterInitValue(fieldConfig, values[fieldCode]);
    let newMeaning = initialMeaning;
    if (newValue !== initialValue) {
      newMeaning = newValue;
    }
    // 只读但不使用组件自带的只读模式
    component = cloneElement(component, {},
      getRender(
        fieldType,
        componentProps
      )(['LOV', 'SELECT', 'RADIOGROUP'].includes(fieldType || '') ? newMeaning : newValue)
    );
    return isEdit ? <FormItem {...wrapProps}>{component}</FormItem> : component;
  }
  component =
    fieldType === 'LOV' && multipleFlag === 1 ? (
      <LovMulti {...componentProps} viewOnly={viewOnly} />
    ) : (
      getInternalComponent(fieldType, customizeWidgetHook)(componentProps, extraProps)
    );
  if (viewOnly) {
    // 只读并使用组件自带的只读模式需手动设置组件对应的value
    // mode: text目前适用于RADIOGROUP
    component =
      fieldType === 'UPLOAD'
        ? cloneElement(component, { attachmentUUID: initialValue })
        : cloneElement(component, { value: initialValue, mode: 'text' });
  }
  // 如果form存在，value将由form接管
  if (hasFormDec && !viewOnly) {
    component = form.getFieldDecorator(fieldCode, newFormOptions)(component);
  }
  return isEdit ? <FormItem {...wrapProps}>{component}</FormItem> : component;
}

// Option组件初始化
const { Option } = Select;

export class FlexSelect extends React.Component<any> {
  state: {
    options: string | any[];
    loading: boolean;
  } = {
      options: 'loading',
      loading: false,
    };

  cacheKey: string = 'default';

  constructor(props) {
    super(props);
    if (!(window as any).CUSTOMIZECACHE) {
      (window as any).CUSTOMIZECACHE = {};
    }
  }

  componentDidMount() {
    const { lovCode, params } = this.props;
    const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
    this.cacheKey = updateTriggers;
    this.setOptions();
  }

  componentDidUpdate(prevProps) {
    const { lovCode: lovCode1, params: params1 } = prevProps;
    const { lovCode, params } = this.props;
    const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
    const oldUpdateTriggers = [lovCode1]
      .concat(Object.keys(params1), Object.values(params1))
      .join(',');
    if (updateTriggers !== oldUpdateTriggers) {
      this.cacheKey = updateTriggers;
      this.setOptions();
    }
  }

  setOptions = () => {
    const { lovCode, params } = this.props;
    if (!lovCode) return;
    const cache = (window as any).CUSTOMIZECACHE;
    const cacheOptions = lovCode && (cache[lovCode] || {})[this.cacheKey];
    if (!cacheOptions) {
      this.setState({ loading: true });
      if (!(window as any).CUSTOMIZECACHE[lovCode]) {
        (window as any).CUSTOMIZECACHE[lovCode] = {};
      }
      (window as any).CUSTOMIZECACHE[lovCode][this.cacheKey] = new Promise((r, rej) => {
        queryUnifyIdpValue(lovCode, params)
          .then(
            (res: any = {}) => {
              const options = (!res.failed && res) || [];
              this.setState({ options });
              r(options);
            },
            () => {
              rej();
            }
          )
          .catch(() => {
            rej();
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      });
    } else if (cacheOptions instanceof Promise) {
      cacheOptions.then((options) => {
        this.setState({ options });
      });
    }
  };

  onChange = (v) => {
    const { multipleFlag, onChange: oldOnChange } = this.props;
    let value = v;
    if (multipleFlag && isArray(v)) {
      value = v.length > 0 ? v.join(',') : undefined;
    }
    // eslint-disable-next-line no-unused-expressions
    typeof oldOnChange === 'function' && oldOnChange(value);
  };

  render() {
    const { options: _o, loading } = this.state;
    const options = isArray(_o) || isString(_o) ? _o : [];
    const {
      multipleFlag,
      fieldCode,
      valueField = 'value',
      displayField = 'meaning',
      ...contentProps
    } = this.props;
    const { value, defaultValue } = contentProps;
    const multipleConfig =
      multipleFlag
        ? {
          mode: 'multiple',
          defaultValue: isNil(defaultValue) || defaultValue === '' ? [] : defaultValue.split(','),
          value: typeof value === 'string' && value !== '' ? value.split(',') : undefined,
        }
        : undefined;
    return (
      <Select
        allowClear
        {...contentProps}
        {...multipleConfig}
        style={{ width: '100%' }}
        onChange={this.onChange}
      >
        {loading || isString(options) ? (
          <Option key="loading">
            <Icon type="loading" />
          </Option>
        ) : (
          (options as any[]).map((n: any) => (
            <Option value={String(n[valueField])}>{n[displayField]}</Option>
          ))
        )}
      </Select>
    );
  }
}

export class FlexLov extends Lov {
  selectRecord() {
    const { isInput, lovMappings = [] } = this.props as {
      isInput?: boolean, lovMappings?: { targetCode: string, sourceCode: string }[]
    };
    const { valueField: rowkey = 'key', displayField: displayName } = this.state.lov;
    this.cacheValue = this.parseField(this.record, rowkey); // 记录lov变更时对应props中的value， 一旦此value改变，便说明此时、state中的text无效
    // TODO: 值为 0 -0 '' 等的判断

    this.setState(
      {
        text: this.parseField(this.record, displayName),
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: this.parseField(this.record, displayName),
          });
        }
        // 设置额外表单值
        if (form && this.props.extSetMap) {
          this.setExtMapToForm(this.record, this.props.extSetMap, form);
        }

        if (this.props.onChange) {
          const valueField = isInput ? displayName : rowkey;
          this.props.onChange(this.parseField(this.record, valueField), this.record);
          lovMappingsAction(lovMappings, form, this.record);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(this.record);
        }
        this.record = null;
      }
    );
  }
}

export function FlexDatePicker(options) {
  return <DatePicker format={DEFAULT_DATE_FORMAT} {...options} />;
}

export function FlexCheckbox(options) {
  return <Checkbox checkedValue={1} unCheckedValue={0} {...options} />;
}

export function FlexSwitch(options) {
  return <Switch checkedValue={1} unCheckedValue={0} {...options} />;
}

export function FlexLink(props) {
  const {
    extra = {} as any,
    bucketName,
    unitCode,
    name,
    modalWidth,
    cache,
    linkTitle,
    linkHref,
    linkNewWindow,
    linkType = 'none',
    disabled,
  } = props;
  const { form, dataSource, ctxParams } = extra;
  let newHref = linkHref || '';
  let newTitle = linkTitle || '';
  const mappings = newHref.match(/{([^{}]*)}/g);
  const titleMappings = newTitle.match(/{([^{}]*)}/g);
  let values = {};
  if (mappings || titleMappings) {
    values = { ...dataSource, ...(form && form.getFieldsValue()) };
  }
  if (mappings) {
    newHref = replace(mappings, values, newHref, ctxParams.ctx);
  }
  if (titleMappings) {
    newTitle = replace(titleMappings, values, newTitle, ctxParams.ctx);
  }
  const linkProps: any = {
    disabled,
    rel: 'noopener noreferrer',
    // eslint-disable-next-line no-script-url
    href: 'javascript:void(0)',
    style: {
      wordBreak: 'break-word'
    }
  };
  const [loading, _setLoading] = useState(false);
  const setLoading = useCallback((loadingStatus = {}) => {
    _setLoading(!!loadingStatus[name || ""]);
  }, []);
  const memoData = useMemo(
    () => ({
      modalOnClick() {
        Modal.open({
          closable: true,
          movable: false,
          drawer: linkType === 'drawer',
          key: Modal.key(),
          style: { width: modalWidth },
          footer: null,
          children: <EmbedPage href={newHref} pageData={extra} />,
        });
      },
      innerClick() {
        const [uri, search] = newHref.split('?');
        (window as any).dvaApp._store.dispatch(
          (window as any).routerRedux.push({
            pathname: uri,
            search: search ? `?${search}` : undefined,
          })
        );
      },
      btnClick() {
        const globalEventCollection = (window as any).CUSTEVENTCOLLECTION;
        if (globalEventCollection && globalEventCollection[unitCode]) {
          const btnClickEvent = globalEventCollection[unitCode].find(
            (event) => event.eventCode === name
          );
          btnClickEvent &&
            btnClickEvent.callback.call(undefined, cache, ctxParams, undefined, extra, {setLoading});
        }
      },
      attachmentWarning() {
        Modal.warning(intl.get('hpfm.customize.common.noAttachmentUrl').d('附件URL不存在'));
      },
    }),
    [dataSource, form, ctxParams, newHref, linkType, modalWidth, setLoading]
  );
  switch (linkType) {
    case 'drawer':
    case 'modal':
      linkProps.onClick = memoData.modalOnClick;
      break;
    case 'inner':
      linkProps.onClick = memoData.innerClick;
      break;
    case 'btn':
      linkProps.onClick = memoData.btnClick;
      break;
    case 'attachment':
      linkProps.target = '_blank';
      linkProps.download = true;
      if (!newHref) linkProps.onClick = memoData.attachmentWarning;
      else {
        linkProps.href = getAttachmentUrl(
          newHref,
          bucketName,
          ctxParams.ctx.organizationId,
          undefined,
          undefined
        );
      }
      break;
    default:
      linkProps.target = linkNewWindow ? '_blank' : '_self';
      linkProps.href = newHref;
  }
  return (
    <>
      {loading && <Progress style={{ marginRight: 4 }} type={ProgressType.loading} size={Size.small} />}
      <a {...linkProps}>{newTitle}</a>
    </>
  );
}

export function replace(mappings: ArrayLike<any>, values: any, targetString: string, ctx: any) {
  let newString = targetString;
  for (let i = 0; i < mappings.length; i++) {
    if (mappings[i] === '{organizationId}' || mappings[i] === '{tenantId}') {
      // eslint-disable-next-line no-continue
      continue;
    }
    const key = mappings[i].match(/{([^{}]*)}/)[1];
    const value = isNil(values[key]) ? '' : values[key];
    newString = newString.replace(`{${key}}`, value);
  }
  newString = newString.replace(/{organizationId}/, ctx.organizationId);
  newString = newString.replace(/{tenantId}/, ctx.tenantId);
  return newString;
}

type ComputeOptions = {
  relatedList?: any[];
  cache: { [k: string]: Cache };
  code: string;
  ctxParams: any;
  rowKey?: string | number;
  wrapProps?: any;
  namespace?: string;
};

export function getComputeComp(renderRule: string, options: ComputeOptions) {
  const { wrapProps, ...others } = options;
  const dataGets = getFieldValueObject(others as any);
  return (
    <FormItem {...options.wrapProps}>
      {/* eslint-disable-next-line react/no-danger */}
      <span dangerouslySetInnerHTML={{ __html: template.render(renderRule, dataGets, options.rowKey) }} />
    </FormItem>
  );
}

class TextViewField extends React.Component {
  render() {
    return (<span style={{ wordBreak: 'break-word' }}>{this.props.children}</span>);
  }
}