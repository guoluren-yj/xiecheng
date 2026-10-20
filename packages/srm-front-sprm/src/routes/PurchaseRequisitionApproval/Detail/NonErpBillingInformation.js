/*
 * NonErpBillingInformation - 非Erp采购申请头信息
 * @date: 2019-01-24
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Spin } from 'hzero-ui';

import intl from 'utils/intl';

import styles from './Header.less';

const commonPrompt = 'sprm.common.model.common';
const oneThirdOfInputSpan = 15;

export default class NonErpBillingInformation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { headerInfo = {}, loading } = this.props;
    const {
      taxRegisterNum,
      taxRegisterAddress,
      taxRegisterBank,
      taxRegisterBankAccount,
      taxRegisterTel,
      invoiceTitleTypeName,
      invoiceTitle,
      invoiceDetailTypeName,
      invoiceMethodName,
      invoiceTypeName,
    } = headerInfo;
    return (
      <Spin spinning={loading}>
        <Form className={styles['header-wrapper']}>
          <Row className="items-row">
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.invoiceTitle`).d('发票抬头')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{invoiceTitle}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.taxRegisterNum`).d('税务登记号')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{taxRegisterNum}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{taxRegisterAddress}</Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.taxRegisterTel`).d('公司电话')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{taxRegisterTel}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{taxRegisterBank}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{taxRegisterBankAccount}</Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{invoiceMethodName}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{invoiceTitleTypeName}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.invoiceType`).d('发票类型')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{invoiceTypeName}</Col>
              </Row>
            </Col>
          </Row>
          <Row className="items-row">
            <Col span={8}>
              <Row>
                <Col span={9} className="item-label">
                  {intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细')}:
                </Col>
                <Col span={oneThirdOfInputSpan}>{invoiceDetailTypeName}</Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Spin>
    );
  }
}
