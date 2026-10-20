/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */

import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Checkbox,
  InputNumber,
  Badge,
  Col,
  Radio,
  TreeSelect,
  Tooltip,
  Icon,
} from 'hzero-ui';
import isEmpty from 'lodash/isEmpty';
import intl from 'hzero-front/lib/utils/intl';
import Lov from 'hzero-front/lib/components/Lov';
import TLEditor from "hzero-front/lib/components/TLEditor"
import SelectFieldLov from '@/components/SelectFieldLov';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import {
  getFieldCodeAlias,
  getFieldNameAlias,
  getSingleTenantValueCodeSite,
  getParamsBtnName,
  limitWidgetTypeByColumnType,
} from '../../../../utils/constConfig.js';
import styles from '../../style/index.less';

const Checkbox0: any = Checkbox;
const Lov0: any = Lov;
const Button0: any = Button;
const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const formsLayouts = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const formLayout2 = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
export default class Base extends React.Component<any> {
  fieldWidgetFilter = (inputValue, columnType) => {
    const limitWidget = limitWidgetTypeByColumnType((columnType || "").toLowerCase());
    if (['SECTION', 'FORM', 'GRID'].includes(inputValue)) {
      return false;
    } else if (!limitWidget || !limitWidget.length || limitWidget.includes(inputValue)) {
      return true;
    } else return 0;
  };

  render() {
    const {
      props: {
        data,
        // modelId,
        dateFormat,
        unitInfo,
        readOnly,
        widgetType = [],
        condOptions,
        relationModals,
        renderOptions,
        handleChangeField,
        toggleParamsModal,
        onComponentChange,
        handleChangeFieldNameType,
        gridFixedOptions,
        aggregationGroup = [],
        form: { getFieldDecorator, setFieldsValue, getFieldValue, getFieldsValue },
        handleChangeModel,
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
      fieldCode,
      fieldId,
      columnType,
      fieldNameType,
      fieldAlias,
      bindField,
      gridSeq,
      gridFixed,
      formCol,
      renderOptions: fieldRenderOptions,
      widget = {},
      modelFieldFlag,
    } = data;
    const { modelName, fieldCategoryMeaning } = field;
    const { id, unitType } = unitInfo;
    const isCreate = isEmpty(data) || !data.id;
    // const isVirtual = modelId == -1 || getFieldValue('isModelField') == 0;
    const isVirtual = !modelFieldFlag || getFieldValue('isModelField') == 0;
    const unitTags = (unitInfo.unitTag || '').split(",");
    const isC7N = unitTags.includes('C7N');
    const isGroupGrid = unitTags.includes('GROUP-GRID');
    const formAggregationFlag = getFieldValue('aggregationFlag');
    const visibleWidget = !formAggregationFlag;
    const visibleAggrgationCode = isC7N && !formAggregationFlag;
    const {
      fieldWidget: formFieldWidget = (field.modelFieldWidget || {}).fieldWidget,
    } = getFieldsValue();
    const widgetTypeOptions = widgetType || [];
    const enableValueParam = ['LOV', 'DATE_PICKER'].includes(formFieldWidget);
    const isSelectMode = ['SELECT', "RADIOGROUP"].includes(formFieldWidget);
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
          <FormItem
            style={{ display: isCreate ? 'inline-block' : 'none', width: '48%', marginRight: '4%' }}
          >
            {getFieldDecorator('isModelField', {
              initialValue: !isCreate && !modelFieldFlag ? 0 : 1,
            })(
              <Checkbox0
                checkedValue={1}
                unCheckedValue={0}
                onChange={v => {
                  const newFormData: any = {
                    fieldNameType: !v.target.checked ? 'DEFAULT' : 'MODEL',
                    modelCode: !v.target.checked ? -1 : (relationModals[0] || {}).value,
                    fieldWidget: undefined,
                    'widget.dateFormat': undefined,
                    'widget.sourceCode': undefined,
                    'widget.multipleFlag': undefined,
                    fieldId: !v.target.checked ? -1 : undefined,
                  };
                  if (v.target.checked) {
                    newFormData.aggregationFlag = 0;
                  }
                  setFieldsValue(newFormData);
                }}
              >
                {intl
                  .get('hpfm.individuationUnit.model.individuationUnit.isModelField')
                  .d('创建模型字段')}
              </Checkbox0>
            )}
          </FormItem>
          <FormItem style={{ display: isC7N && isVirtual ? 'inline-block' : 'none', width: '48%' }}>
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
            {getFieldDecorator('fieldId', { initialValue: fieldId })}
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
                    if (/^[a-zA-Z][a-zA-Z0-9_\-.]*$/.test(v || "")) {
                      cb();
                      return;
                    }
                    cb(intl.get("hpfm.customize.common.validate.fieldCodeAlias.rule1").d("格式错误，请输入数字、字母"));
                  }
                }
              ],
            })(
              !isCreate || getFieldValue('isModelField') == 0 ? (
                <Input trimAll inputChinese={false} disabled={!isCreate} />
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
          </FormItem>
          <FormItem
            label={intl.get('hpfm.individual.model.config.fieldNameOrigin').d('字段名称来源')}
          >
            {getFieldDecorator('fieldNameType', {
              initialValue:
                fieldNameType || (getFieldValue('isModelField') == 1 ? 'MODEL' : 'CUSTOMIZE'),
            })(
              <RadioGroup onChange={handleChangeFieldNameType}>
                {getFieldValue('isModelField') == 1 && (
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
                <Radio value="DEFAULT">
                  {intl.get('hpfm.individual.view.option.refCode').d('引用代码')}
                  <Tooltip
                    title={intl
                      .get('hpfm.individual.view.tooltip.refCode')
                      .d('选择引用代码后，个性化配置的字段名称仅在配置页面展示使用')}
                  >
                    <Icon type="question-circle-o" style={{ fontWeight: 400, marginLeft: '4px' }} />
                  </Tooltip>
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label={getFieldNameAlias(unitType)}>
            {getFieldDecorator('modelFieldName', { initialValue: modelFieldName })}
            {getFieldDecorator('fieldName', {
              initialValue: !isCreate ? fieldName : null,
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
                  token={data._token}
                  disabled={!isVirtual && getFieldValue('fieldCode') === undefined}
                />
              ) : (
                <Input disabled />
              )
            )}
          </FormItem>
          {getFieldValue('fieldNameType') === 'PROMPT' && (
            <FormItem
              label={intl
                .get('hpfm.individual.model.config.fieldNameOriginCode')
                .d('字段名称来源编码')}
            >
              {getFieldDecorator('fieldNameOriginCode', {
                initialValue: '',
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
          {!formAggregationFlag && (
            <FormItem
              label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.bindField')
                .d('字段绑定')}
            >
              {getFieldDecorator('bindField', {
                initialValue: bindField,
              })(<Input trim inputChinese={false} />)}
            </FormItem>
          )}
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
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.renderType')
              .d('渲染方式')}
            style={{ display: !formAggregationFlag ? 'block' : 'none' }}
          >
            {getFieldDecorator('renderOptions', {
              initialValue: fieldRenderOptions || (formAggregationFlag ? 'TEXT' : 'WIDGET'),
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
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.widgetType')
              .d('组件类型')}
            style={{ display: visibleWidget ? 'block' : 'none' }}
          >
            {getFieldDecorator('fieldWidget', {
              initialValue:
                (widget || {}).fieldWidget || (field.modelFieldWidget || {}).fieldWidget,
              rules: [
                {
                  required: getFieldValue('renderOptions') === 'WIDGET',
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.widgetType')
                        .d('组件类型'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.widgetType')
                        .d('组件类型')}不能为空`
                    ),
                },
              ],
            })(
              <Select {...({ onChange: onComponentChange } as any)} allowClear>
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
                    );
                  }
                )}
              </Select>
            )}
          </FormItem>
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
          {['LOV', 'SELECT', "RADIOGROUP"].includes(formFieldWidget) && (
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
        </Form>
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
            label={intl.get('hpfm.individuationUnit.model.individuationUnit.editable').d('编辑')}
            style={{
              display: visibleWidget ? 'block' : 'none',
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
            label={intl.get('hpfm.individuationUnit.model.individuationUnit.required').d('必输')}
            style={{
              display: visibleWidget ? 'block' : 'none',
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
          <Row className={styles['unit-editor-form2']}>
            <Col span={11}>
              <FormItem
                label={intl
                  .get('hpfm.individuationUnit.model.individuationUnit.position')
                  .d('位置')}
                {...formLayout2}
              >
                {getFieldDecorator('gridSeq', {
                  initialValue: gridSeq,
                })(<InputNumber style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={11} offset={2}>
              <FormItem
                label={intl.get('hpfm.individuationUnit.model.individuationUnit.fixed').d('冻结')}
                {...formLayout2}
              >
                {getFieldDecorator('gridFixed', {
                  initialValue: gridFixed,
                })(
                  <Select {...({ allowClear: true, style: { width: '100%' } } as any)}>
                    {gridFixedOptions.map(item => (
                      <Option value={item.value}>{item.meaning}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            {isGroupGrid && (
              <Col span={11}>
                <FormItem
                  label={`${intl.get('hpfm.individuationUnit.model.individuationUnit.col').d('列')}:`}
                  {...formLayout2}
                >
                  {getFieldDecorator('formCol', {
                    initialValue: formCol,
                  })(<InputNumber style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            )}
          </Row>
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
    );
  }
}
