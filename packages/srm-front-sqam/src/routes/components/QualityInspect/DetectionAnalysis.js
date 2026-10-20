/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classNames from 'classnames';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class PurchaseRequestHeader extends PureComponent {

  formtContent = () => {
    const { form, detailHeader = {} } = this.props;
    const {
      badReason,
      assessmentResultMeaning,
      badCategoryMeaning,
      decisionResultMeaning,
      qualityScore,
    } = detailHeader;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`)
                .d('评估结果')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('assessmentResult')(<span>{assessmentResultMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.decisionResult`)
                .d('决策结果')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('decisionResult')(<span>{decisionResultMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.qualityScore`)
                .d('质量记分')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('qualityScore')(<span>{qualityScore}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'read-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.badCategory`)
                .d('不良分类')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('badCategory')(<span>{badCategoryMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.badReason`)
                .d('不良原因')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('badReason')(<span>{badReason}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, detailHeader = {}, customizeForm } = this.props;
    return customizeForm ? (
      customizeForm(
        {
          code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.ANALYSIS',
          form,
          dataSource: detailHeader,
        },
        this.formtContent()
      )
    ) : (this.formtContent());
  }
}
