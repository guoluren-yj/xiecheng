import React, { Component } from 'react';
import { Row, Col, Form, Rate } from 'hzero-ui';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../components/DisplayFormItem';
import styles from './index.less';

export default class Evaluation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { evaluationDataSource = {} } = this.props;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get('sodr.common.model.common.poScore').d('订单评分')}
              value={<Rate disabled value={evaluationDataSource.poScore} allowClear={false} />}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={styles.lastHeaderInfo}>
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get('sodr.common.model.common.poEvaluation').d('订单评价')}
              value={evaluationDataSource.poEvaluation}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
