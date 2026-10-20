import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { Row, Col, Form, Spin } from 'hzero-ui';
// import classnames from 'classnames';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  // FORM_COL_2_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';
import styles from './index.less';

import DisplayFormItem from '../DisplayFormItem';
import { thousandBitSeparator } from '@/routes/utils';

@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchHeaderLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  acceptanceSheetCreate,
}))
export default class DetailHeader extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  render() {
    const { headerInfo = {}, loading } = this.props;
    return (
      <React.Fragment>
        <Spin spinning={loading || false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Form className={styles['header-form']}>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                  value={headerInfo.supplierCompanyName || headerInfo.supplierName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`entity.company.tag`).d('公司')}
                  value={headerInfo.companyName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.userName`).d('操作人')}
                  value={headerInfo.userName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.invoiceNum`).d('SRM发票号')}
                  value={headerInfo.invoiceNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl
                    .get(`sfin.payment.common.notCancelVerificationAmount`)
                    .d('发票未核销金额')}
                  value={thousandBitSeparator(
                    headerInfo.notCancelVerificationAmount,
                    headerInfo.amountPrecision
                  )}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.laveAmount`).d('剩余付款金额')}
                  value={thousandBitSeparator(headerInfo.laveAmount, headerInfo.amountPrecision)}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl
                    .get(`sfin.payment.common.totalCancelVerificationAmount`)
                    .d('本次销核金额合计')}
                  value={thousandBitSeparator(
                    headerInfo.totalCancelVerificationAmount,
                    headerInfo.amountPrecision
                  )}
                />
              </Col>
            </Row>
          </Form>
        </Spin>
      </React.Fragment>
    );
  }
}
