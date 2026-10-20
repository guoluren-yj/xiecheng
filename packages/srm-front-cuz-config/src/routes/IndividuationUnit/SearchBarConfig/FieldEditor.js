/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Form,
  Input,
  Checkbox,
  Drawer,
  Button,
  Select,
  InputNumber,
  DatePicker,
  TreeSelect,
  Badge,
  Tooltip,
  // Icon,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, keys, isArray, omit } from 'lodash';

import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import { getContext } from 'srm-front-cuz/lib/customizeTool';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { queryMapIdpValue } from 'services/api';

import DefaultExpConfig from '@/components/DefaultExpConfig';
import DefaultValueModal from './DefaultValueModal';
import styles from './index.less';
import { FIX_DATE_RANGES } from '../../../utils/constConfig';

@Form.create({ fieldNameProp: null })
@connect(({ loading }) => ({
  saveLoading: loading.effects['searchBarConfig/saveFilterField'],
}))
export default class FieldSelector extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      isEdit: false,
      visible: false,
      selectOptions: {},
      record: {},
      defaultValueFx: undefined,
      defaultValueVisible: false,
    };
    this.ctxParams = {
      ctx: getContext(),
      url: {},
      self: {}, // 自定义参数，留口备用
    };
  }

  @Bind()
  handleOpenModal(isEdit = false, record = {}) {
    const newRecord = record;
    if (!isEmpty(record)) {
      const { originFields = [] } = this.props;
      const targetField = originFields.find((item) => item.fieldAlias === record.fieldAlias);
      if (targetField) {
        newRecord.widget = targetField.widget;
      }
      const { fieldAlias, widget = {} } = newRecord;
      const { fieldWidget, sourceCode } = widget;
      if (fieldWidget === 'SELECT' && sourceCode) {
        this.fetchSelectOptions(sourceCode, fieldAlias);
      }
    }
    this.setState({
      isEdit,
      record: newRecord,
      defaultValueFx: newRecord.defaultValueCon,
      visible: !this.state.visible,
    });
  }

  @Bind()
  handleClose() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ visible: false, defaultValueFx: undefined });
  }

  @Bind()
  toggleDefaultValueModal() {
    const { defaultValueVisible } = this.state;
    this.setState({
      defaultValueVisible: !defaultValueVisible,
    });
  }

  @Bind()
  updateDefaultValueFx(newSelfValidator) {
    this.setState({
      defaultValueFx: newSelfValidator,
    });
  }

  @Bind()
  fetchSelectOptions(selectSourceCode, optionsKey) {
    const { selectOptions = {} } = this.state;
    // 编码重复查询
    if (!isEmpty(selectOptions[optionsKey])) {
      return false;
    }
    queryMapIdpValue({
      [optionsKey]: selectSourceCode,
    }).then((res) => {
      if (res && res[optionsKey]) {
        selectOptions[optionsKey] = res[optionsKey];
        this.setState({
          selectOptions,
        });
      }
    });
  }

  @Bind()
  @Debounce(300)
  handleOk() {
    const { isEdit, record = {}, defaultValueFx } = this.state;
    const { dispatch, form, filterInfo = {}, unitInfo = {}, onRefresh = () => {} } = this.props;
    const { validateFields = () => {} } = form;
    const { unitCode } = unitInfo;
    validateFields((err, values) => {
      if (!err) {
        const {
          fieldAlias,
          fieldNameTemp,
          fixedFlag,
          // mergeFlag,
          defaultValue,
          defaultStartValue,
          defaultEndValue,
          proDefaultFlag = 0,
          widget: { fieldWidget, multipleFlag, dateFormat },
        } = values;
        const { defaultValueCon: oldDefaultValueCon, comparison } = record;
        let defaultValueCon = oldDefaultValueCon
          ? { ...omit(oldDefaultValueCon, ['lines', 'valids']), ...defaultValueFx }
          : defaultValueFx;
        if (defaultValueCon && (!defaultValueCon.valids || defaultValueCon.valids.length < 1)) {
          defaultValueCon = undefined;
        }
        let newField = {
          ...omit(values, 'fieldNameTemp'),
          fieldAlias,
          fieldName: fieldNameTemp,
          fixedFlag,
          unitCode,
          filterId: filterInfo.filterId,
          proDefaultFlag,
          defaultValue: defaultValueCon ? undefined : defaultValue,
          defaultValueCon,
        };
        // if (mergeFlag === 1) {
        //   // 文本框类型组件字段 查询关系默认为 LIKE
        //   newField.comparison = 'LIKE';
        // }
        if (isEdit && !isEmpty(record)) {
          const { fieldId, filterFieldId, num } = record;
          newField = {
            ...newField,
            fieldId,
            num,
            filterFieldId,
          };
        }
        // 新建时rank取当前
        if (!isEdit) {
          newField.num = isEmpty(filterInfo.filterFields)
            ? 1
            : filterInfo.filterFields.length * 10;
        } else if (record.fixedFlag === 1 && fixedFlag !== 1) {
          // 冻结改为非冻结,排在最后一个
          newField.num = isEmpty(filterInfo.filterFields)
            ? 10
            : filterInfo.filterFields.length * 10;
        } else if (record.fixedFlag !== 1 && fixedFlag === 1) {
          // 非冻结改为冻结, 排在已冻结最后一个
          newField.num =
            !isEmpty(filterInfo.filterFields) &&
            filterInfo.filterFields.some((item) => item.fixedFlag === 1)
              ? filterInfo.filterFields.filter((item) => item.fixedFlag === 1).length * 10 + 1
              : 10;
        }
        if (['LOV', 'SELECT'].includes(fieldWidget) && multipleFlag && isArray(defaultValue)) {
          newField.defaultValue = defaultValue.join(',');
        } else if (fieldWidget === 'DATE_PICKER' && defaultValue && proDefaultFlag !== 1) {
          const isRangeDate = comparison && ['RANGE', 'IN'].includes(comparison.split(',')[0]);
          if (isRangeDate) {
            newField.defaultValue = defaultValue
              .map((item) =>
                item ? moment(item).format(dateFormat || DEFAULT_DATETIME_FORMAT) : ''
              )
              .join(',');
          } else {
            newField.defaultValue = moment(defaultValue).format(
              dateFormat || DEFAULT_DATETIME_FORMAT
            );
          }
        } else if (fieldWidget === 'INPUT_NUMBER' && (defaultStartValue || defaultEndValue)) {
          newField.defaultValue = (defaultStartValue || '')
            .toString()
            .concat(',')
            .concat(defaultEndValue || '');
        }
        dispatch({
          type: 'searchBarConfig/saveFilterField',
          params: [newField],
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleClose();
            if (typeof onRefresh === 'function') {
              onRefresh();
            }
          }
        });
      }
    });
  }

  @Bind()
  openProDefaultModal() {
    const {
      form,
      record,
      unitInfo: { id },
    } = this.props;
    Modal.open({
      title: intl.get('hpfm.individual.model.config.proDefault').d('公式配置'),
      closable: true,
      movable: false,
      drawer: false,
      key: Modal.key(),
      style: { width: 1000 },
      footer: null,
      children: (
        <DefaultExpConfig record={record} form={form} ctxParams={this.ctxParams} unitId={id} />
      ),
    });
  }

  @Bind()
  handleChangeField(newFieldAlias) {
    const {
      originFields = [],
      widgetTypeObj = {},
      form: { setFieldsValue = () => {} },
    } = this.props;
    if (!isEmpty(originFields)) {
      const targetField = originFields.find((item) => item.fieldAlias === newFieldAlias);
      if (targetField) {
        const { fieldAlias, fieldName, widget = {}, whereOption } = targetField;
        this.setState({
          record: {
            fieldAlias,
            fieldName,
            widget,
            comparison: whereOption,
          },
        });
        const { fieldWidget, sourceCode, multipleFlag, dateFormat, lovEnhanceFlag } = widget;
        if (fieldWidget === 'SELECT' && sourceCode) {
          this.fetchSelectOptions(sourceCode, fieldAlias);
        }
        setFieldsValue({
          fieldAlias,
          fieldNameTemp: fieldName,
          'widget.fieldWidget': fieldWidget,
          'widget.multipleFlag': multipleFlag,
          'widget.fieldWidgetMeaning': widgetTypeObj[fieldWidget],
          'widget.sourceCode': sourceCode,
          'widget.lovEnhanceFlag': lovEnhanceFlag,
          fieldWidget,
          sourceCode,
          multipleFlag,
          format: dateFormat,
          defaultValue: null,
          fixedFlag: 0,
        });
      }
    }
  }

  @Bind()
  generateDefaultValueText(records, displayField, valueField, multipleFlag) {
    if (!isArray(records) || isEmpty(records)) {
      return null;
    }
    // 若lov查询结果中无配置的displayField，则用原始displayField
    // 多选
    if (multipleFlag === 1) {
      const text = {};
      records.forEach((item) => {
        text[item[valueField] || ''] = item[displayField];
      });
      return text;
    } else {
      return records[0][displayField];
    }
  }

  @Bind()
  renderDefaultValueItem(defaultComparison) {
    const { isEdit, selectOptions = {} } = this.state;
    const {
      filterInfo = {},
      originFields = [],
      form: { getFieldDecorator = () => {}, getFieldValue = () => {} },
    } = this.props;
    const { filterFields = [], allFields = [] } = filterInfo;
    let targetField =
      originFields.find((item) => item && item.fieldAlias === getFieldValue('fieldAlias')) || {};
    const { widget = {}, displayField } = targetField || {};
    if (isEdit) {
      targetField = filterFields.find(
        (item) => item && item.fieldAlias === getFieldValue('fieldAlias')
      );
    } else {
      targetField = allFields.find(
        (item) => item && item.fieldAlias === getFieldValue('fieldAlias')
      );
    }
    if (!targetField) {
      return null;
    }
    const { fieldAlias, defaultValue, lovValueRecords } = targetField;
    const { fieldWidget, sourceCode, multipleFlag, dateFormat = DEFAULT_DATETIME_FORMAT, lovInfo } =
      widget || {};
    const { displayField: originDisplayField, valueField: originValueField } = lovInfo || {};
    if (getFieldValue('proDefaultFlag') === 1) {
      return getFieldDecorator('defaultValue', {
        initialValue: defaultValue,
      })(
        <Badge dot={!!getFieldValue('defaultValue')}>
          <a style={{ lineHeight: '32px' }} onClick={this.openProDefaultModal}>
            {intl.get('hpfm.individual.model.config.proDefault').d('公式配置')}
          </a>
        </Badge>
      );
    }
    let component;
    let newDefaultValue = defaultValue;
    const commonProps = {
      allowClear: true,
      style: {
        width: '75%',
      },
    };
    switch (fieldWidget) {
      case 'LOV': {
        const text = this.generateDefaultValueText(
          lovValueRecords,
          displayField || originDisplayField,
          originValueField,
          multipleFlag
        );
        let lovOptions = {};
        if (displayField) {
          lovOptions = {
            displayField,
          };
        }
        component = multipleFlag ? (
          <LovMulti
            {...commonProps}
            code={sourceCode}
            translateData={text || {}}
            lovOptions={lovOptions}
          />
        ) : (
          <Lov {...commonProps} textValue={text} code={sourceCode} lovOptions={lovOptions} />
        );
        break;
      }
      case 'SELECT': {
        const options = !isEmpty(selectOptions[fieldAlias]) ? selectOptions[fieldAlias] : [];
        if (multipleFlag === 1 && defaultValue) {
          newDefaultValue = defaultValue.split(',');
        }
        component =
          multipleFlag !== 1 ? (
            <Select {...commonProps}>
              {options &&
                options.map((item) => (
                  <Select.Option value={item.value}>{item.meaning}</Select.Option>
                ))}
            </Select>
          ) : (
            <TreeSelect
              {...commonProps}
              treeCheckable
              treeData={options.map((item) => ({
                title: item.meaning,
                value: item.value,
                key: item.value,
              }))}
            />
          );
        break;
      }
      case 'INPUT_NUMBER':
        if (multipleFlag !== 1) {
          if (newDefaultValue) {
            const newDefaultValueArr = newDefaultValue.split(',');
            newDefaultValue = newDefaultValueArr[0]
              ? parseInt(newDefaultValueArr[0], 10)
              : undefined;
          }
          return getFieldDecorator('defaultValue', {
            initialValue: newDefaultValue,
          })(<InputNumber className={styles['input-number-item']} allowClear />);
        } else {
          let defaultStartValue;
          let defaultEndValue;
          // 多选
          if (newDefaultValue) {
            const newDefaultValueArr = newDefaultValue.split(',');
            defaultStartValue = newDefaultValueArr[0]
              ? parseInt(newDefaultValueArr[0], 10)
              : undefined;
            defaultEndValue = newDefaultValueArr[1]
              ? parseInt(newDefaultValueArr[1], 10)
              : undefined;
          }
          return (
            <Input.Group style={{ display: 'inline-flex', alignItems: 'center', width: '75%' }}>
              {getFieldDecorator('defaultStartValue', {
                initialValue: defaultStartValue,
              })(<InputNumber allowClear />)}
              <div className={styles['input-number-range-divider']}>~</div>
              {getFieldDecorator('defaultEndValue', {
                initialValue: defaultEndValue,
              })(<InputNumber allowClear />)}
            </Input.Group>
          );
        }
      case 'DATE_PICKER':
        {
          const isRangeDate = ['RANGE', 'IN'].includes(defaultComparison);
          if (newDefaultValue) {
            if (!isRangeDate) {
              newDefaultValue = moment(newDefaultValue).isValid() ? moment(newDefaultValue) : undefined;
            } else {
              const newDefaultValueArr = newDefaultValue.split(',');
              const startDate = newDefaultValueArr[0] ? moment(newDefaultValueArr[0]) : undefined;
              const endDate = newDefaultValueArr[1] ? moment(newDefaultValueArr[1]) : undefined;
              newDefaultValue = [startDate, endDate];
            }
          }
          const isMonthPicker = /^(YYYY)?[-/]?MM$/.test(dateFormat);
          const isTimeType = dateFormat.includes('mm:ss');
          const Widget = isMonthPicker ? DatePicker.MonthPicker : DatePicker;
          component =
            !isRangeDate ? (
              <Widget {...commonProps} showTime={isTimeType} format={dateFormat} />
            ) : (
              <DatePicker.RangePicker
                {...commonProps}
                showTime={isTimeType}
                format={dateFormat}
                mode={isMonthPicker ? 'month' : isTimeType ? 'dateTime' : 'date'}
              />
            );
        }
        break;
      default:
        component = <Input {...commonProps} />;
        break;
    }

    return getFieldDecorator('defaultValue', {
      initialValue: newDefaultValue,
    })(component);
  }

  @Bind()
  handleChangeFieldFlag(flagType) {
    const {
      form: { setFieldsValue = () => {} },
    } = this.props;
    if (flagType === 'fixedFlag') {
      setFieldsValue({ mergeFlag: 0 });
    } else {
      setFieldsValue({ fixedFlag: 0 });
    }
  }

  @Bind()
  handleChangeDefaultFlag() {
    const {
      form: { setFieldsValue = () => {} },
    } = this.props;
    setFieldsValue({ defaultValue: undefined });
    this.setState({ defaultValueFx: undefined });
  }

  @Bind()
  checkMergeFieldNum() {
    const {
      filterInfo = {},
      form: { getFieldValue = () => {} },
    } = this.props;
    const { filterFields = [] } = filterInfo;
    const fieldAlias = getFieldValue('fieldAlias');
    let flag = true;
    if (!isEmpty(filterFields)) {
      const mergedFields = filterFields.filter(
        (item) => item.mergeFlag === 1 && item.fieldAlias !== fieldAlias
      );
      if (mergedFields.length >= 2) {
        flag = false;
      }
    }
    return flag;
  }

  render() {
    const { visible, isEdit, record = {}, defaultValueVisible, defaultValueFx } = this.state;
    const {
      fieldList = [],
      widgetTypeObj = {},
      saveLoading = false,
      form,
      unitInfo,
      unitList,
      codes,
      originFields,
    } = this.props;
    const { whereOptions } = codes || {};
    const { id, unitType } = unitInfo;
    const { getFieldDecorator = () => {}, getFieldValue = () => {} } = form;
    const {
      // modelId,
      fieldAlias,
      fieldName,
      fixedFlag,
      // mergeFlag,
      proDefaultFlag,
      widget = {},
      comparison,
    } = record;
    const originField = originFields && originFields.find((item) => item.fieldAlias === fieldAlias);
    const modelFieldFlag = originField && originField.modelFieldFlag;
    const { fieldWidget, sourceCode, multipleFlag, dateFormat, lovEnhanceFlag } = widget;
    let defaultComparison = comparison && comparison.split(',')[0]; 
    if (defaultComparison === 'IN' && fieldWidget === 'DATE_PICKER' && modelFieldFlag) {
      defaultComparison = 'RANGE';
    }
    const defaultComparisonMeaning = defaultComparison && whereOptions && (whereOptions.find(i => i.value === defaultComparison) || {}).meaning;
    const showDefaultValue = !modelFieldFlag || fieldWidget !== 'DATE_PICKER' || (defaultComparison && (defaultComparison === 'RANGE' || ![...FIX_DATE_RANGES, 'NOTNULL', 'ISNULL'].includes(defaultComparison)));
    const conUnitList = unitList;
    const conFieldList = {};
    if (!isEmpty(conUnitList)) {
      conUnitList.forEach((i) => {
        conFieldList[i.unitId] = i.unitFields || [];
      });
    }
    const defaultValueProps = omit(defaultValueFx || {}, ['lines', 'valids']);
    const defaultConList = (defaultValueFx || {}).lines || [];
    const defaultValidList = (defaultValueFx || {}).valids || [];
    const valids = defaultValueFx === undefined ? defaultValidList : defaultValueFx.valids;
    return (
      <Drawer
        title={
          isEdit
            ? intl.get('hpfm.searchBar.view.message.editField').d('编辑字段')
            : intl.get('hpfm.searchBar.view.message.createField').d('添加字段')
        }
        visible={visible}
        width={500}
        zIndex={100}
        onClose={this.handleClose}
      >
        <Form className={styles['searchBar-filter-modal-form']} layout="vertical">
          <Form.Item label={intl.get('hpfm.searchBar.model.searchBar.fieldCode').d('字段编码')}>
            {getFieldDecorator('fieldAlias', {
              initialValue: fieldAlias,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称')}>
            {getFieldDecorator('fieldName', {
              initialValue: fieldName,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.searchBar.model.searchBar.fieldName')
                        .d('字段名称')}不能为空`
                    ),
                },
              ],
            })(
              isEdit ? (
                <Input disabled />
              ) : (
                <Select
                  showSearch
                  onChange={this.handleChangeField}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {fieldList.map((item) => (
                    <Select.Option value={item.fieldAlias}>{item.fieldName}</Select.Option>
                  ))}
                </Select>
              )
            )}
          </Form.Item>
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('fieldNameTemp', {
              initialValue: fieldName,
            })}
          </Form.Item>
          {/* {getFieldValue('fieldName') && (
            <> */}
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('widget.fieldWidget', { initialValue: fieldWidget })}
            {getFieldDecorator('fieldWidget', { initialValue: fieldWidget })}
            {getFieldDecorator('sourceCode', { initialValue: sourceCode })}
            {getFieldDecorator('multipleFlag', { initialValue: multipleFlag })}
            {getFieldDecorator('format', { initialValue: dateFormat })}
            {getFieldDecorator('widget.dateFormat', { initialValue: dateFormat })}
            {getFieldDecorator('widget.lovEnhanceFlag', { initialValue: lovEnhanceFlag })}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型')}>
            {getFieldDecorator('widget.fieldWidgetMeaning', {
              initialValue: widgetTypeObj[fieldWidget],
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hpfm.searchBar.model.searchBar.sourceCode').d('数据来源值集')}
            style={{
              display: ['LOV', 'SELECT'].includes(getFieldValue('widget.fieldWidget'))
                ? 'block'
                : 'none',
            }}
          >
            {getFieldDecorator('widget.sourceCode', {
              initialValue: sourceCode,
            })(<Input disabled />)}
          </Form.Item>
          {getFieldValue('widget.fieldWidget') === 'DATE_PICKER' && modelFieldFlag && (
            <Form.Item label={intl.get('hpfm.searchBar.model.searchBar.defaultComparison').d('默认筛选方式')}>
              {getFieldDecorator('comparison', {
                initialValue: defaultComparisonMeaning,
              })(<Input disabled />)}
            </Form.Item>
          )}
          {getFieldValue('widget.lovEnhanceFlag') !== 1 && showDefaultValue && (
            <div className={styles['fx-row']}>
              <Form.Item label={intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值')}>
                {getFieldDecorator('proDefaultFlag', {
                  initialValue: proDefaultFlag || 0,
                })(
                  <Select
                    onChange={this.handleChangeDefaultFlag}
                    style={{ width: '20%', marginRight: '8px' }}
                  >
                    <Select.Option value={0}>
                      {intl.get('hpfm.customize.common.fixed').d('固定值')}
                    </Select.Option>
                    <Select.Option value={1}>
                      {intl.get('hpfm.customize.common.expression').d('公式')}
                    </Select.Option>
                  </Select>
                )}
                {this.renderDefaultValueItem(defaultComparison)}
              </Form.Item>
              <Tooltip
                placement="right"
                title={intl.get('hpfm.individual.model.config.condition').d('条件配置')}
              >
                <span className={styles['fx-alink']} style={{ display: 'inline-block' }}>
                  <Badge dot={(valids || []).length > 0}>
                    <a
                      style={{ lineHeight: '32px' }}
                      // disabled={props.disabled}
                      className={(valids || []).length > 0 ? 'active' : ''}
                      onClick={() => this.toggleDefaultValueModal()}
                    >
                      fx
                    </a>
                  </Badge>
                </span>
              </Tooltip>
            </div>
          )}
        </Form>
        <Form layout="horizontal" className={styles['searchBar-form-horizontal']}>
          {/* {['LOV', 'SELECT'].includes(getFieldValue('widget.fieldWidget')) && (
            <Form.Item>
              {getFieldDecorator('widget.multipleFlag', {
                initialValue: multipleFlag
              })(
                <Checkbox checkedValue={1} unCheckedValue={0} disabled>
                  {intl.get('hpfm.searchBar.model.searchBar.multiple').d('多选')}
                </Checkbox>
              )}
            </Form.Item>
          )} */}
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('widget.multipleFlag', {
              initialValue: multipleFlag,
            })}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('fixedFlag', {
              initialValue: fixedFlag,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                // onChange={() => this.handleChangeFieldFlag('fixedFlag')}
              >
                {intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结')}
              </Checkbox>
            )}
          </Form.Item>
          {/* {(fieldWidget ? fieldWidget === 'INPUT' : (!getFieldValue('widget.fieldWidget') ||
            getFieldValue('widget.fieldWidget') === 'INPUT'))
            && modelId != -1 && (
            <Form.Item>
              {getFieldDecorator('mergeFlag', {
                initialValue: mergeFlag || 0,
              })(
                // <Checkbox
                //   checkedValue={1}
                //   unCheckedValue={0}
                //   disabled={!this.checkMergeFieldNum()}
                //   onChange={() => this.handleChangeFieldFlag('mergeFlag')}
                // >
                //   {intl.get('hpfm.searchBar.model.searchBar.mergeSearch').d('合并查询')}
                //   {!this.checkMergeFieldNum() && (
                //     <Tooltip title={intl.get('hpfm.searchBar.view.message.tip1').d('合并查询字段数量不能超过2个')}>
                //       <Icon type="exclamation-circle" style={{ marginLeft: '8px' }} />
                //     </Tooltip>
                //   )}
                // </Checkbox>
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  // disabled={!this.checkMergeFieldNum()}
                  onChange={() => this.handleChangeFieldFlag('mergeFlag')}
                >
                  {intl.get('hpfm.searchBar.model.searchBar.mergeSearch').d('合并查询')}
                </Checkbox>
              )}
            </Form.Item>
          )} */}
        </Form>
        <div className={styles['model-bottom-button']}>
          <Button
            type="primary"
            loading={saveLoading}
            style={{ marginRight: 8 }}
            htmlType="submit"
            onClick={this.handleOk}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={this.handleClose} disabled={saveLoading}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
        {defaultValueVisible && (
          <DefaultValueModal
            destroyOnClose
            externalForm={form}
            ctxParams={this.ctxParams}
            visible={defaultValueVisible}
            unitType={unitType}
            unitId={id}
            unitList={conUnitList}
            selfValidator={defaultValueFx}
            updateSelfValidator={this.updateDefaultValueFx}
            // fieldId={record.configFieldId}
            // paramList={record.paramList}
            fieldList={conFieldList}
            onClose={this.toggleDefaultValueModal}
            codes={codes}
            headerProps={defaultValueProps}
            conditionList={defaultConList}
            validatorList={defaultValidList}
          />
        )}
      </Drawer>
    );
  }
}
