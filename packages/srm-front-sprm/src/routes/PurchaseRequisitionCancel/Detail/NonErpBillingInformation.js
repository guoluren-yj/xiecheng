/*
 * NonErpBillingInformation - 非Erp采购申请头信息
 * @date: 2019-02-22
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Row, Col } from 'hzero-ui';

import classnames from 'classnames';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sprm.common.model.common';

export default class NonErpBillingInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { headerInfo = {} } = this.props;
    const {
      taxRegisterNum,
      taxRegisterAddress,
      taxRegisterBank,
      taxRegisterBankAccount,
      taxRegisterTel,
      invoiceTypeName,
      invoiceTitle,
      invoiceMethodName,
      invoiceTitleTypeName,
      invoiceDetailTypeName,
    } = headerInfo;
    return (
      <Fragment>
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
              value={invoiceTypeName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceType`).d('发票类型')}
              value={invoiceTitleTypeName}
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
      </Fragment>
    );
  }
}
