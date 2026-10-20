import React, { Component } from 'react';
import { Row, Col, Form, Rate } from 'hzero-ui';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

// import DisplayFormItem from '../../components/DisplayFormItem';
// import styles from './index.less';
@Form.create({ fieldNameProp: null })
export default class Evaluation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { evaluationDataSource = {}, customizeForm, form } = this.props;
    const { getFieldDecorator } = form;
    const { poScore, poEvaluation } = evaluationDataSource;
    return customizeForm(
      {
        form,
        dataSource: evaluationDataSource,
        code: 'SODR.SEND_ORDER_DETAIL.EVALUATE',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('sodr.common.model.common.poScore').d('订单评分')}>
              {getFieldDecorator('poScore', { initialValue: poScore })(
                <Rate disabled allowClear={false} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get('sodr.common.model.common.poEvaluation').d('订单评价')}>
              {getFieldDecorator('poEvaluation', { initialValue: poEvaluation })(
                <span>{poEvaluation}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
