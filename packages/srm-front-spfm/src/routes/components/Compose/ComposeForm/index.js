import React, { Fragment, useMemo } from 'react';
import moment from 'moment';
import { Form, Row, Col, Spin, Cascader, Icon, Select, Alert } from 'hzero-ui';
import {
  isArray,
  inRange,
  join,
  map,
  isEmpty,
  isFunction,
  toInteger,
  findIndex,
  isUndefined,
  compact,
  toString,
  round,
  last,
  isNil,
} from 'lodash';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getResponse, getCurrentLanguage } from 'utils/utils';
import { queryIdpValue } from 'services/api';

import { loadCityData } from '@/services/investigationService';
import {
  getColLayout,
  getGetValuePropFunc,
  getGetValueFromEventFunc,
  getInitialValue,
  getComponentType,
  renderDisabledField,
  getComponentProps,
  handleInvestgConfig,
} from './utils';
import { getDisplayValue } from '../utils';

const ComposeFormContext = React.createContext();
const { Item: FormItem } = Form;
let supplierAttRequiredFlag;
const language = getCurrentLanguage();

@Form.create({
  fieldNameProp: null,
  onValuesChange: async(props, fields) => {
    const {remote} = props;
    if(remote){
      await remote.event.fireEvent('cuxInvestigFieldsChange', {props, fields});
    }
  },
})
// eslint-disable-next-line no-unused-vars
class ComposeForm extends React.PureComponent {
  state = {
    // 存之前的 props 做比较用
    col: 3,
    fields: [],
    organizationId: undefined,
    editable: false,
    disableStyle: 'value',
    fieldLabelWidth: 150,
    context: undefined,
    // 渲染好的元素
    rows: [],
    init: false,
  };

  static defaultProps = {
    // 默认的属性
    col: 3,
    fields: [],
    dataSource: {},
    organizationId: undefined,
    editable: false,
    disableStyle: 'value',
    fieldLabelWidth: 150,
    context: undefined,
  };

  constructor(props) {
    super(props);
    this.init = this.init.bind(this);
    this.checkUpdate = this.checkUpdate.bind(this);
    this.getFormData = this.getFormData.bind(this);
    this.getDataSource = this.getDataSource.bind(this);
    this.getValidateDataSource = this.getValidateDataSource.bind(this);
    this.getEditFieldRequiredFlag = this.getEditFieldRequiredFlag.bind(this);
    this.handleCascader = this.handleCascader.bind(this);
    this.fetchProvinceCity = this.fetchProvinceCity.bind(this);
    this.handleQueryCity = this.handleQueryCity.bind(this);
    this.handleSelectRegion = this.handleSelectRegion.bind(this);
    this.handleReserveLength = this.handleReserveLength.bind(this);
    this.handleMobileCode = this.handleMobileCode.bind(this);
    this.reValidationPhone = this.reValidationPhone.bind(this);
    this.handleFieldMultiple = this.handleFieldMultiple.bind(this);

    this.handleUploadData = this.handleUploadData.bind(this);
    this.handleQueryParams = this.handleQueryParams.bind(this);
    this.handleFieldAttributes = this.handleFieldAttributes.bind(this);
    this.handleConditionConfig = this.handleConditionConfig.bind(this);
    this.setExtMapToForm = this.setExtMapToForm.bind(this);

    const {
      col,
      fields,
      organizationId,
      editable,
      disableStyle,
      context,
      fieldLabelWidth,
      dataSource: { regionIds = [], regionIdList = [] } = {},
    } = props;
    const valueList = !isEmpty(regionIdList) ? regionIdList : regionIds;
    this.state = {
      col,
      fields,
      organizationId,
      editable,
      disableStyle,
      context,
      fieldLabelWidth,
      rows: this.renderRows(),
      init: true,
      regionValue: valueList,
      cityData: [],
      idd: [], // 存储国别码集合
    };
  }

  componentDidMount() {
    this.init();
    const {
      onRef,
      onGetValidateDataSourceHook,
      onGetDataSourceHook,
      refEditComposeForm,
    } = this.props;
    // 传递 this, 获取表单数据的方法, 校验并获取表单数据的方法 传递出去
    if (isFunction(onRef)) {
      onRef(this);
    }
    if (isFunction(refEditComposeForm)) {
      refEditComposeForm(this);
    }
    if (isFunction(onGetValidateDataSourceHook)) {
      onGetValidateDataSourceHook(this.getValidateDataSource);
    }
    if (isFunction(onGetDataSourceHook)) {
      onGetDataSourceHook(this.getDataSource);
    }
  }

  /**
   * 值集查询
   */
  init() {
    queryIdpValue('HPFM.IDD').then((response) => {
      const res = getResponse(response);
      if (res) {
        this.setState({ idd: res });
      }
    });
  }

  /**
   * 获取表单数据
   * @returns
   * @memberof ComposeForm
   */
  getDataSource() {
    const { form, dataSource } = this.props;
    return {
      ...dataSource,
      ...form.getFieldsValue(),
    };
  }

  getFormData(resolve) {
    const { form, dataSource, fields = [], configName = '' } = this.props;
    const newFieldsValue = this.handleFieldMultiple({
      fields,
      fieldsValue: form.getFieldsValue(),
    });
    // 处理资金转化
    const { registeredCapital } = newFieldsValue;
    if (configName === 'sslmInvestgBasic') {
      newFieldsValue.registeredCapital =
        language === 'en_US'
          ? registeredCapital
            ? round(registeredCapital * 100, 6)
            : registeredCapital
          : registeredCapital;
    }
    resolve({
      ...dataSource,
      ...newFieldsValue,
    });
  }

  /**
   * 校验并获取表单数据
   * @returns
   * @memberof ComposeForm
   */
  getValidateDataSource(saveType) {
    const { form, tabTitle, parentTabTitle } = this.props;
    return new Promise((resolve, reject) => {
      if (saveType === 'NO_CHECK') {
        this.getFormData(resolve);
      } else {
        form.validateFields({ force: true }, err => {
          if (err) {
            reject({ err, tabTitle, parentTabTitle }); // eslint-disable-line
          } else {
            this.getFormData(resolve);
          }
        });
    }});
  }

  // 处理多选下拉框格式
  handleFieldMultiple({ fields = [], fieldsValue = {} }) {
    const newFieldsValue = fieldsValue || {};
    fields.forEach((field) => {
      if (field.componentType === 'ValueList' && !isEmpty(field.props)) {
        const { attributeValue = false } =
          field.props.find((item) => item.attributeName === 'multiple') || {};
        if (attributeValue) {
          newFieldsValue[field.fieldCode] = (newFieldsValue[field.fieldCode] || []).join();
        }
      }
    });
    return newFieldsValue;
  }

  /**
   * 检查属性变动 并调用对应的方法
   */
  checkUpdate() {
    const {
      col,
      fields,
      organizationId,
      editable,
      disableStyle,
      context,
      fieldLabelWidth,
      form,
    } = this.props;
    const {
      col: prevCol,
      fields: prevFields,
      organizationId: prevOrganizationId,
      editable: prevEditable,
      disableStyle: prevDisplayStyle,
      context: prevContext,
      fieldLabelWidth: prevFieldLabelWidth,
      init,
    } = this.state;
    if (init) {
      if (
        col !== prevCol ||
        fields !== prevFields ||
        organizationId !== prevOrganizationId ||
        editable !== prevEditable ||
        (editable === false && disableStyle !== prevDisplayStyle) ||
        context !== prevContext ||
        fieldLabelWidth !== prevFieldLabelWidth
      ) {
        // 之后是不是可以根据不同的属性的影响, 来决定影响不同的属性
        // 需要重新渲染 rows
        this.setState({
          col,
          fields,
          organizationId,
          editable,
          disableStyle,
          context,
          fieldLabelWidth,
          rows: this.renderRows(),
        });
        // 如果配置或者 dataSource 改变了需要重置表单
        form.resetFields();
      }
    }
  }

  /**
   * 渲染所有表单行
   */
  renderRows() {
    const {
      col,
      fields,
      rowKey,
      dataSource: { supplierAttFlag },
    } = this.props;
    if (rowKey === 'investgAttachmentId') {
      const supplierAttachmentUuidIndex = findIndex(fields, [
        'fieldCode',
        'supplierAttachmentUuid',
      ]);
      supplierAttRequiredFlag = toInteger(
        supplierAttFlag ||
          (supplierAttFlag === undefined &&
            supplierAttachmentUuidIndex > -1 &&
            fields[supplierAttachmentUuidIndex].requiredFlag)
      );
      // 根据行上的供方附件字段判断附件是否必传
      for (let i = 0; i < fields.length; i++) {
        switch (fields[i].fieldCode) {
          case 'supplierAttachmentUuid':
            fields[i].supplierAttRequiredFlag = supplierAttRequiredFlag;
            break;
          case 'supplierAttFlag':
            fields[i].componentType = 'Badge';
            fields[i].componentType = 'Badge';
            break;
          case 'freezeControlFlag':
            if (fields[i].props) {
              const propsIndex = findIndex(fields[i].props, ['attributeName', 'viewOnly']);
              if (propsIndex >= 0) {
                if (fields[i].props[propsIndex].attributeValue) {
                  fields[i].componentType = 'Badge';
                  fields[i].componentType = 'Badge';
                }
              }
            }
            break;
          default:
            break;
        }
      }
    }
    // 存放 生成的 Row
    const rows = [];
    // 所有的 字段的数组
    // 当前遍历的字段的下标
    let walkerIndex = 0;
    // 当前遍历的 Row 的 fields
    let rowFields = [];
    // 已经遍历的 Row 的 fields 的宽度和
    let rowCol = 0;
    // 当前遍历的 Row 的 field 的下标
    let rowIndex = 0;
    if (isArray(fields)) {
      for (; walkerIndex < fields.length; ) {
        const field = fields[walkerIndex];
        rowFields.push(field);
        if (inRange(field.colspan, 2, col + 1)) {
          rowCol += field.colspan;
        } else {
          rowCol += 1;
        }
        if (inRange(field.leftOffset, 1, col)) {
          rowCol += field.leftOffset;
        }
        if (inRange(field.rightOffset, 1, col)) {
          rowCol += field.rightOffset;
        }
        if (rowCol >= col) {
          if (rowCol > col && rowIndex > 0) {
            // 已经超过一列的宽度了,并且字段多于1个 需要 回退
            walkerIndex--;
            rowFields.pop();
          }
          // 生成 Row 并放入 rows
          rows.push(this.renderRow({ rowFields }));
          // 重置 遍历的 Row 的状态
          rowIndex = 0;
          rowCol = 0;
          rowFields = [];
        } else {
          // 继续向前遍历
          rowIndex++;
        }
        walkerIndex++;
      }
      if (rowIndex > 0) {
        rows.push(this.renderRow({ rowFields }));
      }
    }
    return rows;
  }

  /**
   * 渲染表单行
   * @param {Object[]} rowFields - 一行对应的字段
   */
  renderRow({ rowFields }) {
    const { disableStyle } = this.props;
    return (
      <Row
        type="flex"
        key={join(
          map(rowFields, (field) => field.fieldCode),
          '-'
        )}
        className={disableStyle === 'value' ? 'row-disabled' : ''}
      >
        {map(rowFields, (field) => {
          return this.renderComposeFormField({
            field,
            disableStyle,
          });
        })}
      </Row>
    );
  }

  /**
   * 处理编辑字段必输
   * @returns
   * @memberof ComposeForm
   */
  getEditFieldRequiredFlag(field = {}, isViewOnly = false, form, dataSource, configName = '') {
    // 配置的必输标识
    const defaultRequiredFlag =
      ((toInteger(field.requiredFlag) !== 0 && field.supplierAttRequiredFlag === undefined) ||
        toInteger(field.supplierAttRequiredFlag) === 1) &&
      !isViewOnly;

    // 处理动态必填
    const { props: fieldProps = [], fxProps = [] } = field;
    const componentsConfig = (fieldProps || []).find(
      (item) => item.attributeName === 'conditionConfig'
    );
    let conditionFieldName = null;
    let conditionFieldValue = null;
    let conditionFieldRequired = false;
    if (componentsConfig) {
      const { attributeValue } = componentsConfig;
      if (attributeValue) {
        const fieldConfig = attributeValue.split(':') || [];
        if (fieldConfig.length > 1) {
          conditionFieldName = fieldConfig[0].trim();
          conditionFieldValue = fieldConfig[1].trim();
        }
      }
    }
    if (conditionFieldName) {
      conditionFieldRequired =
        toString(form.getFieldValue(conditionFieldName)) === conditionFieldValue;
    }
    let oldRequiredFlag = defaultRequiredFlag;
    switch (field.fieldCode) {
      case 'expirationDate': {
        const longEffectiveFlag = form.getFieldValue('longEffectiveFlag');
        // 获取供方附件是否必传值
        const supplierAttFlag = form.getFieldValue('supplierAttFlag');
        const newSupplierAttFlag = isUndefined(supplierAttFlag)
          ? dataSource.supplierAttFlag
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
          oldRequiredFlag = !dataSource.longEffectiveFlag;
        } else {
          oldRequiredFlag = !longEffectiveFlag;
        }
        break;
      }
      case 'stockSymbol': {
        const listedCompanyFlag = form.getFieldValue('listedCompanyFlag');
        if (isUndefined(listedCompanyFlag)) {
          oldRequiredFlag = defaultRequiredFlag;
        } else {
          oldRequiredFlag = defaultRequiredFlag && listedCompanyFlag;
        }
        break;
      }
      case 'ownershipStructureAtmUuid': {
        const listedCompanyFlag = form.getFieldValue('listedCompanyFlag');
        if (isUndefined(listedCompanyFlag)) {
          oldRequiredFlag = defaultRequiredFlag;
        } else {
          oldRequiredFlag = defaultRequiredFlag && listedCompanyFlag;
        }
        break;
      }

      case 'dateFrom': {
        if (configName === 'sslmInvestgProservice') {
          const dateTo = form.getFieldValue('dateTo');
          oldRequiredFlag = defaultRequiredFlag || dateTo;
        } else {
          oldRequiredFlag = defaultRequiredFlag;
        }
        break;
      }
      case 'dateTo': {
        if (configName === 'sslmInvestgProservice') {
          const dateFrom = form.getFieldValue('dateFrom');
          oldRequiredFlag = defaultRequiredFlag || dateFrom;
        } else {
          oldRequiredFlag = defaultRequiredFlag;
        }
        break;
      }
      default:
        oldRequiredFlag = defaultRequiredFlag || conditionFieldRequired;
    }
    // 处理条件配置fx
    const params = {
      record: dataSource,
      form,
      config: {
        required: oldRequiredFlag,
        fieldProperty: fxProps,
      },
    };
    const { required } = this.handleConditionConfig(params);
    return required;
  }

  // 处理条件配置渲染
  handleConditionConfig(params = {}) {
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
    return { required, disabled: !editable, pattern: !!pattern };
  }

  /**
   * 处理省份级联
   * @returns
   * @memberof ComposeForm
   */
  handleCascader(form, dataSource) {
    const { cityData = [] } = this.state;
    const countryId = form.getFieldValue('countryId') || dataSource.countryId;

    return (
      <Cascader
        onClick={() => this.fetchProvinceCity(countryId)}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder={intl.get('hzero.common.validation.requireSelect', {
          name: intl.get('sslm.enterpriseInform.model.enterpriseInform.regionIds').d('地区'),
        })}
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={(value, selectedOptions) => this.handleSelectRegion(value, selectedOptions, form)}
        loadData={(selectedOptions) => this.handleQueryCity(selectedOptions)}
      >
        <Icon type="down" />
      </Cascader>
    );
  }

  /**
   *  查询地址列表
   */
  fetchProvinceCity(value) {
    this.setState(
      {
        cityData: [],
      },
      () => {
        loadCityData({ countryId: value }).then((response) => {
          const data = getResponse(response);
          if (!isEmpty(data)) {
            const newCityResponse = data.map((n) => {
              const m = {
                ...n,
              };
              m.isLeaf = false;
              return m;
            });
            this.setState({
              cityData: newCityResponse,
            });
          } else {
            this.setState({
              cityData: [],
            });
          }
        });
      }
    );
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  handleQueryCity(selectedOptions) {
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionId } = lastOption;
    lastOption.loading = true;
    loadCityData({ countryId, regionId }).then((res) => {
      const data = getResponse(res);
      if (!isEmpty(data)) {
        const newCityResponse = data.map((n) => {
          const m = {
            ...n,
          };
          // 地区级联判断最后一级地区
          m.isLeaf = !!Number(m.isLeaf);
          return m;
        });
        const { cityData } = this.state;
        lastOption.loading = false;
        // 是否是最后一级地区
        if (!isEmpty(newCityResponse)) {
          lastOption.children = newCityResponse;
        }
        this.setState({
          cityData: [...cityData],
        });
      }
    });
  }

  /**
   * 选择地区拼接
   */
  handleSelectRegion(value = {}, selectedOptions = [], form) {
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('/');
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    form.setFieldsValue({
      regionId: region,
      regionPathName: region,
      isLeaf,
    });
    this.setState({
      regionValue: value,
    });
  }

  // 处理属性
  handleFieldAttributes(commonProps = {}) {
    const { pattern, patternCondition, form } = commonProps;
    let patternFlag = !!pattern;
    if (patternCondition) {
      const fieldConfig = patternCondition.split(':') || [];
      if (fieldConfig.length > 1) {
        const fieldName = fieldConfig[0] && fieldConfig[0].trim();
        const fieldValue = fieldConfig[1] && fieldConfig[1].trim();
        const flag = form.getFieldValue(fieldName) === fieldValue;
        patternFlag = !!pattern && flag;
      }
    }
    return patternFlag;
  }

  /**
   * 处理reserve1-10以外的拓展字段文本类型长读限制
   * @returns
   * @memberof ComposeForm
   */
  handleReserveLength(fieldCode) {
    if (
      fieldCode &&
      fieldCode.startsWith('reserve') &&
      fieldCode.length > 8 &&
      fieldCode !== 'reserve10'
    ) {
      return true;
    }
    return false;
  }

  /**
   * 国别码前缀
   */
  handleMobileCode(form, dataSource, fieldCode) {
    const { idd } = this.state;
    return form.getFieldDecorator('internationalTelCode', {
      initialValue: dataSource.internationalTelCode || (idd[0] && idd[0].value) || '+86',
    })(
      <Select onChange={(value, option) => this.reValidationPhone(value, option, fieldCode)}>
        {map(idd, (r) => (
          <Select.Option key={r.value} value={r.value}>
            {r.meaning}
          </Select.Option>
        ))}
      </Select>
    );
  }

  /**
   * 区号改变 需要 重置手机号的校验状态
   */
  reValidationPhone(value, option, fieldCode) {
    const internationalTelMeaning = option && option.props && option.props.children;
    const { form } = this.props;
    const prevInternationalTelCode = form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue(fieldCode);
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
      }
      form.setFields({
        [fieldCode]: {
          value: curPhone,
          errors,
        },
      });
    }
    form.setFieldsValue({
      internationalTelMeaning,
    });
  }

  // 处理级联查询参数
  handleQueryParams(componentProps, otherComponentProps, field) {
    const { queryParams } = componentProps;
    const { newQueryParams = {} } = otherComponentProps;
    if (isFunction(queryParams)) {
      const data = queryParams(field);
      return { ...data, ...newQueryParams };
    } else {
      return { ...queryParams, ...newQueryParams };
    }
  }

  handleUploadData(fieldCode, dataSource) {
    const { form } = this.props;
    form.setFieldsValue({
      [fieldCode]: dataSource,
    });
  }

  /**
   * 设置额外表单值
   * @param {Object} record 数据对象
   * @param {String} extSetMap 额外字段映射, 可以有多个, 以逗号分隔 bankId,bankName->bankDescription
   * @param {表单对象} form 表单对象
   */
  setExtMapToForm(record, extSetMap, form) {
    extSetMap.split(/\s*,\s*/g).forEach((entryStr) => {
      const [recordField, formFieldTmp] = entryStr.split('->');
      const formField = formFieldTmp || recordField;
      form.getFieldDecorator(formField, {
        initialValue: record[formField],
      });
    });
  }

  /**
   * 渲染最终的字段
   * @param {Object} field - 字段
   */
  renderComposeFormField({ field }) {
    const {
      remote,
      disableStyle,
      fieldLabelWidth,
      col,
      editable,
      organizationId,
      context,
      curActiveKey,
      onRefsCurrent,
      dataSource: source,
      configName = '',
      purchaserTenantNum,
      investigateTemplate,
      attachmentTypeList = [],
    } = this.props;
    const formItemProps = {
      labelCol: {
        style: {
          width: fieldLabelWidth,
          minWidth: fieldLabelWidth,
          maxWidth: fieldLabelWidth,
        },
      },
      wrapperCol: { style: { flex: 'auto' } },
    };
    const colProps = getColLayout(col);
    const fieldColProps = getColLayout(col, field.colspan);
    const leftEmptyCols = [];
    const rightEmptyCols = [];
    if (inRange(field.leftOffset, 1, col)) {
      for (let i = 0; i < field.leftOffset; i++) {
        leftEmptyCols.push(<Col {...colProps} key={`${field.fieldCode}#left-offset-${i}`} />);
      }
    }
    if (inRange(field.rightOffset, 1, col)) {
      for (let i = 0; i < field.rightOffset; i++) {
        rightEmptyCols.push(<Col {...colProps} key={`${field.fieldCode}#right-offset-${i}`} />);
      }
    }
    const commonProps = getComponentProps({
      field,
      componentType: field.componentType,
      context,
      otherProps: { attachmentTypeList },
    });
    // 处理正则
    const { pattern, defaultValue, defaultValueMeaning, ...componentProps } = commonProps;

    const ComponentType = getComponentType(field, componentProps);

    const otherFormItemOptions = {};
    let isViewOnly = false; // 附件是否为只读
    const getValueFromEvent = getGetValueFromEventFunc(field.componentType);
    const getValueProps = getGetValuePropFunc(field);
    if (field.componentType === 'Upload') {
      otherFormItemOptions.valuePropName = componentProps.isAttachmentUrl
        ? 'attachment'
        : 'attachmentUUID';
      if (field.props) {
        const propsIndex = findIndex(field.props, ['attributeName', 'viewOnly']);
        if (propsIndex >= 0) {
          isViewOnly = field.props[propsIndex].attributeValue;
        }
      }
    }
    if (getValueFromEvent) {
      otherFormItemOptions.getValueFromEvent = getValueFromEvent;
    }
    if (getValueProps) {
      // 不影响存的值, 只影响传递给组件的值
      otherFormItemOptions.getValueProps = getValueProps;
    }
    const supplierAttRequired =
      field.fieldCode === 'supplierAttFlag' && supplierAttRequiredFlag === 1;

    const composeFormItem = (
      <Col {...fieldColProps} key={field.fieldCode}>
        <ComposeFormContext.Consumer>
          {({ form, dataSource, processStatus, referenceRangeErrorList }) => {
            const temptDisabledFlag = isNil(field.editableFlag)
              ? componentProps !== undefined && componentProps.disabled
              : !field.editableFlag;
            const disabled =
              (field.fieldCode === 'attachmentType' && dataSource.purchaserFlag === 1) ||
              temptDisabledFlag;
            // 处理正则
            const patternFlag = this.handleFieldAttributes({ ...commonProps, form });
            // 处理编辑
            const params = {
              record: dataSource,
              form,
              config: {
                fieldProperty: field.fxProps || [],
                editable: !disabled,
                pattern: !!patternFlag,
              },
            };
            const { disabled: newDisabled, pattern: newPatternFlag } = this.handleConditionConfig(
              params
            );
            let finalDisabled = newDisabled;
            const otherComponentProps = {}; // 为 lov 和 valueList 准备的属性
            // 是否转化form绑定字段
            let transformFieldCode = false;
            switch (field.componentType || 'Input') {
              case 'Lov':
                otherComponentProps.textValue = getDisplayValue({ field, dataSource });
                if (
                  componentProps !== undefined &&
                  componentProps.parentRelationField &&
                  componentProps.relationParamName
                ) {
                  const { parentRelationField, relationParamName } = componentProps;
                  otherComponentProps.newQueryParams = {
                    [relationParamName]: form.getFieldValue(parentRelationField)
                      ? form.getFieldValue(parentRelationField)
                      : undefined,
                  };
                }
                if (
                  configName === 'sslmInvestgSupplierCate' &&
                  field.fieldCode === 'categoryCode'
                ) {
                  // 供应商分类顶级不可选
                  otherComponentProps.parentNodeDisable = true;
                  otherComponentProps.newQueryParams = {
                    enabledFlag: 1,
                  };
                }
                break;
              case 'ValueList':
                otherComponentProps.textValue = getDisplayValue({ field, dataSource });
                break;
              case 'TransferLov':
                otherComponentProps.translateData = getDisplayValue({ field, dataSource });
                if (
                  componentProps !== undefined &&
                  componentProps.parentRelationField &&
                  componentProps.relationParamName
                ) {
                  const { parentRelationField, relationParamName } = componentProps;
                  otherComponentProps.newQueryParams = {
                    [relationParamName]: form.getFieldValue(parentRelationField)
                      ? form.getFieldValue(parentRelationField)
                      : undefined,
                  };
                }
                componentProps.onChange = (value, record) => {
                  form.setFieldsValue({
                    [`${field.fieldCode}Meaning`]: record,
                  });
                };
                break;
              case 'Badge':
                otherComponentProps.status =
                  dataSource[field.fieldCode] === 1 || supplierAttRequired ? 'success' : 'error';
                otherComponentProps.text =
                  dataSource[field.fieldCode] === 1 || supplierAttRequired
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否');
                break;
              case 'Input':
                if (
                  configName === 'sslmInvestgAddress' &&
                  componentProps !== undefined &&
                  componentProps.addonAfter
                ) {
                  otherComponentProps.addonAfter = this.handleCascader(form, dataSource);
                  form.registerField('regionPathName');
                }

                if (componentProps.mobilephoneFlag) {
                  otherComponentProps.addonBefore = this.handleMobileCode(
                    form,
                    dataSource,
                    field.fieldCode
                  );
                  form.getFieldDecorator('internationalTelMeaning', {
                    initialValue: dataSource.internationalTelMeaning || '中国大陆 +86',
                  });
                }
                if (configName === 'sslmInvestgAddress' && field.fieldCode === 'regionId') {
                  form.getFieldDecorator('isLeaf', {
                    initialValue: true,
                  });
                }

                // 处理长读限制
                // eslint-disable-next-line no-case-declarations
                const maxLengthFlag = this.handleReserveLength(field.fieldCode);
                if (maxLengthFlag) {
                  otherComponentProps.maxLength = 100;
                }
                break;
              case 'TextArea':
                // eslint-disable-next-line no-case-declarations
                const maxLength = this.handleReserveLength(field.fieldCode);
                if (maxLength) {
                  otherComponentProps.maxLength = 100;
                }
                break;
              case 'TLEditor':
                otherComponentProps.token = dataSource._token;
                break;
              case 'Upload':
                otherComponentProps.onUploadData = (data) =>
                  this.handleUploadData(field.fieldCode, data);
                otherComponentProps.fieldCode = field.fieldCode;
                otherComponentProps.record = dataSource;
                otherComponentProps.viewOnly = commonProps.viewOnly || newDisabled;
                if (
                  field.fieldCode === 'supplierAttachmentUuid' ||
                  field.fieldCode === 'attachmentUuid'
                ) {
                  otherComponentProps.uploadSuccess = () => {
                    form.registerField('fileUpdateFlag');
                    form.setFieldsValue({
                      lastUploadDate: moment().format(DEFAULT_DATE_FORMAT),
                      fileUpdateFlag: true,
                    });
                  };
                  otherComponentProps.removeCallback = () => {
                    form.registerField('fileUpdateFlag');
                    form.setFieldsValue({
                      lastUploadDate: moment().format(DEFAULT_DATE_FORMAT),
                      fileUpdateFlag: true,
                    });
                  };
                }
                if (componentProps.isAttachmentUrl) {
                  form.getFieldDecorator('fileCount', {
                    initialValue: dataSource.fileCount,
                  });
                }
                break;
              case 'Checkbox':
                if (componentProps && componentProps.relationField) {
                  const { relationField } = componentProps;
                  otherComponentProps.onChange = (e) => {
                    if (!e.target.value) {
                      // 获取要重置的默认值
                      const resetDefaultValue = form.getFieldValue(`${relationField}DefaultValue`);
                      const resetDefaultValueMeaning = form.getFieldValue(
                        `${relationField}DefaultValueMeaning`
                      );
                      form.setFieldsValue({
                        [relationField]: resetDefaultValue,
                        [`${relationField}Meaning`]: resetDefaultValueMeaning,
                      });
                    }
                  };
                }
                break;
              case 'Cascader':
                if (field.fieldCode === 'attachmentType') {
                  transformFieldCode = true;
                  form.getFieldDecorator('parentAttachmentType', {
                    initialValue: dataSource.parentAttachmentType,
                  });
                  form.getFieldDecorator('attachmentType', {
                    initialValue: dataSource.attachmentType,
                  });
                  otherComponentProps.onChange = (data, textList) => {
                    form.registerField('attachmentTypeMeaning');
                    if (!isEmpty(data) && isArray(data)) {
                      form.setFieldsValue({
                        parentAttachmentType: data[0],
                        attachmentType: data[1],
                        attachmentTypeMeaning: isArray(textList)
                          ? textList.map((item) => item.meaning).join('/')
                          : '',
                      });
                    } else {
                      form.setFieldsValue({
                        parentAttachmentType: null,
                        attachmentType: null,
                        attachmentTypeMeaning: '',
                      });
                    }
                  };
                }
                break;
              default:
                break;
            }
            if (editable && field.componentType === 'Lov') {
              // 绑定lov额外字段
              form.getFieldDecorator(`${field.fieldCode}Meaning`, {
                initialValue: getDisplayValue({ field, dataSource }),
              });
              const { extSetMap } = componentProps;
              if (extSetMap) {
                this.setExtMapToForm(dataSource, extSetMap, form);
              }
            }
            if (
              editable &&
              field.componentType === 'ValueList' &&
              componentProps &&
              componentProps.parentRelationField
            ) {
              // 用于存储默认值
              form.getFieldDecorator(`${field.fieldCode}DefaultValue`, {
                initialValue: defaultValue,
              });
              form.getFieldDecorator(`${field.fieldCode}DefaultValueMeaning`, {
                initialValue: defaultValueMeaning,
              });
              form.getFieldDecorator(`${field.fieldCode}Meaning`, {
                initialValue: getDisplayValue({ field, dataSource }),
              });
            }
            // 勾选长期，文件到期日不可编辑，放在最后即使配了fx也不生效
            if (
              field.fieldCode === 'expirationDate' &&
              ['sslmInvestgAttachment', 'sslmInvestgAuth'].includes(configName)
            ) {
              finalDisabled = !!form.getFieldValue('longEffectiveFlag');
            }
            if (field.fieldCode === 'attachmentType' && source.purchaserFlag === 1) {
              return (
                <FormItem
                  label={
                    <span
                      style={{
                        color:
                          processStatus === 'SUBMIT' &&
                          referenceRangeErrorList.includes(field.fieldCode) &&
                          'red',
                      }}
                    >
                      {field.fieldDescription}
                    </span>
                  }
                  {...formItemProps}
                >
                  {source.attachmentTypeMeaning}
                </FormItem>
              );
            }
            // 必输埋点
            const requiredFlag = field.fieldCode === 'mail'?true:this.getEditFieldRequiredFlag(
              field,
              isViewOnly,
              form,
              dataSource,
              configName
            );
            const remoteRequiredFlag = remote?remote.process(`SPFM_INVITATION_INVESTIGATION_FORM_REQUIRED_FLAG_${purchaserTenantNum}`, requiredFlag, {
              form,
              field,
              curActiveKey,
              onRefsCurrent,
              investigateTemplate,
            }):requiredFlag;

            return editable ? (
              <FormItem
                label={field.fieldDescription}
                {...formItemProps}
              >
                {(field.fieldCode === 'mail'
                  ? form.getFieldDecorator(`mail`, {
                      ...otherFormItemOptions,
                      initialValue: getInitialValue({
                        field,
                        dataSource,
                        form,
                      }),
                      rules: [
                        {
                          required: remoteRequiredFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hzero.common.email').d('邮箱'),
                          }),
                        },
                        {
                          pattern: EMAIL,
                          message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                        },
                        {
                          max: 60,
                          message: intl.get('hzero.common.validation.max', {
                            max: 60,
                          }),
                        },
                      ],
                    })
                  : form.getFieldDecorator(!transformFieldCode ? field.fieldCode : `${field.fieldCode}Merge`, {
                      ...otherFormItemOptions,
                      initialValue: getInitialValue({
                        field,
                        dataSource,
                        configName,
                        supplierAttRequired,
                        form,
                      }),
                      rules: compact([
                        {
                          required: remoteRequiredFlag,
                          message: intl
                            .get('hzero.common.validation.notNull', {
                              name: field.fieldDescription,
                            })
                            .d(`${field.fieldDescription}不能为空`),
                        },
                        componentProps.mobilephoneFlag
                          ? {
                              pattern:
                                form.getFieldValue('internationalTelCode') === '+86'
                                  ? PHONE
                                  : NOT_CHINA_PHONE,
                              message: intl
                                .get('hzero.common.validation.phone')
                                .d('手机格式不正确'),
                            }
                          : false,
                        newPatternFlag
                          ? {
                              pattern,
                              message: intl
                                .get('hzero.common.validation.format')
                                .d('数据格式校验不通过'),
                            }
                          : false,
                        {
                          validator: (_, value, cb) => {
                            const longEffectiveFlag = form.getFieldValue('longEffectiveFlag');
                            if (field.fieldCode === 'expirationDate' && !longEffectiveFlag) {
                              const expirationDate = form.getFieldValue('expirationDate');
                              const lastUploadDate = form.getFieldValue('lastUploadDate');
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
                            if (configName === 'sslmInvestgAddress') {
                              const {
                                countryCode,
                                quickIndex,
                                isLeaf,
                                regionId,
                                zipCode,
                              } = form.getFieldsValue();
                              const {
                                countryCode: oldCountryCode,
                                quickIndex: oldQuickIndex,
                              } = dataSource;
                              const newCountryCode = countryCode || oldCountryCode;
                              const newQuickIndex = quickIndex || oldQuickIndex;
                              if (newCountryCode === 'CN' || newQuickIndex === 'CN') {
                                if (field.fieldCode === 'regionId') {
                                  if (regionId && !isLeaf) {
                                    cb(
                                      intl
                                        .get('sslm.common.view.validate.lastRegion')
                                        .d('须选择填写至最末级地区')
                                    );
                                  }
                                  cb();
                                } else if (field.fieldCode === 'zipCode' && !isEmpty(zipCode)) {
                                  const testReg = /^[0-9]{6,6}$/;
                                  if (!testReg.test(value)) {
                                    cb(
                                      intl
                                        .get('sslm.common.view.validate.atLeastSixNumber')
                                        .d('请输入6位数字')
                                    );
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
                    }))(
                  React.createElement(
                    ComponentType,
                    Object.assign({}, componentProps, otherComponentProps, {
                      disabledDate: (currentDate) => {
                        if (field.fieldCode === 'dateFrom') {
                          return (
                            form.getFieldValue('dateTo') &&
                            moment(form.getFieldValue('dateTo')).isBefore(currentDate, 'day')
                          );
                        } else if (field.fieldCode === 'dateTo') {
                          const todayDate = moment().format(DEFAULT_DATE_FORMAT);
                          const dateFrom =
                            form.getFieldValue('dateFrom') &&
                            moment(form.getFieldValue('dateFrom'));
                          const maxFlag = dateFrom
                            ? moment(todayDate).isAfter(dateFrom, 'day')
                            : true;
                          return maxFlag
                            ? moment() && moment().isSameOrAfter(currentDate, 'day')
                            : dateFrom.isSameOrAfter(currentDate, 'day');
                        } else if (field.fieldCode === 'expirationDate') {
                          const lastUploadDate = form.getFieldValue('lastUploadDate');
                          return lastUploadDate
                            ? moment(lastUploadDate).isSameOrAfter(currentDate, 'day')
                            : moment() && moment().isSameOrAfter(currentDate, 'day');
                        } else {
                          return null;
                        }
                      },
                      disabled: finalDisabled,
                      queryParams: this.handleQueryParams(
                        componentProps,
                        otherComponentProps,
                        field
                      ),
                    }) // otherComponentProps 比 componentProps 优先级高
                  )
                )}
              </FormItem>
            ) : (
              <FormItem label={field.fieldDescription} {...formItemProps}>
                {renderDisabledField({
                  field,
                  dataSource,
                  formItemProps,
                  organizationId,
                  disableStyle,
                  configName,
                  componentProps: Object.assign({}, componentProps, otherComponentProps),
                  processStatus,
                  referenceRangeErrorList,
                })}
              </FormItem>
            );
          }}
        </ComposeFormContext.Consumer>
      </Col>
    );
    if (isEmpty(leftEmptyCols) && isEmpty(rightEmptyCols)) {
      return composeFormItem;
    }
    return (
      <React.Fragment key={field.fieldCode}>
        {leftEmptyCols}
        {composeFormItem}
        {rightEmptyCols}
      </React.Fragment>
    );
  }

  render() {
    const {
      editable = false,
      form,
      dataSource,
      loading = false,
      templateData = {},
      processStatus,
      referenceRangeMessage,
      referenceRangeErrorList = [],
    } = this.props;
    const { rows = [] } = this.state;
    this.checkUpdate();
    const { remark = '' } = templateData;
    return (
      <Spin spinning={loading}>
        {remark && <Alert showIcon message={remark} type="info" style={{ marginBottom: 8 }} />}
        {!isEmpty(referenceRangeMessage) && !editable && (
          <Alert
            showIcon
            type="error"
            style={{ marginBottom: 16 }}
            message={
              <Fragment>
                {referenceRangeMessage.map((n) => (
                  <div>{n}</div>
                ))}
              </Fragment>
            }
          />
        )}
        <Form layout="inline" className={editable ? 'compose-form' : 'compose-form-disabled'}>
          <ComposeFormContext.Provider
            value={{ form, dataSource, processStatus, referenceRangeErrorList }}
          >
            {rows}
          </ComposeFormContext.Provider>
        </Form>
      </Spin>
    );
  }
}

const Index = (props)=>{
  const {purchaserTenantNum} = props;
  const Detail =useMemo(()=>remotes({
    code: 'SPFM_INVITATION_INVESTIGATION_FORM',
    name: 'remote',
    tenantNum: purchaserTenantNum,
  }, {
    events: {
      cuxInvestigFieldsChange() {}, // 表单字段修改值回调
    },
  })(ComposeForm), [purchaserTenantNum]);
  return <Detail {...props} />;
};

export default Index;
