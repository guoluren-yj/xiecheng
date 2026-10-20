/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */

import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Row,
  Col,
  Checkbox,
  Badge,
  TreeSelect,
  Radio,
  Icon,
  Tooltip,
  Dropdown,
  Menu,
} from 'hzero-ui';
import { Text } from 'choerodon-ui';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import intl from 'hzero-front/lib/utils/intl';
import Lov from 'hzero-front/lib/components/Lov';
import TLEditor from 'hzero-front/lib/components/TLEditor';
import SelectFieldLov from '@/components/SelectFieldLov';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import {
  colOptions,
  getFieldCodeAlias,
  getWidgetAlias,
  getFieldNameAlias,
  getDefaultActiveAlias,
  getSingleTenantValueCodeSite,
  SEARCHBAR_MUTLIPLE_COMPONENT,
  SEARCHBAR_RANGE_COMPONENT,
  FilterComponentList,
  getParamsBtnName,
  limitWidgetTypeByColumnType,
  FIX_DATE_RANGES,
} from '../../../../utils/constConfig.js';
import styles from '../../style/index.less';

const Checkbox0: any = Checkbox;
const Lov0: any = Lov;
const Button0: any = Button;
const FormItem = Form.Item;
const { Option, OptGroup } = Select;
const RadioGroup = Radio.Group;
const formsLayouts = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default class Default extends React.Component<any> {
  fieldWidgetFilter = (inputValue, columnType) => {
    const limitWidget = limitWidgetTypeByColumnType((columnType || "").toLowerCase());
    if (['SECTION'].includes((this.props.unitInfo || {}).unitType)) {
      return ['SECTION', 'FORM', 'GRID'].includes(inputValue);
    } else if (['SECTION', 'FORM', 'GRID'].includes(inputValue)) {
      return false;
    } else if (!limitWidget || !limitWidget.length || limitWidget.includes(inputValue)) {
      return true;
    } else return 0;
  };

  changeCardUnit = value => {
    this.props.form.setFieldsValue({
      fieldCode: value,
    });
  };

  renderDateWhereOption = ({ value, meaning }) => {
    const { form } = this.props;
    const { getFieldValue, setFieldsValue } = form;
    const currentFieldValue = getFieldValue('whereOption') || [];
    const isDefault = currentFieldValue && currentFieldValue[0] === value;
    const isSelected = currentFieldValue && currentFieldValue.includes(value);
    return (
      <div className={styles['dropdown-select-option-item']}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Text>{meaning}</Text>
          {isDefault && (
            <span className={styles['dropdown-select-option-item-default']}>{intl.get('hzero.common.status.default').d('默认')}</span>
          )}
        </div>
        {isSelected && !isDefault && (
          <div onClick={event => event.stopPropagation()}>
            <Dropdown
              overlay={(
                <Menu
                  onClick={({ key }) => {
                    if (key === 'default') {
                      setFieldsValue({ whereOption: [value].concat(currentFieldValue.filter(i => i !== value)) });
                    }
                  }}
                >
                  <Menu.Item key="default">
                    {intl.get('hpfm.individuationUnit.button.setDefault').d('设为默认')}
                  </Menu.Item>
                </Menu>
              )}
            >
              <Icon type="ellipsis" className={styles['dropdown-select-option-item-menu']} />
            </Dropdown>
          </div>
        )}
      </div>
    )
  }

  render() {
    const {
      props: {
        data,
        // modelId,
        unitInfo,
        readOnly,
        dateFormat,
        widgetType,
        condOptions,
        relationModals,
        renderOptions,
        handleChangeField,
        toggleParamsModal,
        onComponentChange,
        renderOtherOptions,
        changeMultipleFlag,
        getComponentWhereOption,
        changeFieldMergeFlag,
        handleChangeFieldNameType,
        handleChangeModel,
        aggregationGroup = [],
        form: { getFieldDecorator, setFieldsValue, getFieldValue, getFieldsValue },
        labelCode,
      },
    } = this;
    const {
      field = {},
      aggregationFlag,
      aggregationCode,
      fieldVisible,
      fieldRequired,
      fieldEditable,
      fieldName,
      modelFieldName,
      cuszFieldName,
      modelFieldFlag,
      fieldId,
      columnType,
      fieldCode,
      // 卡片关联单元名称
      relatedUnitName,
      fieldNameType,
      fieldAlias,
      showFieldFlag,
      labelCol,
      wrapperCol,
      defaultActive,
      bindField,
      // eventCode,
      displayField,
      promptKey,
      promptCode,
      valueField,
      renderOptions: fieldRenderOptions,
      sortedFlag,
      widget = {},
      gridSeq,
      mergeFlag,
      _token,
      helpMessage,
      backgroundText,
    } = data;
    const { modelName, fieldCategoryMeaning } = field;
    const { id, unitType, sortedEnabled, unitCode, unitGroupId } = unitInfo;
    const pureVirtual = ['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType);
    const widgetVisible = ['SECTION', 'FORM', 'GRID', 'SEARCHBAR', 'FILTER', 'QUERYFORM'].includes(
      unitType
    );
    const unitTags = (unitInfo.unitTag || '').split(",");
    const defaultActiveVisible = ['TABPANE', 'COLLAPSE'].includes(unitType);
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const isSeachBarType = unitType === 'SEARCHBAR';
    const hasRenderControl = !pureVirtual && !['SEARCHBAR'].includes(unitType);
    const isCreate = isEmpty(data) || !data.id;
    const {
      fieldWidget: formFieldWidget = (field.modelFieldWidget || {}).fieldWidget,
    } = getFieldsValue();
    const enableValueParam = ['LOV', 'DATE_PICKER'].includes(formFieldWidget);
    // const isVirtual = modelId == -1 || getFieldValue('isModelField') == 0;
    const isVirtual = isCreate ? getFieldValue('isModelField') == 0 : !modelFieldFlag;
    let whereOption = data.whereOption;
    if (formFieldWidget === 'DATE_PICKER' && !isVirtual && whereOption && whereOption.includes('IN')) {
      whereOption = whereOption.replaceAll('IN', 'RANGE');
    }
    const { options, defaultOption } = getComponentWhereOption();
    let widgetTypeOptions = widgetType || [];
    if (isSeachBarType) {
      widgetTypeOptions = widgetTypeOptions.filter(item =>
        FilterComponentList.includes(item.value)
      );
    }
    const fieldWidgetFieldValue = getFieldValue('fieldWidget');
    const searchBarPlaceholderFlag =
      getFieldValue('mergeFlag') !== 1 &&
      (!fieldWidgetFieldValue ||
        fieldWidgetFieldValue === 'INPUT' ||
        (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidgetFieldValue) &&
          getFieldValue('widget.multipleFlag') !== 1));
    const hasAggregation = unitType === "TABPANE" && unitTags.includes('DOUBLETABS');
    const formAggregationFlag = getFieldValue('aggregationFlag');
    const visibleAggrgationCode = hasAggregation && !formAggregationFlag;
    const isSelectMode = ['SELECT', "RADIOGROUP"].includes(getFieldValue('fieldWidget'));
    const lovPara: any = {}
    if (labelCode) {
      lovPara.labelCode = labelCode;
    }
    if (isSelectMode) {
      lovPara.lovGridQueryFlag = 0;
    }
    return (
      <>
        <Form className={styles['unit-editor-form2']}>
          <FormItem style={{ display: isCreate && !pureVirtual ? 'block' : 'none' }}>
            {getFieldDecorator('isModelField', {
              // initialValue: pureVirtual || (!isCreate && modelId == -1) ? 0 : 1,
              initialValue: pureVirtual || (!isCreate && !modelFieldFlag) ? 0 : 1,
            })(
              <Checkbox0
                checkedValue={1}
                unCheckedValue={0}
                onChange={v =>
                  setFieldsValue({
                    fieldNameType: v.target.checked
                      ? 'MODEL'
                      : isSeachBarType
                        ? 'CUSTOMIZE'
                        : 'DEFAULT',
                    modelCode: !v.target.checked ? -1 : (relationModals[0] || {}).value,
                    fieldWidget: undefined,
                    'widget.dateFormat': undefined,
                    'widget.sourceCode': undefined,
                    'widget.multipleFlag': undefined,
                    fieldId: !v.target.checked ? -1 : undefined,
                  })
                }
              >
                {intl
                  .get('hpfm.individuationUnit.model.individuationUnit.isModelField')
                  .d('创建模型字段')}
              </Checkbox0>
            )}
          </FormItem>
          <FormItem
            label={getDefaultActiveAlias(unitType)}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            style={{ display: defaultActiveVisible ? 'block' : 'none' }}
          >
            {getFieldDecorator('defaultActive', {
              initialValue: isCreate ? -1 : defaultActive,
            })(
              <Select {...({ style: { width: '100%' } } as any)}>
                {condOptions.map(item => (
                  <Option value={Number(item.value)}>{item.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem style={{ display: hasAggregation ? 'inline-block' : 'none', width: '48%' }}>
            {getFieldDecorator('aggregationFlag', {
              initialValue: aggregationFlag || 0,
            })(
              <Checkbox0 disabled={!isCreate} checkedValue={1} unCheckedValue={0}>
                {intl.get('hpfm.customize.common.aggregationFlag').d('聚合组')}
              </Checkbox0>
            )}
          </FormItem>
        </Form>
        <Form layout={LabelLayout.vertical as any} className={styles['unit-editor-form']}>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.modelName')
              .d('所属模型')}
            style={{ display: getFieldValue('isModelField') == 1 ? 'block' : 'none' }}
          >
            {getFieldDecorator('modelCode', {
              initialValue:
                getFieldValue('isModelField') == 0
                  ? -1
                  : !isCreate
                    ? modelName
                    : (relationModals[0] || {}).value,
              rules: [
                {
                  required: getFieldValue('isModelField') == 1 && isCreate,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.modelName')
                        .d('所属模型'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.modelName')
                        .d('所属模型')}不能为空`
                    ),
                },
              ],
            })(
              !isCreate ? (
                <Input disabled />
              ) : (
                <TreeSelect
                  allowClear
                  style={{ width: '100%' }}
                  treeDefaultExpandAll
                  treeData={relationModals}
                  onChange={handleChangeModel}
                />
              )
            )}
          </FormItem>
          <FormItem label={getFieldCodeAlias(unitType)}>
            {getFieldDecorator('fieldCode', {
              initialValue: fieldCode,
              rules: [
                {
                  required: isCreate,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: getFieldCodeAlias(unitType),
                  }),
                },
                {
                  validator: (_, v, cb) => {
                    let reg = /^[a-zA-Z][a-zA-Z0-9_\-.]*$/;
                    if (unitType === "SECTION") reg = /^[a-zA-Z0-9_\-.]*$/;
                    if (reg.test(v || "")) {
                      cb();
                      return;
                    }
                    cb(intl.get("hpfm.customize.common.validate.fieldCodeAlias.rule1").d("格式错误，请输入数字、字母"));
                  }
                }
              ],
            })(
              !isCreate || getFieldValue('isModelField') == 0 ? (
                <Input
                  trimAll
                  inputChinese={false}
                  disabled={!isCreate || (unitType === 'SECTION' && formFieldWidget)}
                />
              ) : (
                <SelectFieldLov
                  disabled={!getFieldValue('modelCode')}
                  queryParams={{
                    unitId: id,
                    modelCode: getFieldValue('modelCode'),
                  }}
                  onChangeField={handleChangeField}
                />
              )
            )}
            {getFieldDecorator('columnType', { initialValue: columnType })}
            {getFieldDecorator('fieldId', { initialValue: fieldId })}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.individual.model.config.fieldNameOrigin').d('字段名称来源')}
          >
            {getFieldDecorator('fieldNameType', {
              initialValue:
                fieldNameType ||
                (pureVirtual
                  ? 'DEFAULT'
                  : getFieldValue('isModelField') == 1
                    ? 'MODEL'
                    : isSeachBarType
                      ? 'CUSTOMIZE'
                      : 'DEFAULT'),
            })(
              <RadioGroup onChange={handleChangeFieldNameType}>
                {!pureVirtual && getFieldValue('isModelField') == 1 && (
                  <Radio value="MODEL">
                    {intl.get('hpfm.individual.view.option.model').d('模型')}
                    <Tooltip
                      title={intl.get('hpfm.individual.view.tooltip.fromModel').d('取自模型')}
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ fontWeight: 400, marginLeft: '4px' }}
                      />
                    </Tooltip>
                  </Radio>
                )}
                {!pureVirtual && isSeachBarType && (
                  <Radio value="CUSTOMIZE">
                    {intl.get('hpfm.individual.view.option.customize').d('自定义')}
                  </Radio>
                )}
                {!isSeachBarType && (
                  <Radio value="DEFAULT">
                    {intl.get('hpfm.individual.view.option.refCode').d('引用代码')}
                    <Tooltip
                      title={intl
                        .get('hpfm.individual.view.tooltip.refCode')
                        .d('选择引用代码后，个性化配置的字段名称仅在配置页面展示使用')}
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ fontWeight: 400, marginLeft: '4px' }}
                      />
                    </Tooltip>
                  </Radio>
                )}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label={getFieldNameAlias(unitType)}>
            {getFieldDecorator('modelFieldName', { initialValue: modelFieldName })}
            {getFieldDecorator('fieldName', {
              initialValue: !isCreate
                ? getFieldValue('fieldNameType') === 'CUSTOMIZE'
                  ? cuszFieldName
                  : fieldName
                : null,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: getFieldNameAlias(unitType),
                    })
                    .d(`${getFieldNameAlias(unitType)}不能为空`),
                },
              ],
            })(
              getFieldValue('fieldNameType') !== 'MODEL' ? (
                <TLEditor
                  label={getFieldNameAlias(unitType)}
                  field="fieldName"
                  token={_token}
                  disabled={!isVirtual && getFieldValue('fieldCode') === undefined}
                />
              ) : (
                <Input disabled />
              )
            )}
          </FormItem>
          {getFieldValue('fieldNameType') === 'PROMPT' && !pureVirtual && (
            <FormItem
              label={intl
                .get('hpfm.individual.model.config.fieldNameOriginCode')
                .d('字段名称来源编码')}
            >
              {getFieldDecorator('promptKey', { initialValue: promptKey })}
              {getFieldDecorator('promptCode', { initialValue: promptCode })}
              {getFieldDecorator('fieldNameOriginCode', {
                initialValue: promptKey && promptCode ? `${promptKey}.${promptCode}` : '',
              })(<Input disabled />)}
            </FormItem>
          )}
          {getFieldValue('isModelField') == 1 ? (
            <FormItem
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.fieldAlias')
                .d('字段别名')}
            >
              {getFieldDecorator('fieldAlias', {
                initialValue: !isCreate ? fieldAlias : undefined,
                rules: [
                  {
                    required: !isVirtual,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.fieldAlias')
                        .d('字段别名'),
                    }),
                  },
                  {
                    validator: (_, val, cb) => {
                      if (/_/.test(val || '')) {
                        cb(
                          intl.get('hpfm.customize.common.validate.noUnderLine').d('不可包含下划线')
                        );
                      } else if(!/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(val || '')) {
                        cb(
                          intl.get('hpfm.customize.common.validate.onlyCharOrNum').d('仅支持以字母开头的数字字母组合')
                        );
                      } else cb();
                    },
                  },
                ],
              })(<Input />)}
            </FormItem>
          ) : null}
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.fieldType')
              .d('字段类型')}
            style={{ display: getFieldValue('isModelField') == 1 ? 'block' : 'none' }}
          >
            {getFieldDecorator('fieldCategoryMeaning', {
              initialValue: !isCreate ? fieldCategoryMeaning : '',
            })(<Input disabled />)}
          </FormItem>
          {!isSeachBarType && (
            <FormItem
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.bindField')
                .d('字段绑定')}
              style={{ display: !pureVirtual ? 'block' : 'none' }}
            >
              {getFieldDecorator('bindField', {
                initialValue: bindField,
              })(<Input trim inputChinese={false} />)}
            </FormItem>
          )}
          {isSeachBarType && getFieldValue('mergeFlag') !== 1 && (
            <FormItem label={intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示')}>
              {getFieldDecorator('helpMessage', {
                initialValue: helpMessage,
              })(
                <TLEditor
                  label={intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示')}
                  field="helpMessage"
                  token={_token}
                />
              )}
            </FormItem>
          )}
          {isSeachBarType && searchBarPlaceholderFlag && (
            <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
              {getFieldDecorator('backgroundText', {
                initialValue: backgroundText,
              })(
                <TLEditor
                  label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}
                  field="backgroundText"
                  token={_token}
                />
              )}
            </FormItem>
          )}
          {isFormType ? (
            <FormItem
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.labelWrapperCol')
                .d('标签组件比例')}
            >
              {getFieldDecorator('labelCol', {
                initialValue: labelCol,
              })(
                <Select
                  {...({
                    allowClear: true,
                    showSearch: true,
                    style: { width: '46%', float: 'left', marginRight: '8%' },
                    placeholder: intl
                      .get('hpfm.individuationUnit.model.individuationUnit.label')
                      .d('标签'),
                  } as any)}
                >
                  {colOptions.map(i => (
                    <Option value={i}>{i}</Option>
                  ))}
                </Select>
              )}
              {getFieldDecorator('wrapperCol', {
                initialValue: wrapperCol,
              })(
                <Select
                  {...({
                    allowClear: true,
                    showSearch: true,
                    style: { width: '46%' },
                    placeholder: intl
                      .get('hpfm.individuationUnit.model.individuationUnit.wrapper')
                      .d('组件'),
                  } as any)}
                >
                  {colOptions.map(i => (
                    <Option value={i}>{i}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : null}
          {visibleAggrgationCode && (
          <FormItem label={intl.get('hpfm.customize.common.aggregationCode').d('所在聚合组')}>
            {getFieldDecorator('aggregationCode', {
                initialValue: aggregationCode,
              })(
                <Select {...({ allowClear: true, style: { width: '100%' } } as any)}>
                  <Option value="__no_aggregation__">
                    ---{intl.get('hpfm.customize.common.noAggregation').d('取消聚合')}---
                  </Option>
                  {aggregationGroup.map(item => (
                    <Option value={item.fieldCodeAlias}>{item.fieldName}</Option>
                  ))}
                </Select>
              )}
          </FormItem>
          )}
          {hasRenderControl && (
            <FormItem
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.renderType')
                .d('渲染方式')}
            >
              {getFieldDecorator('renderOptions', {
                initialValue: fieldRenderOptions || 'WIDGET',
                rules: [
                  {
                    required: getFieldValue('isModelField') == 1,
                    message: intl
                      .get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.individuationUnit.model.individuationUnit.renderType')
                          .d('渲染方式'),
                      })
                      .d(
                        `${intl
                          .get('hpfm.individuationUnit.model.individuationUnit.renderType')
                          .d('渲染方式')}不能为空`
                      ),
                  },
                ],
              })(
                <Select {...({} as any)}>
                  {renderOptions.map(item => {
                    if (isCreate && readOnly && item.value === 'FORM') {
                      return null;
                    }
                    return <Option value={item.value}>{item.meaning}</Option>;
                  })}
                </Select>
              )}
            </FormItem>
          )}
          {isFormType && (
            <FormItem label={intl.get('hpfm.customize.common.isNotMoreField').d('预展示字段')}>
              {getFieldDecorator('showFieldFlag', {
                initialValue: showFieldFlag || 0,
              })(
                <Select {...({} as any)}>
                  <Option value={1}>{intl.get('hzero.common.yes')}</Option>
                  <Option value={0}>{intl.get('hzero.common.no')}</Option>
                </Select>
              )}
            </FormItem>
          )}
          <FormItem
            label={getWidgetAlias(unitType)}
            style={{
              display: widgetVisible ? 'block' : 'none',
            }}
          >
            {getFieldDecorator('fieldWidget', {
              initialValue:
                (widget || {}).fieldWidget ||
                ((data.field || {}).modelFieldWidget || {}).fieldWidget,
              rules: [
                {
                  required: getFieldValue('renderOptions') === 'WIDGET',
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: getWidgetAlias(unitType),
                    })
                    .d(`${getWidgetAlias(unitType)}不能为空`),
                },
              ],
            })(
              <Select
                {...({
                  onChange: onComponentChange,
                  disabled: unitType === 'SECTION' && !isCreate,
                } as any)}
                allowClear
              >
                {widgetTypeOptions.map(
                  item => {
                    const filterRes = this.fieldWidgetFilter(item.value, getFieldValue("columnType"));
                    if (filterRes === false) return null;
                    if (filterRes === 0) return (
                      <Option value={item.value} disabled>
                        {item.meaning}
                      </Option>
                    )
                    return (
                      <Option value={item.value}>{item.meaning}</Option>
                    )
                  }
                )}
              </Select>
            )}
            {getFieldValue('fieldWidget') === 'TEL_FIELD' && (
              <div style={{ color: '#868D9C', fontSize: '12px', wordBreak: 'break-word', marginTop: '4px' }}>{intl.get('hpfm.customize.view.message.telField.help').d('仅支持C7N页面使用，H0页面无效')}</div>
            )}
          </FormItem>
          {unitType === 'SECTION' && ['FORM', 'GRID', 'SECTION'].includes(formFieldWidget) && (
            <FormItem label={intl.get('hpfm.customize.common.cardRelatedUnit').d('卡片关联单元')}>
              {getFieldDecorator('cardRelatedUnit', {
                initialValue: fieldCode,
              })(
                <Lov
                  disabled={!isCreate}
                  code="HPFM.CUST.UNIT_GROUP.SECTION"
                  textValue={relatedUnitName}
                  onChange={this.changeCardUnit}
                  queryParams={{
                    unitType: formFieldWidget,
                    currentUnitCode: unitCode,
                    unitGroupId,
                  }}
                />
              )}
            </FormItem>
          )}
          {getFieldValue('fieldWidget') === 'DATE_PICKER' && (
            <FormItem
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.dateFormat')
                .d('时间格式')}
            // style={{ display: getFieldValue('renderOptions') === 'WIDGET' ? 'block' : 'none' }}
            >
              {getFieldDecorator('widget.dateFormat', {
                initialValue: (widget || {}).dateFormat,
              })(
                <Select {...({} as any)}>
                  {dateFormat.map(item => (
                    <Option value={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          )}
          {['LOV', 'SELECT', "RADIOGROUP"].includes(getFieldValue('fieldWidget')) && (
            <Form.Item
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.sourceCode')
                .d('数据来源值集')}
            >
              {getFieldDecorator('widget.sourceCode', {
                initialValue: (widget || {}).sourceCode,
              })(
                <Lov0
                  textField="widget.sourceCode"
                  code={getSingleTenantValueCodeSite(isSelectMode)}
                  lovOptions={{
                    displayField: isSelectMode ? 'lovCode' : 'viewCode',
                    valueField: isSelectMode ? 'lovCode' : 'viewCode',
                  }}
                  onChange={() =>
                    setFieldsValue({
                      displayField: undefined,
                      valueField: undefined,
                    })
                  }
                  queryParams={lovPara}
                />
              )}
            </Form.Item>
          )}
          {isSeachBarType && getFieldValue('fieldWidget') === 'LOV' && (
            <Form.Item
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.textField')
                .d('显示字段名')}
            >
              {getFieldDecorator('displayField', {
                initialValue: displayField,
              })(<Input />)}
            </Form.Item>
          )}
          {isSeachBarType && getFieldValue('fieldWidget') === 'LOV' && (
            <Form.Item
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.valueField')
                .d('值字段名')}
            >
              {getFieldDecorator('valueField', {
                initialValue: valueField,
              })(<Input />)}
            </Form.Item>
          )}
          {isSeachBarType && getFieldValue('fieldWidget') === 'LOV' &&
            (isCreate ? !!getFieldValue('isModelField') : !!modelFieldFlag) && (
              <Form.Item>
                {getFieldDecorator('widget.lovEnhanceFlag', {
                  initialValue: (widget || {}).lovEnhanceFlag || 0,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0}>
                    {intl
                      .get('hpfm.individuationUnit.model.individuationUnit.lovEnhanceFlag')
                      .d('支持高级筛选')}
                  </Checkbox0>
                )}
              </Form.Item>
          )}
          {isSeachBarType && sortedEnabled === 1 && (
            <Form.Item>
              {getFieldDecorator('sortedFlag', {
                initialValue: sortedFlag,
              })(
                <Checkbox0 checkedValue={1} unCheckedValue={0}>
                  {intl
                    .get('hpfm.individuationUnit.model.individuationUnit.sortedFlag')
                    .d('可排序')}
                </Checkbox0>
              )}
            </Form.Item>
          )}
          {isSeachBarType && (
            <>
              <Form.Item>
                {getFieldDecorator('fieldEditable', {
                  initialValue: !isNil(fieldEditable) ? fieldEditable : 1,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0}>
                    {intl.get('hpfm.individual.model.config.editableFlag').d('可编辑')}
                  </Checkbox0>
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('fieldVisible', {
                  initialValue: !isNil(fieldVisible) && fieldVisible !== -1 ? fieldVisible : 1,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0}>
                    {intl.get('hpfm.individual.model.config.show').d('显示')}
                  </Checkbox0>
                )}
              </Form.Item>
            </>
          )}
          {isSeachBarType &&
            (!getFieldValue('fieldWidget') || getFieldValue('fieldWidget') === 'INPUT') &&
            getFieldValue('isModelField') == 1 && (
              <Form.Item>
                {getFieldDecorator('mergeFlag', {
                  initialValue: mergeFlag,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0} onChange={changeFieldMergeFlag}>
                    {intl
                      .get('hpfm.individuationUnit.model.individuationUnit.mergeSearch')
                      .d('合并查询')}
                  </Checkbox0>
                )}
              </Form.Item>
            )}
          {isSeachBarType &&
            (!getFieldValue('fieldWidget') ||
              SEARCHBAR_MUTLIPLE_COMPONENT.includes(getFieldValue('fieldWidget')) ||
              (getFieldValue('fieldWidget') === 'DATE_PICKER' && !(isCreate ? getFieldValue('isModelField') : modelFieldFlag))) && (
              <Form.Item>
                {getFieldDecorator('widget.multipleFlag', {
                  initialValue: (widget || {}).multipleFlag,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0} onChange={changeMultipleFlag}>
                    {getFieldValue('fieldWidget') === 'INPUT_NUMBER'
                      ? intl
                        .get('hpfm.individuationUnit.model.individuationUnit.rangeNumber')
                        .d('范围数值')
                      : getFieldValue('fieldWidget') === 'DATE_PICKER'
                        ? intl
                          .get('hpfm.individuationUnit.model.individuationUnit.range')
                          .d('范围时间')
                        : intl
                          .get('hpfm.individuationUnit.model.individuationUnit.mutilFlag')
                          .d('多选')}
                  </Checkbox0>
                )}
              </Form.Item>
            )}
          {isSeachBarType &&
            ((isCreate && getFieldValue('isModelField')) || (!isCreate && modelFieldFlag)) && (
              <Form.Item
                label={(
                  <>
                    {intl.get('hpfm.individuationUnit.model.individuationUnit.filterType').d('筛选方式')}
                    <Tooltip title={intl.get('hpfm.individuationUnit.model.individuationUnit.filterType.help').d('筛选方式中位于第一位的类型为默认筛选方式')}>
                      <Icon type="question-circle-o" style={{ marginLeft: '4px', verticalAlign: 'baseline' }} />
                    </Tooltip>
                  </>
                )}
                style={{
                  display:
                    (getFieldValue('widget.multipleFlag') && getFieldValue('fieldWidget') !== 'DATE_PICKER') || getFieldValue('mergeFlag')
                      ? 'none'
                      : 'block',
                }}
              >
                {getFieldDecorator('whereOption', {
                  initialValue: whereOption ? whereOption.split(',') : defaultOption,
                  // initialValue: whereOption && whereOption.split(','),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.individual.model.config.filterType').d('筛选方式'),
                      }),
                    },
                  ],
                })(
                  getFieldValue('fieldWidget') === 'DATE_PICKER' ? (
                    <Select mode='multiple' dropdownClassName={styles['dropdown-select']} className={styles['date-select']}>
                      <OptGroup label='date_range'>
                        {options.filter(i => FIX_DATE_RANGES.includes(i.value)).map(item =>(
                          <Option key={item.value} value={item.value}>{this.renderDateWhereOption(item)}</Option>
                        ))}
                      </OptGroup>
                      <OptGroup label='common'>
                        {options.filter(i =>  ![...FIX_DATE_RANGES, 'NOTNULL', 'ISNULL'].includes(i.value)).map(item =>(
                          <Option key={item.value} value={item.value}>{this.renderDateWhereOption(item)}</Option>
                        ))}
                      </OptGroup>
                      <OptGroup label='with_null'>
                        {options.filter(i => ['NOTNULL', 'ISNULL'].includes(i.value)).map(item =>(
                          <Option key={item.value} value={item.value}>{this.renderDateWhereOption(item)}</Option>
                        ))}
                      </OptGroup>
                    </Select>
                  ) : (
                    <TreeSelect
                      style={{ width: '100%' }}
                      treeCheckable
                      treeData={options.map(item => ({
                        title: item.meaning,
                        value: item.value,
                        key: item.value,
                      }))}
                    />
                  )                
                )}
              </Form.Item>
            )}
        </Form>
        {isSeachBarType && (
          <Form style={{ marginBottom: 50 }}>
            <Row className={styles['unit-editor-form2']}>
              <Col span={11}>
                <FormItem
                  label={intl
                    .get('hpfm.individuationUnit.model.individuationUnit.position')
                    .d('位置')}
                  labelCol={{ span: 9 }}
                  wrapperCol={{ span: 15 }}
                >
                  {getFieldDecorator('gridSeq', {
                    initialValue: gridSeq,
                  })(<InputNumber style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        {!isSeachBarType && (
          <>
            <Form className={styles['unit-editor-form2']} style={{ width: '100%' }}>
              <FormItem
                {...formsLayouts}
                label={intl.get('hpfm.individuationUnit.model.individuationUnit.visible').d('显示')}
                style={{ marginBottom: 0 }}
              >
                {getFieldDecorator('fieldVisible', {
                  initialValue: fieldVisible === undefined ? -1 : fieldVisible,
                })(
                  <Select {...({ style: { width: '64%', marginRight: "8px" } } as any)}>
                    {condOptions.map(item => (
                      <Option value={Number(item.value)}>{item.meaning}</Option>
                    ))}
                  </Select>
                )}
                {getFieldDecorator('visibleModifyFlag', {
                  initialValue: data.visibleModifyFlag ? 1 : 0,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0}>
                    {intl.get('hpfm.customize.common.modify').d('可修改')}
                  </Checkbox0>
                )}
              </FormItem>
              <FormItem
                {...formsLayouts}
                label={intl
                  .get('hpfm.individuationUnit.model.individuationUnit.editable')
                  .d('编辑')}
                style={{
                  display: getFieldValue('renderOptions') === 'WIDGET' ? 'block' : 'none',
                  marginBottom: 0,
                }}
              >
                {getFieldDecorator('fieldEditable', {
                  initialValue: fieldEditable === undefined ? -1 : fieldEditable,
                })(
                  <Select {...({ style: { width: '64%', marginRight: "8px" } } as any)}>
                    {condOptions.map(item => (
                      <Option value={Number(item.value)}>{item.meaning}</Option>
                    ))}
                  </Select>
                )}
                {getFieldDecorator('editableModifyFlag', {
                  initialValue: data.editableModifyFlag  ? 1 : 0,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0}>
                    {intl.get('hpfm.customize.common.modify').d('可修改')}
                  </Checkbox0>
                )}
              </FormItem>
              <FormItem
                {...formsLayouts}
                label={intl
                  .get('hpfm.individuationUnit.model.individuationUnit.required')
                  .d('必输')}
                style={{
                  display: getFieldValue('renderOptions') === 'WIDGET' ? 'block' : 'none',
                  marginBottom: 0,
                }}
              >
                {getFieldDecorator('fieldRequired', {
                  initialValue: fieldRequired === undefined ? -1 : fieldRequired,
                })(
                  <Select {...({ style: { width: '64%', marginRight: "8px" } } as any)}>
                    {condOptions.map(item => (
                      <Option value={Number(item.value)}>{item.meaning}</Option>
                    ))}
                  </Select>
                )}
                {getFieldDecorator('requiredModifyFlag', {
                  initialValue: data.requiredModifyFlag ? 1 : 0,
                })(
                  <Checkbox0 checkedValue={1} unCheckedValue={0}>
                    {intl.get('hpfm.customize.common.modify').d('可修改')}
                  </Checkbox0>
                )}
              </FormItem>
            </Form>
            <Form style={{ marginBottom: 50 }}>
              {renderOtherOptions()}
              {enableValueParam && (
                <Row>
                  <Button0
                    icon="setting"
                    type="primary"
                    onClick={toggleParamsModal}
                    style={{ width: '100%', maxWidth: 'unset' }}
                  >
                    {getParamsBtnName(formFieldWidget)}
                    <Badge
                      style={{ marginLeft: '8px', height: '16px', lineHeight: '16px' }}
                      count={(data.paramList || []).length}
                    />
                  </Button0>
                </Row>
              )}
            </Form>
          </>
        )}
      </>
    );
  }
}
