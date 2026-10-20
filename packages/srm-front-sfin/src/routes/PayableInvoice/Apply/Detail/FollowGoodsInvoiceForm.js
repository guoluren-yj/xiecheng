import React, { Component } from 'react';
import { Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import styles from '../../index.less';

const promptCode = 'sfin.payableInvoice';

/**
 * 应付发票申请 - 随货开票明细 - 发票明细
 * @extends {Component} - Component
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
export default class FollowGoodsInvoiceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { headerInfo = {} } = this.props;
    return (
      <React.Fragment>
        <Row className={styles['information-container']}>
          <Row className={styles['information-item']} gutter={48}>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.company`).d('公司')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.companyName}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.ouName`).d('业务实体')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.ouName}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.purOrganizationName`).d('采购组织')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.purOrganizationName}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles['information-item']} gutter={48}>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.purchaseAgentName`).d('采购员')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.purchaseAgentName}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.currencyCode`).d('币种')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.currencyCode}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.payableInvoice.invoiceStatus`).d('状态')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.invoiceStatusMeaning}
                </Col>
              </Row>
            </Col>
          </Row>
        </Row>
      </React.Fragment>
    );
  }
}
