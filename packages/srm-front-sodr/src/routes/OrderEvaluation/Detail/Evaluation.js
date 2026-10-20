/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-11-12 11:05:52
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-11-25 17:15:11
 */
import React, { Component } from 'react';
import { Row, Col, Form, Input, Rate } from 'hzero-ui';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

const { TextArea } = Input;

export default class Evaluation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { form, customizeForm } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        form,
        code: 'SODR.ORDER_EVALUATE_DETAIL.EVALUATE',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('sodr.common.model.common.poScore').d('订单评分')}
            >
              {getFieldDecorator('poScore', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl.get(`sodr.common.model.common.poScore`).d('订单评分'),
                    }),
                  },
                ],
              })(<Rate allowClear={false} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('sodr.common.model.common.poEvaluation').d('订单评价')}
            >
              {getFieldDecorator('poEvaluation')(<TextArea rows={2} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
