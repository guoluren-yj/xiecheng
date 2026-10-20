/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import DisplayFormItem from '@/routes/components/DisplayFormItem';
import { thousandBitSeparator } from '@/routes/utils';
// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化

const promptCode = 'sfin.paymentRecord';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class PurchaseRequestHeader extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { detailHeader = {} } = this.props;
    const {
      erpPaymentNum,
      paymentDate,
      ouName,
      supplierName,
      supplierSiteName,
      fiscalYear,
      paymentWayName,
      paymentAmount,
      currencyCode,
      paymentTypeName,
      companyName,
      amountPrecision,
    } = detailHeader;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`sfin.paymentRecord.view.message.model.erpReceivedPayNum`)
                .d('ERP收款单号')}
              value={erpPaymentNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sfin.invoiceBill.model.invoiceBill.customer`).d('客户')}
              value={companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem label={intl.get(`entity.business.tag`).d('业务实体')} value={ouName} />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.company.tag`).d('公司')}
              value={supplierName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${promptCode}.model.supplierSiteNameForSupplier`).d('公司地址')}
              value={supplierSiteName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl
                .get(`${promptCode}.view.message.model.paymentRecord.fiscalYear`)
                .d('会计年度')}
              value={fiscalYear}
            />
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          // className={EComAndRejectDisabled ? 'read-row' : 'inclusion-row'}
          className="inclusion-row"
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sfin.payment.common.sourceCodeSupplier`).d('收款方式')}
              value={paymentWayName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sfin.payment.common.paymentAmountSupplier`).d('收款金额')}
              value={thousandBitSeparator(paymentAmount, amountPrecision)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sfin.payment.common.currencyName`).d('币种')}
              value={currencyCode}
            />
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          // className={EComAndRejectDisabled ? 'read-row' : 'inclusion-row'}
          className="inclusion-row"
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sfin.payment.common.paymentDateSupplier`).d('收款日期')}
              value={dateRender(paymentDate)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sfin.payment.common.type`).d('类型')}
              value={paymentTypeName}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
