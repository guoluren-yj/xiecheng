import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sprm.common.model.common';

export default class InvoiceInfo extends PureComponent {
  render() {
    const { dataSource } = this.props;
    const {
      invoiceTitle,
      taxRegisterNum,
      taxRegisterAddress,
      taxRegisterTel,
      taxRegisterBank,
      taxRegisterBankAccount,
      invoiceMethodName,
      invoiceTypeName,
      invoiceTitleTypeName,
      invoiceDetailTypeName,
    } = dataSource;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceTitle`).d('发票抬头')}
              value={invoiceTitle}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterNum`).d('税务登记号')}
              value={taxRegisterNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址')}
              value={taxRegisterAddress}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterTel`).d('公司电话')}
              value={taxRegisterTel}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行')}
              value={taxRegisterBank}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号')}
              value={taxRegisterBankAccount}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式')}
              value={invoiceMethodName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式')}
              value={invoiceTitleTypeName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceType`).d('发票类型')}
              value={invoiceTypeName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row', 'last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细')}
              value={invoiceDetailTypeName}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
