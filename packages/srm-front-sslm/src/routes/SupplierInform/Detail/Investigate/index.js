import React, {
  createContext,
  useRef,
  useState,
  useContext,
  memo,
  useCallback,
  useMemo,
  Fragment,
  useEffect,
} from 'react';
import {
  Input,
  Collapse,
  Tabs,
  Icon,
  Spin,
  Form,
  DatePicker,
  InputNumber,
  Anchor,
  Row,
  Col,
  Cascader,
  Select,
  Modal,
  Tooltip,
  Alert,
} from 'hzero-ui';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { Button } from 'components/Permission';
// import UploadModal from 'components/Upload/index';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import {
  compose,
  equals,
  map,
  isString,
  isNumber,
  sum,
  isEmpty,
  compact,
  isUndefined,
  toString,
  last as getLast,
  head,
  isFunction,
  isNil,
  isArray,
} from 'lodash';
import { dateRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
// import Lov from 'components/Lov';
import Switch from 'components/Switch';
import moment from 'moment';
import notification from 'utils/notification';
import querystring from 'querystring';
import { queryIdpValue, checkPermission } from 'services/api';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

import { getEditTableData, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import Lov from '@/routes/components/Lov'; // lov父级品类不可选
import { loadCityData } from '@/services/enterpriseInformService';
import { updateUploadDateWithInvestigate } from '@/services/commonService';
import {
  handleInvestgConfig,
  getButtonPermissionList,
} from '@/routes/components/Investigation/utils';
import { queryAttachmentTypeList } from '@/routes/components/Compose/utils';

import {
  isTab,
  isTable,
  rowKeys,
  addressConfig,
  fetchUrls,
  saveUrls,
  deleteUrls,
  deletePermissionCode,
  addPermissionCode,
} from './configuration';
import { useInvestListData } from './RowLink';
import { useSetState } from './utils';
import '@/routes/index.less';

import styles from './index.less';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const FormItem = Form.Item;
const { TextArea } = Input;
const { Link } = Anchor;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const FormItemProps = (fieldDescription, edid, style = {}, layout = {}) =>
  edid
    ? {}
    : {
        style,
        label: fieldDescription,
        ...formItemLayout,
        ...layout,
      };

const decoratorProps = ({
  requiredFlag,
  fieldDescription,
  fieldCode,
  // cascadeField,
  // newRequiredFlag,
  mobilephoneFlag = false,
  internationalTelCode = false,
  cascadeFieldRequiredFlag = false,
  val,
  render,
  pattern,
  record,
  configName,
  patternFlag = true,
  currentRecord = {},
  form = {},
  fxProps,
}) => {
  const newPatternFlag = patternFlag && !!pattern;
  const oldRequiredFlag =
    (requiredFlag && fieldCode !== 'purchaserAttachmentUuid') || cascadeFieldRequiredFlag;
  // 处理fx配置
  const params = {
    record: currentRecord,
    form,
    config: {
      required: oldRequiredFlag,
      fieldProperty: fxProps,
    },
  };
  let newRequiredFlag = oldRequiredFlag;
  if (!isEmpty(form)) {
    const { required: fxRequiredFlag } = handleConditionConfig(params);
    newRequiredFlag = fxRequiredFlag;
  }
  return {
    rules: compact([
      {
        required: newRequiredFlag,
        message: intl.get('hzero.common.validation.notNull', {
          name: fieldDescription,
        }),
      },
      mobilephoneFlag
        ? {
            pattern: internationalTelCode ? PHONE : NOT_CHINA_PHONE,
            message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
          }
        : false,
      newPatternFlag
        ? {
            pattern: new RegExp(pattern, 'g'),
            message: intl.get('hzero.common.validation.format').d('数据格式校验不通过'),
          }
        : false,
      {
        validator: (_, value, cb) => {
          const longEffectiveFlag = record && record.$form.getFieldValue('longEffectiveFlag');
          if (fieldCode === 'expirationDate' && !longEffectiveFlag && record) {
            const expirationDate = record.$form.getFieldValue('expirationDate');
            const lastUploadDate = record.$form.getFieldValue('lastUploadDate');
            if (expirationDate) {
              const flag = moment(lastUploadDate).isAfter(expirationDate, 'day');
              if (flag) {
                cb(
                  intl
                    .get('spfm.investigationDefinition.view.validation.date')
                    .d('文件到期日要大于最后上传日期')
                );
              } else {
                cb();
              }
            } else if (lastUploadDate && configName !== 'sslmInvestgAttachment') {
              cb(
                intl
                  .get('spfm.investigationDefinition.view.validation.date')
                  .d('文件到期日要大于最后上传日期')
              );
            } else {
              cb();
            }
          }
          if (configName === 'sslmInvestgAddress' && !isEmpty(record)) {
            const {
              countryCode,
              quickIndex,
              isLeaf,
              regionId,
              zipCode,
            } = record.$form.getFieldsValue();
            const { countryCode: oldCountryCode, quickIndex: oldQuickIndex } = record;
            const newCountryCode = countryCode || oldCountryCode;
            const newQuickIndex = quickIndex || oldQuickIndex;
            if (newCountryCode === 'CN' || newQuickIndex === 'CN') {
              if (fieldCode === 'regionPathName') {
                if (regionId && !isLeaf) {
                  cb(intl.get('sslm.common.view.validate.lastRegion').d('须选择填写至最末级地区'));
                }
                cb();
              } else if (fieldCode === 'zipCode' && !isEmpty(zipCode)) {
                const testReg = /^[0-9]{6,6}$/;
                if (!testReg.test(value)) {
                  cb(intl.get('sslm.common.view.validate.atLeastSixNumber').d('请输入6位数字'));
                }
                cb();
              }
              cb();
            }
            cb();
          }
          cb();
        },
      },
    ]),
    initialValue: (val && render && render(val)) || val,
  };
};

const attributesProps = (attrs, action) => {
  const attr = {};
  (attrs || []).forEach(({ attributeName, attributeValue }) => {
    const value =
      (isString(attributeValue) && attributeValue.replace('this.', '')) || attributeValue;
    attr[attributeName] = (action && action[value]) || value;
    // 过滤onClear，onChange不存在的属性
    if (attributeName === 'onChange' || attributeName === 'onClear') {
      if (!isFunction(attr[attributeName])) {
        delete attr[attributeName];
      }
    }
  });
  return attr;
};

const datePickRequired = (requiredFlag, fieldCode, record, configName) => {
  if (isEmpty(record)) {
    return requiredFlag;
  }
  switch (fieldCode) {
    case 'expirationDate': {
      const longEffectiveFlag = record.$form.getFieldValue('longEffectiveFlag');
      // 获取供方附件是否必传值
      const supplierAttFlag = record.$form.getFieldValue('supplierAttFlag');
      const newSupplierAttFlag = isUndefined(supplierAttFlag)
        ? record.supplierAttFlag
        : supplierAttFlag;
      let needCheckRequired = true;
      // 附件页签 “文件到期日”当“供方附件是否必传”值为是时和长期二选一必填，否则都不必填
      if (configName === 'sslmInvestgAttachment') {
        needCheckRequired = !!Number(newSupplierAttFlag);
      }
      if (!needCheckRequired) {
        return false;
      }
      if (isUndefined(longEffectiveFlag)) {
        return !record.longEffectiveFlag;
      } else {
        return !longEffectiveFlag;
      }
    }
    case 'dateFrom': {
      const dateTo = record.$form.getFieldValue('dateTo');
      return dateTo;
    }
    case 'dateTo': {
      const dateFrom = record.$form.getFieldValue('dateFrom');
      return dateFrom;
    }
    default:
      return requiredFlag;
  }
};

const groupRow = (array, getFieldDecorator, dataSource, changFlag, form) => {
  const newRows = [[]];
  (array || []).forEach(({ componentType, ...rest }) => {
    const Component = componentTypeS[`${componentType}_`] || componentTypeS.Input_;
    const com = {
      com: (
        <Component {...{ getFieldDecorator, dataSource, changFlag, ...rest, formObject: form }} />
      ),
      componentType,
    };
    if (componentType === 'TextArea') {
      newRows.push([com]);
    } else {
      const last = newRows[newRows.length - 1];
      if (last.length >= 3 || (last[0] && last[0].componentType === 'TextArea')) {
        newRows.push([com]);
      } else {
        last.push(com);
      }
    }
  });
  return newRows.map(item => <Rows item={item} />);
};

const Rows = ({ item: [i1 = {}, i2 = {}, i3 = {}] }) => (
  <Row gutter={48} className={i1.componentType === 'TextArea' ? 'half-row' : 'writable-row'}>
    <Col span={i1.componentType === 'TextArea' ? 12 : 8}>{i1.com}</Col>
    {i1.componentType !== 'TextArea' && [
      <Col span={8}>{i2.com}</Col>,
      <Col span={8}>{i3.com}</Col>,
    ]}
  </Row>
);

const componentTypeS = {
  ValueList_: ({
    dataSource = {},
    rowKey,
    fieldDescription,
    fieldCode,
    lovCode = '',
    tenantId,
    attributes,
    additional = {},
    requiredFlag,
    editableFlag,
    getFieldDecorator,
    edid = false,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps = [],
    configName,
    // pattern,
    ...rest
  }) => {
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    const { attributeValue } = useMemo(
      () => attributes.find(({ attributeName }) => attributeName === 'queryParams') || {},
      []
    );
    const value_ = (additional[(record || {})[rowKey]] || {})[attributeValue];
    const pay = useMemo(() => queryParams(attributeValue, record, additional, rowKey, tenantId), [
      value_,
    ]);
    const attributeProps = attributesProps(attributes, rest);
    const {
      multiple = false,
      disabled,
      parentRelationField,
      defaultValue,
      ...other
    } = attributeProps;

    const otherProps = {
      ...other,
      queryParams: { ...pay, tenantId },
    };
    let initValue = (record || dataSource)[fieldCode];
    initValue = isUndefined(initValue) ? defaultValue : initValue;
    const initialValue = multiple
      ? (initValue && toString(initValue).split(',')) || []
      : isNumber(initValue)
      ? `${initValue}`
      : initValue;
    // 获取级联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    // console.log(attributes);
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      // pattern,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <ValueList
            style={{ width: '100%' }}
            lovCode={lovCode}
            textValue={
              (record || dataSource)[`${fieldCode}Meaning`] || (record || dataSource)[fieldCode]
            }
            {...otherProps}
            disabled={changFlag || newDisabled}
            mode={multiple ? 'multiple' : 'default'}
            lazyLoad={false}
          />
        )}
        {parentRelationField &&
          (record ? record.$form.getFieldDecorator : getFieldDecorator)(
            `${fieldCode}DefaultValue`,
            {
              initialValue: defaultValue,
            }
          )}
      </FormItem>
    );
  },
  DatePicker_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    requiredFlag,
    editableFlag,
    attributes,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    configName,
  }) => {
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const datePickRequiredFlag = datePickRequired(requiredFlag, fieldCode, record, configName);
    const attributeProps = attributesProps(attributes);
    const { disabled, defaultValue, ...other } = attributeProps;
    const valueFormat =
      (record || dataSource)[fieldCode] &&
      moment((record || dataSource)[fieldCode], DEFAULT_DATE_FORMAT);
    const defaultValueFormat = defaultValue && moment(defaultValue, DEFAULT_DATE_FORMAT);
    const initialValue = isUndefined((record || dataSource)[fieldCode])
      ? defaultValueFormat
      : valueFormat;
    const configProps = {
      requiredFlag: datePickRequiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      record,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    let finalDisabled = newDisabled;
    // 勾选长期，文件到期日不可编辑，放在最后即使配了fx也不生效
    if (fieldCode === 'expirationDate' && configName === 'sslmInvestgAttachment') {
      finalDisabled = !!record.$form.getFieldValue('longEffectiveFlag');
    }
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <DatePicker
            {...other}
            disabled={changFlag || finalDisabled}
            disabledDate={currentDate => {
              if (fieldCode === 'dateFrom') {
                return (
                  record &&
                  record.$form.getFieldValue('dateTo') &&
                  moment(record.$form.getFieldValue('dateTo')).isBefore(currentDate, 'day')
                );
              } else if (fieldCode === 'dateTo') {
                const todayDate = moment().format(DEFAULT_DATE_FORMAT);
                const dateFrom =
                  record &&
                  record.$form.getFieldValue('dateFrom') &&
                  moment(record.$form.getFieldValue('dateFrom'));
                const maxFlag = dateFrom ? moment(todayDate).isAfter(dateFrom, 'day') : true;
                return maxFlag
                  ? moment() && moment().isSameOrAfter(currentDate, 'day')
                  : dateFrom.isSameOrAfter(currentDate, 'day');
              } else if (fieldCode === 'expirationDate') {
                const lastUploadDate = record && record.$form.getFieldValue('lastUploadDate');
                return lastUploadDate
                  ? currentDate < moment(lastUploadDate).endOf('day')
                  : currentDate < moment().endOf('day');
              } else {
                return null;
              }
            }}
          />
        )}
      </FormItem>
    );
  },
  DateTimePicker_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    requiredFlag,
    editableFlag,
    attributes,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    configName,
    // pattern,
  }) => {
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 处理特殊标准字段必填逻辑
    const datePickRequiredFlag = datePickRequired(requiredFlag, fieldCode, record, configName);
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const attributeProps = attributesProps(attributes);
    const { disabled, defaultValue, ...other } = attributeProps;
    const valueFormat =
      (record || dataSource)[fieldCode] &&
      moment((record || dataSource)[fieldCode], DEFAULT_DATETIME_FORMAT);
    const defaultValueFormat = defaultValue && moment(defaultValue, DEFAULT_DATETIME_FORMAT);
    const initialValue = isUndefined((record || dataSource)[fieldCode])
      ? defaultValueFormat
      : valueFormat;
    const configProps = {
      requiredFlag: datePickRequiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      // render: moment,
      // pattern,
      fxProps,
      configName,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <DatePicker
            {...other}
            disabled={changFlag || newDisabled}
            format={DEFAULT_DATETIME_FORMAT}
            showTime
            disabledDate={currentDate => {
              if (fieldCode === 'dateFrom') {
                return (
                  record &&
                  record.$form.getFieldValue('dateTo') &&
                  moment(record.$form.getFieldValue('dateTo')).isBefore(currentDate, 'day')
                );
              } else if (fieldCode === 'dateTo') {
                return (
                  record &&
                  record.$form.getFieldValue('dateFrom') &&
                  moment(record.$form.getFieldValue('dateFrom')).isAfter(currentDate, 'day')
                );
              } else {
                return null;
              }
            }}
          />
        )}
      </FormItem>
    );
  },
  Input_: ({
    dataSource = {},
    fieldDescription,
    attributes,
    fieldCode,
    requiredFlag,
    editableFlag,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    inputOnAfter = '',
    mobileAddonBefore = '',
    mobilephoneFlag = false,
    internationalTelCode = false,
    configName,
    formObject = {},
    fxProps,
  }) => {
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 正则条件控制
    const patternFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkPattern: true,
    });

    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const attributeObject = attributesProps(attributes);
    const { disabled, displayFieldCode, pattern, defaultValue, ...other } = attributeObject;
    let initialValue = (record || dataSource)[fieldCode];
    initialValue = isUndefined(initialValue) ? defaultValue : initialValue;
    // （采购方上传的附件和企业认证上传的附件）的“附件类型”“附件描述”不允许修改
    const attachmentDisable =
      fieldCode === 'attachmentType' && (record.purchaserFlag || record.companyAttachmentId);
    if (fieldCode === 'attachmentType' && (record.purchaserFlag || record.companyAttachmentId)) {
      return (record || dataSource)[`${fieldCode}Meaning`];
    }
    // 处理地址页签地区字段
    let newFieldCode = fieldCode;
    if (configName === 'sslmInvestgAddress' && fieldCode === 'regionId') {
      initialValue = (record || dataSource)[displayFieldCode];
      newFieldCode = displayFieldCode;
      (record ? record.$form.getFieldDecorator : getFieldDecorator)(fieldCode, {
        initialValue: (record || dataSource)[fieldCode],
      });
      (record ? record.$form.getFieldDecorator : getFieldDecorator)('isLeaf', {
        initialValue: true,
      });
    }
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode: newFieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      // render: moment,
      pattern,
      configName,
      record,
      patternFlag,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled, patternFlag: newPatternFlag } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          newFieldCode,
          decoratorProps({ ...configProps, patternFlag: newPatternFlag })
        )(
          <Input
            style={{ width: '100%' }}
            {...other}
            disabled={changFlag || newDisabled || attachmentDisable}
            dbc2sbc={false}
            addonAfter={inputOnAfter}
            addonBefore={mobileAddonBefore}
          />
        )}
      </FormItem>
    );
  },
  InputNumber_: ({
    dataSource = {},
    fieldDescription,
    attributes,
    fieldCode,
    requiredFlag,
    editableFlag,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    configName,
  }) => {
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const attributeProps = attributesProps(attributes);
    const { disabled, defaultValue, ...other } = attributeProps;
    let initialValue = (record || dataSource)[fieldCode];
    initialValue = isUndefined((record || dataSource)[fieldCode]) ? defaultValue : initialValue;

    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(<InputNumber {...other} disabled={changFlag || newDisabled} />)}
      </FormItem>
    );
  },
  Checkbox_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    attributes,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    editableFlag,
    configName,
    ...rest
  }) => {
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);

    const attributeProps = attributesProps(attributes, rest);
    const { disabled, relationField, defaultValue, ...other } = attributeProps;
    let initValue = (record || dataSource)[fieldCode];
    initValue = isUndefined(initValue) ? defaultValue : initValue;
    // 获取子级联配置字段名
    if (relationField) {
      other.onChange = e => {
        if (!e.target.value) {
          // 获取要重置的默认值
          const resetDefaultValue = record.$form.getFieldValue(`${relationField}DefaultValue`);
          record.$form.setFieldsValue({ [relationField]: resetDefaultValue });
        }
      };
    }
    const configProps = {
      requiredFlag: 0,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      // cascadeFieldRequiredFlag: false,
      val: +initValue || 0,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(<Checkbox disabled={changFlag || newDisabled} {...other} />)}
      </FormItem>
    );
  },
  Upload_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    attributes,
    requiredFlag,
    editableFlag,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    configName,
    setLoading,
  }) => {
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    const { setFieldsValue, getFieldsValue, registerField } = record?.$form || formObject || {};
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField: '',
      newRequiredFlag: false,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: (record || dataSource)[fieldCode],
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    const attributeProps = attributesProps(attributes);
    const { disabled, ...other } = attributeProps;
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    let newDisabled = disabled;
    // 附件组件只读也会渲染成编辑组件，所以只读时过滤
    const readOnly = changFlag || fieldCode === 'purchaserAttachmentUuid' || disabled;
    if (!readOnly) {
      const { disabled: fxDisabled } = handleFxConfig(params);
      newDisabled = fxDisabled;
    }
    const finalReadOnly = changFlag || fieldCode === 'purchaserAttachmentUuid' || newDisabled;
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <Upload
            attachmentUUID={(record || dataSource)[fieldCode]}
            {...other}
            viewOnly={finalReadOnly}
            filePreview
            fileSize={500 * 1024 * 1024}
            crossTenant
            uploadSuccess={() => {
              if (fieldCode === 'supplierAttachmentUuid' || fieldCode === 'attachmentUuid') {
                registerField('fileUpdateFlag');
                setFieldsValue({
                  lastUploadDate: moment(new Date(), DEFAULT_DATE_FORMAT),
                  fileUpdateFlag: true,
                });
              }
            }}
            removeCallback={() => {
              if (fieldCode === 'supplierAttachmentUuid' || fieldCode === 'attachmentUuid') {
                registerField('fileUpdateFlag');
                setFieldsValue({
                  lastUploadDate: moment(new Date(), DEFAULT_DATE_FORMAT),
                  fileUpdateFlag: true,
                });
              }
            }}
            onCloseUploadModal={() => {
              if (
                !finalReadOnly &&
                record &&
                record._status === 'update' &&
                ['sslmInvestgAttachment', 'sslmInvestgAuth'].includes(configName)
              ) {
                const { lastUploadDate: lastUploadDateValue, fileUpdateFlag } = getFieldsValue();
                if (fileUpdateFlag) {
                  const formatValue =
                    lastUploadDateValue && lastUploadDateValue.format(DEFAULT_DATE_FORMAT);
                  const payload = {
                    curentEditrecord: record,
                    lastUploadDate: formatValue,
                    configName,
                  };
                  handleUploadDate(payload, setLoading);
                }
              }
            }}
          />
        )}
      </FormItem>
    );
  },
  TextArea_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    attributes,
    requiredFlag,
    editableFlag,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    configName,
  }) => {
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const attributeProps = attributesProps(attributes);
    const { disabled, defaultValue, ...other } = attributeProps;
    let initialValue = (record || dataSource)[fieldCode];
    initialValue = isUndefined(initialValue) ? defaultValue : initialValue;

    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem
        {...FormItemProps(fieldDescription, edid, {
          labelCol: { span: 6 },
          wrapperCol: { span: 18 },
        })}
      >
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(<TextArea {...other} disabled={changFlag || newDisabled} />)}
      </FormItem>
    );
  },
  Lov_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    lovCode,
    tenantId,
    requiredFlag,
    editableFlag,
    edid = false,
    attributes = [],
    getFieldDecorator,
    record,
    changFlag,
    additional = {},
    rowKey,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    configName,
    fxProps,
    ...rest
  }) => {
    // 获取父级级联配置字段名
    const parentRelationField = getParentRelationField(attributes);
    const valueMeaning = getLovMeaning(attributes);
    let parentValue = null;
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    const { attributeValue } = useMemo(
      () => attributes.find(({ attributeName }) => attributeName === 'queryParams') || {},
      []
    );
    // 级联子级是否禁用
    // let currentFieldChangFlag = false;
    if (parentRelationField) {
      parentValue = record.$form.getFieldValue(parentRelationField);
      // currentFieldChangFlag = !parentValue;
    }
    // const value_ = (additional[(record || {})[rowKey]] || {})[attributeValue];
    const pay = useMemo(
      () => queryParams(attributeValue, record, additional, rowKey, tenantId, parentRelationField),
      [parentValue]
    );
    const attributeProps = attributesProps(attributes, rest);
    const { disabled, defaultValue, ...other } = attributeProps;
    let initialValue = (record || dataSource)[fieldCode];
    initialValue = isUndefined(initialValue) ? defaultValue : initialValue;
    let textValue =
      (record || dataSource)[`${fieldCode}Meaning`] || (record || dataSource)[fieldCode];
    textValue = isUndefined((record || dataSource)[fieldCode]) ? valueMeaning : textValue;

    const otherProps = {
      ...other,
      queryParams: { ...pay, tenantId },
    };
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <Lov
            style={{ width: '100%' }}
            code={lovCode}
            textValue={textValue}
            {...otherProps}
            disabled={changFlag || newDisabled}
          />
        )}
      </FormItem>
    );
  },
  TransferLov_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    lovCode,
    tenantId,
    requiredFlag,
    editableFlag,
    edid = false,
    attributes = [],
    getFieldDecorator,
    record,
    changFlag,
    additional = {},
    rowKey,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject,
    fxProps,
    configName,
    ...rest
  }) => {
    // 获取父级级联配置字段名
    const parentRelationField = getParentRelationField(attributes);
    const valueMeaning = getLovMeaning(attributes);
    const { attributeValue } = useMemo(
      () => attributes.find(({ attributeName }) => attributeName === 'queryParams') || {},
      []
    );
    const value_ = (additional[(record || {})[rowKey]] || {})[attributeValue];
    const pay = useMemo(
      () => queryParams(attributeValue, record, additional, rowKey, tenantId, parentRelationField),
      [value_]
    );
    const attributeProps = attributesProps(attributes, rest);
    const { disabled, defaultValue, ...other } = attributeProps;
    let initialValue = (record || dataSource)[fieldCode];
    initialValue = isUndefined(initialValue) ? defaultValue : initialValue;
    let textValue =
      (record || dataSource)[`${fieldCode}Meaning`] || (record || dataSource)[fieldCode];
    textValue = isUndefined((record || dataSource)[fieldCode]) ? valueMeaning : textValue;
    const otherProps = {
      ...other,
      queryParams: { ...pay, tenantId },
    };
    // 点击编辑时判断当前字段是否可编辑
    // let currentFieldFlag = false;
    // if (parentRelationField) {
    //   const parentValue = record.$form.getFieldValue(parentRelationField);
    //   currentFieldFlag = !parentValue;
    // }
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField: null,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      // cascadeFieldRequiredFlag,
      val: initialValue,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <TransferLov
            style={{ width: '100%' }}
            code={lovCode}
            translateData={textValue}
            {...otherProps}
            // disabled={currentFieldFlag}
            viewOnly={changFlag || newDisabled}
          />
        )}
      </FormItem>
    );
  },
  Switch_: ({
    dataSource = {},
    fieldDescription,
    fieldCode,
    attributes,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject,
    fxProps,
    editableFlag,
    configName,
  }) => {
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const attributeProps = attributesProps(attributes);
    const { disabled, defaultValue, ...other } = attributeProps;
    let initialValue = +(record || dataSource)[fieldCode] || 0;
    initialValue = isUndefined((record || dataSource)[fieldCode])
      ? Number(defaultValue)
        ? 1
        : 0
      : initialValue;
    const configProps = {
      requiredFlag: 0,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      // cascadeFieldRequiredFlag,
      val: initialValue,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };

    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(<Switch {...other} disabled={changFlag || newDisabled} />)}
      </FormItem>
    );
  },
  TLEditor_: ({
    dataSource = {},
    fieldDescription,
    attributes,
    fieldCode,
    requiredFlag,
    editableFlag,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    mobilephoneFlag = false,
    internationalTelCode = false,
    formObject = {},
    fxProps,
    configName,
  }) => {
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    const attributeObject = attributesProps(attributes);
    const { disabled, displayFieldCode, ...other } = attributeObject;
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: (record || dataSource)[displayFieldCode] || (record || dataSource)[fieldCode],
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
      configName,
      // render: moment,
      // pattern,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          fieldCode,
          decoratorProps(configProps)
        )(
          <TLEditor
            {...other}
            label={fieldDescription}
            field={fieldCode}
            token={(record || dataSource)._token}
            disabled={changFlag || newDisabled}
          />
        )}
      </FormItem>
    );
  },
  Cascader_: ({
    dataSource = {},
    fieldDescription,
    attributes,
    fieldCode,
    requiredFlag,
    editableFlag,
    edid = false,
    getFieldDecorator,
    record,
    changFlag,
    newRequiredFlag,
    internationalTelCode = false,
    configName,
    formObject = {},
    fxProps,
    attachmentTypeList = [],
  }) => {
    const currentData = record || dataSource;
    const formFlag = !isEmpty(formObject); // 是否是表单
    const currentForm = formFlag ? formObject : record.$form;
    const { setFieldsValue, getFieldDecorator: newGetFieldDecorator } = currentForm;
    // 页面刚加载完毕，必输控制
    const cascadeFieldRequiredFlag = handleFieldAttributes({
      record,
      formObject,
      attributes,
      checkRequired: true,
    });
    // 正则条件
    // const patternFlag = handleFieldAttributes({
    //   record,
    //   formObject,
    //   attributes,
    //   checkPattern: true,
    // });
    // 获取关联配置字段名
    const cascadeField = fieldRequiredFlag(attributes);
    // （采购方上传的附件和企业认证上传的附件）的“附件类型”不允许修改
    const attachmentDisable =
      fieldCode === 'attachmentType' && (record.purchaserFlag || record.companyAttachmentId);
    const attributesObject = attributesProps(attributes);
    const {
      disabled,
      displayFieldCode,
      mobilephoneFlag,
      pattern,
      defaultValue,
      placeholder,
      ...others
    } = attributesObject;
    if (fieldCode === 'attachmentType' && (record.purchaserFlag || record.companyAttachmentId)) {
      return currentData[`${fieldCode}Meaning`];
    }
    let initialValue = currentData[fieldCode];
    // 处理附件类型字段
    let newFieldCode = fieldCode;
    if (fieldCode === 'attachmentType') {
      newFieldCode = 'attachmentTypeMerge';
      // h0组件不支持单值渲染
      initialValue =
        currentData.parentAttachmentType && currentData.attachmentType
          ? [currentData.parentAttachmentType, currentData.attachmentType]
          : null;
      newGetFieldDecorator('parentAttachmentType', {
        initialValue: currentData.parentAttachmentType,
      });
      newGetFieldDecorator('attachmentType', {
        initialValue: currentData.attachmentType,
      });
    }
    const configProps = {
      requiredFlag,
      fieldDescription,
      fieldCode: newFieldCode,
      cascadeField,
      newRequiredFlag,
      mobilephoneFlag,
      internationalTelCode,
      cascadeFieldRequiredFlag,
      val: initialValue,
      // render: moment,
      // pattern,
      configName,
      record,
      // patternFlag,
      currentRecord: record || dataSource,
      form: record?.$form || formObject || {},
      fxProps,
    };
    // 处理fx编辑属性
    const params = {
      editableFlag,
      disabled,
      ...configProps,
    };
    const { disabled: newDisabled } = handleFxConfig(params);
    return (
      <FormItem {...FormItemProps(fieldDescription, edid)}>
        {(record ? record.$form.getFieldDecorator : getFieldDecorator)(
          newFieldCode,
          decoratorProps(configProps)
        )(
          <Cascader
            style={{ width: '100%' }}
            {...others}
            disabled={changFlag || attachmentDisable || newDisabled}
            fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
            options={attachmentTypeList.filter(n => n.children)}
            expandTrigger="hover"
            placeholder={placeholder || ''}
            onChange={data => {
              if (!isEmpty(data) && isArray(data)) {
                setFieldsValue({
                  parentAttachmentType: data[0],
                  attachmentType: data[1],
                });
              } else {
                setFieldsValue({
                  parentAttachmentType: null,
                  attachmentType: null,
                });
              }
            }}
          />
        )}
      </FormItem>
    );
  },
};

const ThemeContext = createContext({});

const ScrollArea = ({ configList = [], customizeCollapse = () => {} }) => {
  const [collapsedKeys, setCollapsedKeys] = useState([]);
  return customizeCollapse(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE',
    },
    <Collapse className="form-collapse" onChange={keys => setCollapsedKeys(keys)}>
      {(configList || []).map(
        ({ tab, configDescription, configName, isRequired, titleTooltip, ...rest }) => {
          const tip = isRequired
            ? intl
                .get('sslm.supplierEntryDetail.view.tooltip.leastOneLine', {
                  name: configDescription,
                  number: isRequired,
                })
                .d(`请至少填写${isRequired}条${configDescription}`)
            : titleTooltip;
          return (
            <Panel
              key={configName}
              id={configName}
              header={() => {
                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: '0', marginLeft: '16px' }}>{configDescription}</h3>
                    <a style={{ marginLeft: '16px' }}>
                      {collapsedKeys.includes(configName)
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapsedKeys.includes(configName) ? 'up' : 'down'} />}
                    </a>
                    <div
                      style={{
                        display: 'inline-block',
                        marginLeft: 24,
                        width: '70%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tip && (
                        <Tooltip placement="topLeft" title={tip}>
                          {tip}
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              }}
              showArrow={false}
            >
              {tab ? (
                <TabItemS {...{ ...rest }} />
              ) : isTable[configName] ? (
                <TableS {...{ configName, ...rest }} />
              ) : (
                <FromItemS {...{ configName, ...rest }} />
              )}
            </Panel>
          );
        }
      )}
    </Collapse>
  );
};

/**
 * 国别码前缀
 */
const MobileCodeAddon = ({ record, fieldCode }) => {
  const [idd, setIdd] = useSetState([]);

  useEffect(() => {
    queryIdpValue('HPFM.IDD').then(response => {
      const res = getResponse(response);
      if (res) {
        setIdd(res);
      }
    });
  }, []);

  return record.$form.getFieldDecorator('internationalTelCode', {
    initialValue: record.internationalTelCode || (idd[0] && idd[0].value) || '+86',
  })(
    <Select onChange={value => reValidationPhone(value, record, fieldCode)}>
      {map(idd, r => (
        <Select.Option key={r.value} value={r.value}>
          {r.meaning}
        </Select.Option>
      ))}
    </Select>
  );
};

/**
 * 区号改变 需要 重置手机号的校验状态
 */
const reValidationPhone = (value, record, fieldCode) => {
  const prevInternationalTelCode = record.$form.getFieldValue('internationalTelCode');
  if (value === '+86' || prevInternationalTelCode === '+86') {
    // 只要 +86 出现在 中间态 就需要重新手动校验 phone
    const curPhone = record.$form.getFieldValue(fieldCode);
    let errors = null;
    if (curPhone) {
      const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
      if (!testReg.test(curPhone)) {
        errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
      }
    }
    record.$form.setFields({
      [fieldCode]: {
        value: curPhone,
        errors,
      },
    });
  }
};

const FromItemS = compose(Form.create({ fieldNameProp: null }))(
  ({ investgCfHeaderId, configName, form, form: { getFieldDecorator } }) => {
    const { configData, allRef, queryDataSource, changFlag = false } = useContext(ThemeContext);

    const [state, setState] = useSetState({
      loading: false,
      dataSource: {},
    });

    const { loading, dataSource } = state;

    const fetch = useCallback(() => {
      setState({ loading: true });
      queryDataSource(fetchUrls[configName]).then(res => {
        if (res) {
          setState({
            loading: false,
            dataSource: res,
          });
        }
      });
    }, [configName]);

    useEffect(() => {
      fetch();
    }, []);

    allRef.current[configName] = { form, istable: false, investgCfHeaderId, dataSource, fetch };

    return (
      <Spin spinning={loading}>
        <Form>
          {groupRow(configData[investgCfHeaderId], getFieldDecorator, dataSource, changFlag, form)}
        </Form>
      </Spin>
    );
  }
);

const TableS = compose(Form.create({ fieldNameProp: null }))(
  ({ investgCfHeaderId, configName, form: { getFieldDecorator }, remark }) => {
    const {
      source,
      pubEdit,
      configData,
      allRef,
      queryDataSource,
      saveSmallDataSource,
      deleteDataSource,
      changeReqId,
      changFlag,
      savePermissionFlag,
      supplierInfoDefault,
      supplierInfoChangeRemote,
    } = useContext(ThemeContext);

    const { companyName = '' } = supplierInfoDefault || {};

    const [dataSource, setDataSource] = useState([]);
    const [attachmentTypeList, setAttachmentTypeList] = useState([]);

    const [loading, setLoading] = useState(false);

    const rowKey = rowKeys[configName];

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // 选中项发生改变时的回调
    const handleSelectChange = (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    };

    const {
      creatAdditional,
      additional,
      handleCountryChange,
      handleRegionChange,
      handleBankChange,
      handleBankFirmChange,
      handleStoreChange,
      handleAttrCountryChange,
      handleAttrRegionChange,
      handleLongEffectiveChange,
    } = useAddress(rowKey);

    const fetch = useCallback(async () => {
      setLoading(true);
      // 附件页签查询附件类型值集
      if (['sslmInvestgAttachment'].includes(configName)) {
        const list = await queryAttachmentTypeList({ organizationId: getCurrentOrganizationId() });
        if (list) {
          setAttachmentTypeList(list);
        }
      }
      queryDataSource(fetchUrls[configName]).then(res => {
        setLoading(false); // 暂时处理
        if (!isEmpty(res)) {
          const tableData = (res || []).map(item => {
            creatAdditional(item);
            return { ...item, changeReqId };
          });
          const remoteTableData = supplierInfoChangeRemote
            ? supplierInfoChangeRemote.process(
                'SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_INVESTIGATE_TABLE_DATASORUCE',
                tableData,
                {
                  source,
                  pubEdit,
                  changFlag,
                  configName,
                  savePermissionFlag,
                }
              )
            : tableData;
          setDataSource(remoteTableData);
        }
      });
    }, [configName]);

    useEffect(() => {
      fetch();
    }, []);

    allRef.current[configName] = { dataSource, istable: true, rowKey, investgCfHeaderId, fetch };

    const handleAdd = useCallback(() => {
      const indexId = uuidv4();
      const isFirst = isEmpty(dataSource);
      if (addressConfig[configName]) {
        creatAdditional({ [rowKey]: indexId });
      }
      const { countryId, countryName, countryCode, domesticForeignRelation, quickIndex } =
        supplierInfoDefault || {};
      setDataSource(arr => [
        {
          _status: 'create',
          [rowKey]: indexId,
          changeReqId,
          ...(domesticForeignRelation === 1 && configName === 'sslmInvestgBankAccount'
            ? {
                bankCountryId: countryId,
                bankCountryIdMeaning: countryName,
                bankCountryName: countryName,
                bankCountryCode: countryCode,
                bankAccountName: companyName,
                mainAccountFlag: isFirst ? 1 : 0,
                enabledFlag: 1,
              }
            : {
                enabledFlag: 1,
                mainAccountFlag: isFirst ? 1 : 0,
              }),
          ...(domesticForeignRelation === 1 && configName === 'sslmInvestgAddress'
            ? {
                countryId,
                countryIdMeaning: countryName,
                countryName,
                countryCode,
                quickIndex,
                enabled: 1,
                defaultContactFlag: isFirst ? 1 : 0,
              }
            : {
                enabled: 1,
                defaultContactFlag: isFirst ? 1 : 0,
              }),
        },
        ...arr,
      ]);
    }, [companyName, dataSource]);

    const handleSave = useCallback(async () => {
      const values = getEditTableData(dataSource, ['_status', rowKey], { force: true });

      if (values.length !== 0) {
        const saveParams = checkData(values, configData[investgCfHeaderId], configName);
        if (supplierInfoChangeRemote && supplierInfoChangeRemote.event) {
          const cuxRes = await supplierInfoChangeRemote.event.fireEvent('cuxHandleInvestigSave', {
            saveParams,
            configName,
            setLoading,
          });
          if (!cuxRes) {
            return;
          }
        }
        setLoading(true);
        saveSmallDataSource(saveUrls[configName], saveParams).then(res => {
          setLoading(false);
          if (res) {
            notification.success();
          }
          fetch();
        });
      }
    });

    const handleClean = useCallback(record => {
      setDataSource(arr => arr.filter(item => item[rowKey] !== record[rowKey]));
    }, []);

    const handleEdit = useCallback((edit, record) => {
      if (!edit) {
        // 修复取消编辑时，展示的是修改后的值
        record.$form.resetFields();
      }
      if (edit) {
        // 重新编辑时 重置lov查询条件
        creatAdditional(record);
      }
      setDataSource(arr =>
        arr.map(item => ({
          ...item,
          _status: item[rowKey] === record[rowKey] ? (edit && 'update') || '' : item._status,
        }))
      );
    }, []);

    // 行删除
    const handleDelete = useCallback(() => {
      const deleteRows = selectedRows.filter(n => n._status !== 'create');
      // 前端新建的数据
      const createRowKyes = selectedRows.filter(n => n._status === 'create').map(m => m[rowKey]);
      const newList = dataSource.filter(n => !createRowKyes.includes(n[rowKey]));
      Modal.confirm({
        title: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
        onOk: () => {
          setDataSource(newList);
          if (!isEmpty(deleteRows)) {
            setLoading(true);
            deleteDataSource({
              url: deleteUrls[configName],
              deleteRows,
            })
              .then(res => {
                if (res) {
                  setSelectedRowKeys([]);
                  setSelectedRows([]);
                  notification.success();
                  fetch();
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }
        },
      });
    }, [dataSource, selectedRows]);

    const etadil = {
      title: intl.get('hzero.common.button.action').d('操作'),
      dataIndex: 'operation',
      width: 100,
      render: (_, record) => {
        return (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a onClick={() => handleEdit(true, record)} disabled={changFlag}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        );
      },
    };

    const cols = (configData[investgCfHeaderId] || []).map(
      ({ componentType, fieldCode, fieldDescription, ...rest }) => {
        const { attributes } = rest;
        // 父级穿梭框配置的子级拓展字段名
        let transferLovField = null;
        if (componentType === 'TransferLov') {
          // 查询父级字段绑定的子级级联字段，用于级联清空，目前通过onChange来判断后续可能需要处理
          const isOnChange = attributes.find(item => item.attributeName === 'onChange');
          if (isOnChange) {
            // 获取要清空的级联字段，目前只支持1个级联字段
            transferLovField = getRelationField(attributes);
          }
        }
        // 获取国家，省份，地区字段
        let regionField = null;
        let cityField = null;
        const isOnChange = attributes.find(item => item.attributeName === 'onChange');
        if (isOnChange) {
          const relationFields = getRelationField(attributes);
          if (relationFields) {
            const fieldArray = relationFields.split(',') || [];
            if (fieldArray.length === 1) {
              cityField = fieldArray[0]?.trim();
            } else if (fieldArray.length > 1) {
              regionField = fieldArray[0]?.trim();
              cityField = fieldArray[1]?.trim();
            }
          }
        }
        const displayFieldCode = getDisplayFieldCode(attributes);
        // 判断是否开启手机号标识
        const mobilephoneFlag = attributes.find(
          item => item.attributeName === 'mobilephoneFlag' && item.attributeValue
        );
        return {
          title: fieldDescription,
          dataIndex: fieldCode,
          width: mobilephoneFlag ? 300 : 150,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              let inputOnAfter = '';
              if (configName === 'sslmInvestgAddress' && fieldCode === 'regionId') {
                inputOnAfter = <InputCascader {...{ record }} />;
              }
              const Component = componentTypeS[`${componentType}_`] || componentTypeS.Input_;
              const address = addressConfig[configName]
                ? {
                    additional,
                    handleCountryChange: handleCountryChange(record),
                    handleRegionChange: handleRegionChange(record),
                    handleBankChange: handleBankChange(record),
                    handleBankFirmChange: handleBankFirmChange(record),
                    handleStoreChange: handleStoreChange(record, transferLovField),
                    handleAttrCountryChange: handleAttrCountryChange(
                      record,
                      regionField,
                      cityField
                    ),
                    handleAttrRegionChange: handleAttrRegionChange(record, cityField),
                    handleLongEffectiveChange: handleLongEffectiveChange(record),
                    setLoading,
                  }
                : {};

              // 存储手机号国别码前缀
              let mobileAddonBefore = '';
              // 获取国别码
              const internationalTelCode =
                record.$form.getFieldValue('internationalTelCode') === '+86';
              if (mobilephoneFlag) {
                mobileAddonBefore = <MobileCodeAddon record={record} fieldCode={fieldCode} />;
              }

              return (
                <Component
                  {...{
                    rowKey,
                    fieldCode,
                    fieldDescription,
                    edid: true,
                    record,
                    ...address,
                    ...rest,
                    inputOnAfter,
                    mobileAddonBefore,
                    mobilephoneFlag,
                    internationalTelCode,
                    configName,
                    attachmentTypeList,
                  }}
                />
              );
            }
            if (componentType === 'Lov' || componentType === 'ValueList') {
              return record[`${fieldCode}Meaning`];
            }
            if (componentType === 'TransferLov') {
              const queryUsePostAttribute = attributes.find(
                item => item.attributeName === 'queryUsePost'
              );
              const postFlag = queryUsePostAttribute ? queryUsePostAttribute.attributeValue : false;
              return (
                <FormItem {...FormItemProps(fieldDescription, true)}>
                  {getFieldDecorator(
                    fieldCode,
                    decoratorProps({
                      requiredFlag: rest.requiredFlag,
                      fieldDescription,
                      fieldCode,
                      cascadeField: null,
                      mobilephoneFlag: false,
                      internationalTelCode: false,
                      cascadeFieldRequiredFlag: false,
                      val: (record || dataSource)[fieldCode],
                      currentRecord: record || dataSource,
                      configName,
                    })
                  )(
                    <TransferLov
                      style={{ width: '100%' }}
                      code={rest.lovCode}
                      queryUsePost={postFlag}
                      queryParams={{ tenantId: rest.tenantId }}
                      viewOnly
                    />
                  )}
                </FormItem>
              );
            }
            if (componentType === 'Upload') {
              const Component = componentTypeS[`${componentType}_`];
              return (
                <Component
                  {...{
                    rowKey,
                    fieldCode,
                    fieldDescription,
                    edid: true,
                    getFieldDecorator,
                    changFlag: true,
                    dataSource: record,
                    ...rest,
                  }}
                />
              );
            }
            if (componentType === 'Checkbox' || componentType === 'Switch') {
              return isNil(val) ? '' : yesOrNoRender(+val);
            }
            if (componentType === 'DatePicker') {
              return dateRender(val);
            }
            if (componentType === 'DateTimePicker') {
              return dateTimeRender(val);
            }
            if (configName === 'sslmInvestgAddress' && fieldCode === 'regionId') {
              return record[displayFieldCode] || val;
            }
            if (mobilephoneFlag && record.internationalTelMeaning && record[fieldCode]) {
              return `${record.internationalTelMeaning} | ${record[fieldCode]}`;
            }
            if (fieldCode === 'attachmentType') {
              return (
                (record || dataSource)[`${fieldCode}Meaning`] || (record || dataSource)[fieldCode]
              );
            }
            return val;
          },
        };
      }
    );

    cols.push(etadil);

    const scrollX = useMemo(() => sum(cols.map(n => (isNumber(n.width) ? n.width : 0))), [
      cols.length,
    ]);
    const columns = supplierInfoChangeRemote
      ? supplierInfoChangeRemote.process(
          'SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_INVESTIGATE_TABLE_COLS',
          cols,
          {
            source,
            pubEdit,
            changFlag,
            configName,
            savePermissionFlag,
          }
        )
      : cols;
    // 允许删除
    const isDelete = ['sslmInvestgAttachment'].includes(configName);
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: handleSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: +record.supplierAttFlag, // 供方附件必传时不可删除
        };
      },
    };

    const tableProps = {
      dataSource,
      columns,
      rowKey,
      pagination: false,
      bordered: true,
      scroll: { x: scrollX },
      rowSelection: isDelete ? rowSelection : null,
    };
    const addPermissionList = getButtonPermissionList(addPermissionCode, 'add');
    return (
      <Spin spinning={loading || false}>
        {remark && (
          <Alert
            message={remark}
            type="info"
            showIcon
            className={styles['sslm-supplier-update-investig-tab-alert']}
          />
        )}
        <div
          style={{ textAlign: 'right', paddingBottom: 16, display: changFlag ? 'none' : 'block' }}
        >
          <Button
            onClick={handleDelete}
            style={{ display: isDelete ? 'inline-block' : 'none' }}
            permissionList={[
              {
                code: deletePermissionCode[configName] || '',
                type: 'button',
                meaning: '删除',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button onClick={handleSave} style={{ marginLeft: 8 }}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={handleAdd}
            permissionList={addPermissionList[configName]}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        <EditTable {...tableProps} />
      </Spin>
    );
  }
);

const TabItemS = memo(
  ({ tablist = [], width, ...rest }) => {
    return (
      <div id={rest.configDescription}>
        <Tabs animated={false}>
          {tablist.map(({ configDescription, configName, ...items }) => {
            return (
              <TabPane tab={configDescription} key={configDescription}>
                {isTable[configName] ? (
                  <TableS {...{ configName, ...items }} />
                ) : (
                  <FromItemS {...{ configName, ...items }} />
                )}
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  },
  (o1, o2) => equals(o1.configDescription, o2.configDescription)
);

const useAddress = rowKey => {
  const [additional, setAdditional] = useState({});

  const setFieldList = useCallback(
    record => (code, data) =>
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          [code]: data,
        },
      })),
    []
  );

  const creatAdditional = useCallback(
    record =>
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          [rowKey]: record[rowKey],
          'this.getRegionQueryParams': record.countryId,
          'this.getCityQueryParams': record.regionId,
          'this.getBankFirmQueryParams': record.bankId, // 传参
          'this.getStoreQueryParams': null,
          'this.getAttrRegionQueryParams': null,
          'this.getAttrCityQueryParams': null,
          regionId: record.regionId,
          cityId: record.cityId,
          bankFirm: record.bankFirm,
          depositBank: record.depositBank,
        },
      })),
    []
  );

  const handleBankChange = useCallback(
    record => (value, lovRecord) => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getBankFirmQueryParams': lovRecord.bankId,
        },
      }));
      // eslint-disable-next-line no-param-reassign
      record.bankFirm = '';
      // eslint-disable-next-line no-param-reassign
      record.depositBank = '';
      record.$form.resetFields(['bankFirm', 'depositBank']);
      record.$form.setFieldsValue({
        bankFirm: null,
      });
      if (isEmpty(lovRecord)) {
        // eslint-disable-next-line no-param-reassign
        record.bankName = '';
        record.$form.resetFields(['bankName']);
      }
    },
    [rowKey]
  );

  const handleBankFirmChange = useCallback(
    record => (value, lovRecord) => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getBankFirmQueryParams': lovRecord.bankId,
        },
      }));
      if (isEmpty(lovRecord)) {
        // eslint-disable-next-line no-param-reassign
        // record.depositBank = '';
        // record.$form.resetFields(['depositBank']);
        record.$form.setFieldsValue({
          depositBank: null,
          bankId: null,
          bankCode: null,
          bankName: null,
          bankBranchCode: null,
        });
      }
    },
    [rowKey]
  );

  // 门店信息改变事件
  const handleStoreChange = useCallback(
    (record, transferLovField) => value => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getStoreQueryParams': value,
        },
      }));
      // 切换门店信息情空失效门店
      if (!value) {
        record.$form.setFieldsValue({ [transferLovField]: null });
      }
    },
    [rowKey]
  );

  const handleCountryChange = useCallback(
    record => (value, lovRecord) => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getRegionQueryParams': value,
        },
      }));
      record.$form.getFieldDecorator('regionId');
      record.$form.getFieldDecorator('cityId');
      record.$form.getFieldDecorator('regionPathName');

      record.$form.setFieldsValue({
        regionId: '',
        cityId: '',
        regionPathName: '',
        countryCode: lovRecord ? lovRecord.countryCode : null,
        quickIndex: lovRecord ? lovRecord.quickIndex : null,
      });
    },
    [rowKey]
  );

  const handleRegionChange = useCallback(
    record => value => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getCityQueryParams': value,
        },
      }));
      // eslint-disable-next-line no-param-reassign
      record.cityId = '';
      record.$form.resetFields(['cityId']);
    },
    []
  );

  // 处理动态字段为国家的事件
  const handleAttrCountryChange = useCallback(
    (record, regionField, cityField) => value => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getAttrRegionQueryParams': value,
        },
      }));
      record.$form.setFieldsValue({ [regionField]: null, [cityField]: null });
    },
    [rowKey]
  );

  // 处理动态字段为省份的事件
  const handleAttrRegionChange = useCallback(
    (record, cityField) => value => {
      setAdditional(t => ({
        ...t,
        [record[rowKey]]: {
          ...t[record[rowKey]],
          'this.getAttrCityQueryParams': value,
        },
      }));
      record.$form.setFieldsValue({ [cityField]: null });
    },
    [rowKey]
  );

  // 附件信息长期有效触发事件
  const handleLongEffectiveChange = useCallback(
    record => e => {
      setTimeout(() => {
        // 校验"文件到期日"必输性
        record.$form.validateFields(['expirationDate'], { force: true });
        if (!e.target.value) {
          record.$form.setFieldsValue({ expirationDate: undefined });
        }
      }, 300);
    },
    [rowKey]
  );

  return {
    additional,
    setFieldList,
    creatAdditional,
    handleCountryChange,
    handleRegionChange,
    handleBankChange,
    handleBankFirmChange,
    handleStoreChange,
    handleAttrCountryChange,
    handleAttrRegionChange,
    handleLongEffectiveChange,
  };
};

const queryParams = (
  keys = '',
  record,
  additional,
  rowKey,
  tenantId,
  parentRelationField = null
) => {
  const value = keys ? additional[record[rowKey]][keys] : '';
  if (keys === 'this.getRegionQueryParams' && value) {
    return {
      countryId: value,
    };
  }
  if (keys === 'this.getCityQueryParams' && value) {
    return {
      parentRegionId: value,
    };
  }
  if (keys === 'this.getBankFirmQueryParams' && value) {
    return {
      bankId: value,
    };
  }
  if (keys === 'this.getStoreQueryParams') {
    const storeValue = parentRelationField
      ? record.$form.getFieldValue(parentRelationField)
      : undefined;
    return {
      organizationCodeRange: value || storeValue,
    };
  }
  if (keys === 'this.getAttrRegionQueryParams') {
    const countryValue = parentRelationField
      ? record.$form.getFieldValue(parentRelationField)
      : undefined;
    return {
      countryId: countryValue || value,
    };
  }
  if (keys === 'this.getAttrCityQueryParams') {
    const storeValue = parentRelationField
      ? record.$form.getFieldValue(parentRelationField)
      : undefined;
    return {
      parentRegionId: value || storeValue,
    };
  }
  return { tenantId };
};

export const useQuestionnaire = ({
  source,
  pubEdit,
  dispatch,
  match: {
    params: { changeReqId },
    path,
  },
  supplierInform: {
    detailHeader: headerInfo = {},
    detailHeader: { reqStatus = '' } = {},
    collapseCodeList = [],
  } = {},
  enterpriseInform: { supplierInfoDefault } = {},
  location,
  customizeCollapse = () => {},
  mustCompanyTabObj,
  supplierInfoChangeRemote,
}) => {
  const isPub = path.includes('/pub/');
  const routerParam = useMemo(() => querystring.parse(location.search.substr(1)), []);
  const { partnerTenantId, readOnly = 0 } = routerParam;
  const readOnlyFlag = !!Number(readOnly); // 页面只读不可编辑
  const { companyName = '' } = supplierInfoDefault || {};
  const [configList, configData] = useInvestListData(
    dispatch,
    isTab(mustCompanyTabObj),
    changeReqId,
    partnerTenantId,
    mustCompanyTabObj
  );
  const [savePermissionFlag, setSavePermissionFlag] = useState(true);

  const allRef = useRef({});

  const disabledFlag =
    readOnlyFlag ||
    !(reqStatus === 'NEW' || reqStatus === 'REJECTED' || reqStatus === 'CONFIRM_REJECTED') ||
    !savePermissionFlag ||
    isPub;

  const remoteEditFlag = supplierInfoChangeRemote
    ? supplierInfoChangeRemote.process('SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_EDIT', true, headerInfo)
    : true;

  useEffect(() => {
    checkPermission(['srm.partner.my-partner.supplier-inform-change.ps.doc.save']).then(res => {
      if (res) {
        const { controllerType } = head(res);
        setSavePermissionFlag(!['disabled', 'hidden'].includes(controllerType));
      }
    });
  }, []);

  const changeApprovalCode = useCallback(
    ({ lovCode, ...rest }) =>
      dispatch({
        type: 'supplierInform/queryValueSet',
        payload: {
          lovCode,
          ...rest,
        },
      }),
    []
  );

  const queryDataSource = useCallback(
    url =>
      dispatch({
        type: 'supplierInform/queryDataSource',
        payload: {
          url,
          changeReqId,
          dataSource: 2, // 1企业信息变更 2供应商信息变更
          desensitize: false,
        },
      }),
    [changeReqId]
  );

  const saveSmallDataSource = useCallback(
    (url, tableList) =>
      dispatch({
        type: 'supplierInform/saveSmallDataSource',
        payload: {
          url,
          tableList,
          desensitize: false,
        },
      }),
    []
  );

  const deleteDataSource = useCallback(
    ({ url, deleteRows }) =>
      dispatch({
        type: 'enterpriseInform/deleteDataSource',
        payload: {
          url,
          deleteRows,
        },
      }),
    []
  );

  const allSave = useCallback(() => {
    let allErrs = false;
    const allData = {};

    map(allRef.current, ({ istable, form, dataSource, rowKey, investgCfHeaderId }, key) => {
      if (istable) {
        const values = getEditTableData(dataSource, ['_status', rowKey], { force: true });

        const isEditing = !!dataSource.find(d => d._status === 'create' || d._status === 'update');

        if (isEditing) {
          if (Array.isArray(values) && values.length !== 0) {
            allData[key] = checkData(values, configData[investgCfHeaderId], key);
          } else {
            allErrs = true;
          }
        }
      } else {
        form.validateFields({ force: true }, (err, values) => {
          if (err) {
            allErrs = true;
          }
          // eslint-disable-next-line prefer-destructuring
          allData[key] = {
            ...dataSource,
            ...checkData([values], configData[investgCfHeaderId])[0],
          };
        });
      }
    });

    return {
      allErrs,
      allData,
    };
  }, [allRef, configData]);

  const allFetch = useCallback(() => {
    map(allRef.current, ({ fetch }) => {
      fetch();
    });
  }, []);

  return useMemo(
    () => ({
      QuestionLink: configList.map(({ investgCfHeaderId, configDescription, configName }) => {
        if (collapseCodeList.includes(configName)) {
          return <Link key={investgCfHeaderId} title={configDescription} href={`#${configName}`} />;
        } else {
          return null;
        }
      }),

      QuestionArea: (
        <ThemeContext.Provider
          value={{
            source,
            pubEdit,
            configData,
            changeApprovalCode,
            allRef,
            queryDataSource,
            saveSmallDataSource,
            deleteDataSource,
            changeReqId,
            savePermissionFlag,
            changFlag: disabledFlag || !remoteEditFlag,
            supplierInfoDefault,
            supplierInfoChangeRemote,
          }}
        >
          <ScrollArea configList={configList} customizeCollapse={customizeCollapse} />
        </ThemeContext.Provider>
      ),
      reqStatus,
      allSave,
      allFetch,
    }),
    [configList.length, reqStatus, companyName]
  );
};

const checkData = (values, items = []) => {
  const valueType1 = [];
  const valueType2 = [];
  const valueType3 = [];
  const valueType4 = [];
  items.forEach(({ fieldCode, componentType, attributes = [] }) => {
    if (componentType === 'Checkbox' || componentType === 'Switch') {
      valueType1.push(fieldCode);
    } else if (componentType === 'DatePicker') {
      valueType2.push(fieldCode);
    } else if (componentType === 'DateTimePicker') {
      valueType3.push(fieldCode);
    } else if (componentType === 'ValueList') {
      if (!isEmpty(attributes)) {
        const { attributeValue = false } =
          attributes.find(item => item.attributeName === 'multiple') || {};
        if (attributeValue) {
          valueType4.push(fieldCode);
        }
      }
    }
  });

  const value = values.map(item => {
    const item_ = { ...item };
    // 处理历史模板隐藏【最后上传时间】，导致数据格式未格式化，保存报错
    item_.lastUploadDate =
      item_.lastUploadDate && moment(item_.lastUploadDate).format(DEFAULT_DATE_FORMAT);
    valueType1.forEach(key => {
      item_[key] = item_[key] ? 1 : 0;
    });
    valueType2.forEach(key => {
      item_[key] = item_[key] && moment(item_[key]).format(DEFAULT_DATE_FORMAT);
    });
    valueType3.forEach(key => {
      item_[key] = item_[key] && moment(item_[key]).format(DEFAULT_DATETIME_FORMAT);
    });
    valueType4.forEach(key => {
      item_[key] = item_[key] && (item_[key] || []).join();
    });
    return item_;
  });
  return value;
};

// 获取关联拓展字段
const fieldRequiredFlag = attributes => {
  const { attributeValue } = useMemo(
    () => attributes.find(({ attributeName }) => attributeName === 'cascadeField') || {},
    []
  );
  return attributeValue;
};

// 获取级联联拓展字段
const getRelationField = attributes => {
  const { attributeValue } = useMemo(
    () => attributes.find(({ attributeName }) => attributeName === 'relationField') || {},
    []
  );
  return attributeValue;
};

// 获取父级级联联拓展字段
const getParentRelationField = attributes => {
  const { attributeValue } = useMemo(
    () => attributes.find(({ attributeName }) => attributeName === 'parentRelationField') || {},
    []
  );
  return attributeValue;
};

// 获取值集翻译字段
const getLovMeaning = attributes => {
  const { attributeValueMeaning } = useMemo(
    () => attributes.find(({ attributeName }) => attributeName === 'defaultValue') || {},
    []
  );
  return attributeValueMeaning;
};

// 拆分条件
const handleFieldAttributes = ({
  record = {},
  formObject = {},
  attributes = [],
  checkRequired = false,
  checkPattern = false,
}) => {
  let conditionFieldRequired = false;
  let conditionFieldName = null;
  let conditionFieldValue = null;
  const attributeName = checkRequired ? 'conditionConfig' : checkPattern ? 'patternCondition' : '';
  const fieldAttribute = (attributes || []).find(item => item.attributeName === attributeName);
  if (fieldAttribute) {
    const { attributeValue } = fieldAttribute;
    if (attributeValue) {
      const fieldConfig = attributeValue.split(':') || [];
      if (fieldConfig.length > 1) {
        // eslint-disable-next-line prefer-destructuring
        conditionFieldName = fieldConfig[0]?.trim();
        // eslint-disable-next-line prefer-destructuring
        conditionFieldValue = fieldConfig[1]?.trim();
      }
    }
  }
  if (checkRequired) {
    const { getFieldValue } = record?.$form || formObject || {};
    if (conditionFieldName && getFieldValue) {
      const formFieldValue = getFieldValue(conditionFieldName);
      const fieldValue = isUndefined(formFieldValue) ? record[conditionFieldName] : formFieldValue;
      conditionFieldRequired = toString(fieldValue) === conditionFieldValue;
    }
    return conditionFieldRequired;
  } else if (checkPattern) {
    let flag = true;
    const { getFieldValue } = record?.$form || formObject || {};
    if (conditionFieldName && getFieldValue) {
      flag = getFieldValue(conditionFieldName) === conditionFieldValue;
    }
    return flag;
  }
};

// 获取显示值
const getDisplayFieldCode = attributes => {
  const { attributeValue } = useMemo(
    () => attributes.find(({ attributeName }) => attributeName === 'displayFieldCode') || {},
    []
  );
  return attributeValue;
};

// 处理地址信息地区级联
const InputCascader = ({ record }) => {
  const [cityData, setCityData] = useState([]);

  /**
   *  查询第一级地址列表
   */
  const fetchProvinceCity = useCallback(() => {
    setCityData([]);
    const countryId = record.$form.getFieldValue('countryId');
    loadCityData({ countryId }).then(response => {
      const data = getResponse(response);
      if (!isEmpty(data)) {
        const newCityResponse = data.map(n => {
          const m = {
            ...n,
          };
          m.isLeaf = false;
          return m;
        });
        setCityData(newCityResponse);
      } else {
        setCityData([]);
      }
    });
  }, []);

  /**
   * 地区级联下拉框动态加载数据
   */
  const handleQueryCity = useCallback((selectedOptions, newCityData = []) => {
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionId } = lastOption;
    lastOption.loading = true;

    loadCityData({ countryId, regionId }).then(res => {
      const data = getResponse(res);
      if (!isEmpty(data)) {
        const newCityResponse = data.map(n => {
          const m = {
            ...n,
          };
          // 地区级联判断最后一级地区
          m.isLeaf = !!Number(m.isLeaf);
          return m;
        });
        lastOption.loading = false;
        // 是否是最后一级地区
        if (!isEmpty(newCityResponse)) {
          lastOption.children = newCityResponse;
        }
        setCityData([...newCityData]);
      }
    });
  }, []);

  /**
   * 选择地区拼接
   */
  const handleSelectRegion = useCallback((value = {}, selectedOptions = []) => {
    const regionList = selectedOptions.map(region => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('/');
    const lastRecord = getLast(selectedOptions);
    const { isLeaf } = lastRecord || {};
    record.$form.setFieldsValue({
      regionPathName: region,
      regionId: getLast(value),
      isLeaf,
    });
  }, []);

  return (
    <Cascader
      onClick={() => fetchProvinceCity()}
      changeOnSelect
      showSearch={false}
      style={{ width: '100%' }}
      placeholder=""
      fieldNames={{ label: 'regionName', value: 'regionId' }}
      options={cityData || []}
      onChange={(value, selectedOptions) => handleSelectRegion(value, selectedOptions)}
      loadData={selectedOptions => handleQueryCity(selectedOptions, cityData)}
    >
      <Icon type="down" />
    </Cascader>
  );
};

// 处理条件配置渲染
const handleConditionConfig = (params = {}) => {
  const { record, config = {}, form } = params;
  const toolsObj = {
    record,
    targetForm: form,
  };
  // 处理不含条件配置的必输和编辑配置
  const originConfig = {
    required: !!config.required,
    editable: !!config.editable,
    pattern: !!config.pattern,
  };
  // 处理fx配置
  const newConfig = handleInvestgConfig(originConfig, config.fieldProperty, toolsObj);
  const { required, editable, pattern } = newConfig;
  return { required, disabled: !editable, patternFlag: !!pattern };
};

// 处理fx编辑
const handleFxConfig = (params = {}) => {
  const {
    editableFlag,
    disabled: oldDisabled,
    currentRecord,
    form,
    fxProps,
    patternFlag = true,
  } = params;
  const temptDisabledFlag = isNil(editableFlag) ? oldDisabled : !editableFlag;
  const param = {
    record: currentRecord,
    form,
    config: {
      fieldProperty: fxProps || [],
      editable: !temptDisabledFlag,
      pattern: !!patternFlag,
    },
  };
  const { disabled, patternFlag: newPatternFlag } = handleConditionConfig(param);
  return { disabled, patternFlag: newPatternFlag };
};

// 更新附件更新最后上传日期
const handleUploadDate = (param = {}, setLoading) => {
  const { curentEditrecord = {}, configName, ...others } = param;
  const { $form, supplierAttachmentUuid, attachmentUuid, ...otherFieldValues } = curentEditrecord;
  const payload = {
    ...otherFieldValues,
    ...others,
    configName,
    supplierAttachmentUuid,
    attachmentUuid,
  };
  const hasUUid = ['sslmInvestgAttachment'].includes(configName)
    ? supplierAttachmentUuid
    : attachmentUuid;
  if (hasUUid) {
    if (setLoading) {
      setLoading(true);
    }
    updateUploadDateWithInvestigate(payload)
      .then(res => {
        if (getResponse(res)) {
          const { objectVersionNumber, lastUploadDate, expirationDate, longEffectiveFlag } = res;
          curentEditrecord.objectVersionNumber = objectVersionNumber;
          curentEditrecord.lastUploadDate = lastUploadDate;
          if ($form) {
            $form.setFieldsValue({
              lastUploadDate: lastUploadDate ? moment(lastUploadDate, DEFAULT_DATE_FORMAT) : null,
            });
          }
          // 如果是附件页签额外更新其他字段
          if (['sslmInvestgAttachment'].includes(configName)) {
            curentEditrecord.expirationDate = expirationDate;
            curentEditrecord.longEffectiveFlag = longEffectiveFlag;
            if ($form) {
              $form.setFieldsValue({
                expirationDate: expirationDate ? moment(expirationDate, DEFAULT_DATE_FORMAT) : null,
                longEffectiveFlag,
              });
            }
          }
        }
      })
      .finally(() => {
        if (setLoading) {
          setLoading(false);
        }
        curentEditrecord.$form.setFieldsValue({
          fileUpdateFlag: false,
        });
      });
  }
};
