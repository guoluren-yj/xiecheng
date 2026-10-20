/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */

import React from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Checkbox,
  InputNumber,
  Col,
  Radio,
  Icon,
  Tooltip,
} from 'hzero-ui';
import isEmpty from 'lodash/isEmpty';
import intl from 'hzero-front/lib/utils/intl';
import TLEditor from "hzero-front/lib/components/TLEditor"
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { getFieldCodeAlias, getFieldNameAlias } from '../../../../utils/constConfig.js';
import styles from '../../style/index.less';

const Checkbox0: any = Checkbox;
const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const formsLayouts = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const formLayout2 = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
export default class Base extends React.Component<any> {
  render() {
    const {
      props: {
        data,
        unitInfo,
        condOptions,
        widgetType = [],
        aggregationGroup = [],
        form: { getFieldDecorator, getFieldValue },
      },
    } = this;
    const {
      widget = {},
      aggregationFlag,
      aggregationCode,
      fieldVisible,
      fieldName,
      fieldCode,
      gridSeq,
      fieldNameType,
    } = data;
    const { unitType, unitTag } = unitInfo;
    const isC7NTableBtn = (unitTag || '').indexOf('C7N-TABLE-BTN') > -1;
    const isCreate = isEmpty(data) || !data.id;
    const formAggregationFlag = getFieldValue('aggregationFlag');
    const visibleAggrgationCode = !formAggregationFlag;
    return (
      <>
        <Form className={styles['unit-editor-form2']}>
          <FormItem style={{ display: 'none', width: '48%', marginRight: '4%' }}>
            {getFieldDecorator('isModelField', {
              initialValue: 0,
            })}
          </FormItem>
          <FormItem style={{ display: 'inline-block', width: '48%' }}>
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
            style={{ display: 'none' }}
          >
            {getFieldDecorator('modelId', { initialValue: -1 })}
          </FormItem>
          <FormItem label={getFieldCodeAlias(unitType)}>
            {getFieldDecorator('fieldId', { initialValue: -1 })}
            {getFieldDecorator('fieldCode', {
              initialValue: fieldCode,
              rules: [
                {
                  required: true,
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
            })(<Input trimAll inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.individual.model.config.fieldNameOrigin').d('字段名称来源')}
          >
            {getFieldDecorator('fieldNameType', {
              initialValue: fieldNameType || 'DEFAULT',
            })(
              <RadioGroup>
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
              <TLEditor
                label={getFieldNameAlias(unitType)}
                field="fieldName"
                token={data._token}
              />
            )}
          </FormItem>
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
            style={{ display: 'none' }}
          >
            {getFieldDecorator('renderOptions', {
              initialValue: 'TEXT',
            })}
          </FormItem>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.widgetType')
              .d('组件类型')}
            style={{ display: isC7NTableBtn ? 'block' : 'none' }}
          >
            {getFieldDecorator('fieldWidget', {
              initialValue: (widget || {}).fieldWidget,
            })(
              <Select {...({} as any)}>
                {widgetType.map(item => (
                  <Option value={item.value}>{item.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        </Form>
        <Form className={styles['unit-editor-form2']} style={{ width: '69%' }}>
          <FormItem
            {...formsLayouts}
            label={intl.get('hpfm.individuationUnit.model.individuationUnit.visible').d('显示')}
            style={{ marginBottom: 0 }}
          >
            {getFieldDecorator('fieldVisible', {
              initialValue: fieldVisible === undefined ? -1 : fieldVisible,
            })(
              <Select {...({ style: { width: '93%' } } as any)}>
                {condOptions.map(item => (
                  <Option value={Number(item.value)}>{item.meaning}</Option>
                ))}
              </Select>
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
          </Row>
        </Form>
      </>
    );
  }
}
