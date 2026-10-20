/**
 * BillingInformation - 收货/收单信息
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Row, Col } from 'hzero-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sodr.sendOrder.model.common';

/**
 * BillingInformation - 收货/收单信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class BillingInformation extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource = {} } = this.props;
    const {
      taxRegisterAddress,
      taxRegisterNum,
      taxRegisterBank,
      taxRegisterBankAccount,
      invoiceTitle,
      taxRegisterTel,
      invoiceTypeName,
      invoiceMethodName,
      invoiceTitleTypeName,
      invoiceDetailTypeName,
    } = dataSource;
    return (
      <Fragment>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址')}
              value={taxRegisterAddress}
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
              label={intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行')}
              value={taxRegisterBank}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号')}
              value={taxRegisterBankAccount}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.taxRegisterBank`).d('开票公司名称')}
              value={invoiceTitle}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.taxRegisterBankAccount`).d('税务登记电话')}
              value={taxRegisterTel}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceType`).d('发票类型')}
              value={invoiceTitleTypeName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceMethod`).d('开票方式')}
              value={invoiceMethodName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceTitleTypeMeaning`).d('发票形式')}
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
      </Fragment>
    );
  }
}
