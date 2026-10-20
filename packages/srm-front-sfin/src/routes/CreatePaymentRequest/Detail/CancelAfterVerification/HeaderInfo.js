import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { Row, Col, Form, Spin } from 'hzero-ui';
import DisplayFormItem from '@/routes/components/DisplayFormItem';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import styles from './index.less';
import { thousandBitSeparator } from '@/routes/utils';

const commonPrompt = 'sfin.payment.common';
@Form.create({ fieldNameProp: null })
export default class DetailHeader extends Component {
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
                  label={intl.get(`entity.roles.operator`).d('操作人')}
                  value={headerInfo.userName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`${commonPrompt}.invoiceNum`).d('SRM发票号')}
                  value={headerInfo.invoiceNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl
                    .get(`${commonPrompt}.notCancelVerificationAmount`)
                    .d('发票未核销金额')}
                  value={thousandBitSeparator(
                    headerInfo.notCancelVerificationAmount,
                    headerInfo.amountPrecision
                  )}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`${commonPrompt}.currencyCode`).d('币种')}
                  value={headerInfo.currencyCode}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`${commonPrompt}.laveAmount`).d('剩余可付金额')}
                  value={thousandBitSeparator(headerInfo.laveAmount, headerInfo.amountPrecision)}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl
                    .get(`${commonPrompt}.totalCancelVerificationAmount`)
                    .d('本次核销金额合计')}
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
