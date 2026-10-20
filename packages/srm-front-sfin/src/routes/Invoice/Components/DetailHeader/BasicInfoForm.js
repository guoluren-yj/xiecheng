/**
 * DetailHeader.js - 发票协同详情页面头信息
 * @date: 2018-12-03
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Form, Spin, Collapse, Icon } from 'hzero-ui';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import styles from './index.less';

const promptCode = 'sfin.invoiceBill';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO'],
})
export default class BasicInfoForm extends Component {
  render() {
    const {
      type,
      form,
      loading,
      headerInfo,
      contentKeys,
      customizeForm,
      onContentChange,
      approvedRemarkRender,
      reviewedRemarkRender,
      returnedRemarkRender,
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['centralizedForm']}
          onChange={(arr) => onContentChange(arr, 'centralizedForm')}
        >
          <Collapse.Panel
            forceRender
            showArrow={false}
            key="centralizedForm"
            header={
              <React.Fragment>
                <h3>
                  {intl.get(`${promptCode}.view.message.title.detail.baseInfo`).d('基本信息')}
                </h3>
                <a>
                  {contentKeys.centralizedForm
                    ? contentKeys.centralizedForm.some((o) => o === 'centralizedForm')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')
                    : intl.get(`hzero.common.button.up`).d('收起')}
                </a>
                <Icon
                  type={
                    contentKeys.centralizedForm
                      ? contentKeys.centralizedForm.some((o) => o === 'centralizedForm')
                        ? 'up'
                        : 'down'
                      : 'up'
                  }
                />
              </React.Fragment>
            }
          >
            <React.Fragment>
              {customizeForm(
                {
                  code: 'SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
                  form,
                  dataSource: headerInfo,
                },
                <Form>
                  <Row gutter={48} className={styles['information-item']}>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`${promptCode}.model.invoiceBill.company`).d('公司')}
                      >
                        {getFieldDecorator('companyName')(<span>{headerInfo.companyName}</span>)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体')}
                      >
                        {getFieldDecorator('ouName')(<span>{headerInfo.ouName}</span>)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`${promptCode}.model.invoiceBill.purchaseOrgName`)
                          .d('采购组织')}
                      >
                        {getFieldDecorator('purOrganizationName')(
                          <span>{headerInfo.purOrganizationName}</span>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={48} className={styles['information-item']}>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员')}
                      >
                        {getFieldDecorator('purchaseAgentName')(
                          <span>{headerInfo.purchaseAgentName}</span>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种')}
                      >
                        {getFieldDecorator('currencyCode')(<span>{headerInfo.currencyCode}</span>)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label={intl.get('hzero.common.status').d('状态')}>
                        {getFieldDecorator('invoiceStatusMeaning')(
                          <span>{headerInfo.invoiceStatusMeaning}</span>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  {!['create', 'update'].includes(type) && (
                    <Row gutter={48} className={styles['information-item']}>
                      <Col span={8}>
                        <Form.Item
                          label={intl.get(`${promptCode}.model.invoiceBill.createName`).d('创建人')}
                        >
                          {getFieldDecorator('createName')(<span>{headerInfo.createName}</span>)}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label={intl
                            .get(`${promptCode}.model.invoiceBill.creationDate`)
                            .d('创建日期')}
                        >
                          {getFieldDecorator('creationDate')(
                            <span>{dateTimeRender(headerInfo.creationDate)}</span>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  <Row gutter={48} className={styles['information-item']}>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`${promptCode}.model.invoiceBill.supplier.invoiceTitle`)
                          .d('开票主体')}
                      >
                        {getFieldDecorator('invoiceTitle')(<span>{headerInfo.invoiceTitle}</span>)}
                      </Form.Item>
                    </Col>
                  </Row>
                  {['supplier', 'review', 'sync', 'return', 'summary'].includes(type) &&
                    approvedRemarkRender()}
                  {['supplier', 'sync', 'return', 'summary'].includes(type) &&
                    reviewedRemarkRender()}
                  {['supplier', 'summary'].includes(type) && returnedRemarkRender()}
                </Form>
              )}
            </React.Fragment>
          </Collapse.Panel>
        </Collapse>
      </Spin>
    );
  }
}
