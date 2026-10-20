/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
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

/**
 * BillingInformation - 开票信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class BillingInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSource = {} } = this.props;
    const {
      taxRegisterNum,
      taxRegisterAddress,
      taxRegisterBank,
      invoiceTypeName,
      invoiceMethodName,
      taxRegisterBankAccount,
      invoiceDetailTypeName,
      invoiceTitleTypeName,
      taxRegisterTel,
    } = dataSource;
    return (
      <Fragment>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.taxRegisterAddress`)
                .d('税务登记地址')}
              value={taxRegisterAddress}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.taxRegisterNum`).d('税号')}
              value={taxRegisterNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.taxRegisterBank`).d('开户行')}
              value={taxRegisterBank}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.taxBankAccount`)
                .d('开户行账号')}
              value={taxRegisterBankAccount}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.taxRegisterBank`).d('开票公司名称')}
              value={taxRegisterBank}
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
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.invoiceTypeMeaning`)
                .d('发票类型')}
              value={invoiceTitleTypeName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.invoiceMethodMeaning`)
                .d('开票方式')}
              value={invoiceMethodName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.invoiceTitleMeaning`)
                .d('发票形式')}
              value={invoiceTypeName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row', 'last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.invoiceDetailMeaning`)
                .d('发票明细')}
              value={invoiceDetailTypeName}
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}
