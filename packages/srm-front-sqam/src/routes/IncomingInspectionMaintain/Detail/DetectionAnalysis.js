/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Select, InputNumber } from 'hzero-ui';
import { isUndefined } from 'lodash';
import classNames from 'classnames';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
// @withCustomize({
//   unitCode: ['SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS'],
// })
export default class PurchaseRequestHeader extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      detailHeader = {},
      form,
      enumMap = {},
      setModelDetailHeader,
      customizeForm,
    } = this.props;
    const {
      badReason,
      assessmentResult,
      // assessmentResultMeaning,
      badCategory,
      // badCategoryMeaning,
      decisionResult,
      // decisionResultMeaning,
      // inspectionState,
      // inspectionStateMeaning,
      qualityScore,
    } = detailHeader;
    const {
      badCategoryMap = [],
      assessmentResultMap = [],
      decisionResultMap = [],
      // inspectionStateMap = [],
    } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;
    const decisionResultCodeSet = new Set(decisionResultMap.map((item) => item.parentValue));
    decisionResultCodeSet.delete(undefined);
    return customizeForm(
      {
        code: 'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.ANALYSIS',
        form,
        dataSource: detailHeader,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`)
                .d('评估结果')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('assessmentResult', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(
                          `${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`
                        )
                        .d('评估结果'),
                    }),
                  },
                ],
                initialValue: assessmentResult,
              })(
                <Select
                  allowClear
                  onChange={() => {
                    form.setFieldsValue({
                      decisionResult: '',
                      badCategory: null,
                      badReason: null,
                    });
                    setModelDetailHeader({ decisionResultMeaning: '', decisionResult: '' });
                  }}
                >
                  {assessmentResultMap.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.decisionResult`)
                .d('决策结果')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('decisionResult', {
                rules: [
                  {
                    required: false || decisionResultCodeSet.has(getFieldValue('assessmentResult')),
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(
                          `${promptCode}.view.message.model.incomingInspectionQuery.decisionResult`
                        )
                        .d('决策结果'),
                    }),
                  },
                ],
                initialValue: decisionResult,
              })(
                <Select
                  allowClear
                  disabled={!decisionResultCodeSet.has(getFieldValue('assessmentResult'))}
                >
                  {decisionResultMap
                    .filter(
                      (item) =>
                        isUndefined(item.parentValue) ||
                        item.parentValue === getFieldValue('assessmentResult')
                    )
                    .map((item) => (
                      <Select.Option key={item.value}>{item.meaning}</Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.qualityScore`)
                .d('质量记分')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('qualityScore', {
                initialValue: qualityScore,
              })(<InputNumber style={{ width: '100%' }} allowThousandth />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'writable-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.badCategory`)
                .d('不良分类')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('badCategory', {
                initialValue: badCategory,
                rules: [
                  {
                    required: form.getFieldValue('assessmentResult') === 'defective',
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(`${promptCode}.view.message.model.incomingInspectionQuery.badCategory`)
                        .d('不良分类'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {badCategoryMap.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.badReason`)
                .d('不良原因')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('badReason', {
                initialValue: badReason,
                rules: [
                  {
                    required: form.getFieldValue('assessmentResult') === 'defective',
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(`${promptCode}.view.message.model.incomingInspectionQuery.badReason`)
                        .d('不良原因'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
