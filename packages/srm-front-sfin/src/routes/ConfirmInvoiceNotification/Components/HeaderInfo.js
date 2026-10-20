/**
 * HeaderInfo - 非寄销对账协同头信息
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Icon, Input, Form, Collapse } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import styles from './index.less';

const promptCode = 'sfin.invoiceBill';
const { TextArea } = Input;

/**
 * 非寄销对账协同头信息
 * @extends {Component} - Component
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      collapseKeys: {},
    };
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  render() {
    const {
      form,
      isShowOpinion = true, // 显示评审
      isRemarkEdit = true, // 备注可编辑
      isOpinionEdit = true, // 评审可编辑
      headerInfo = {},
    } = this.props;
    const { collapseKeys } = this.state;
    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={['headerInfoForm']}
        onChange={(arr) => this.onCollapseChange(arr, 'headerInfoForm')}
      >
        <Collapse.Panel
          forceRender
          showArrow={false}
          key="headerInfoForm"
          header={
            <React.Fragment>
              <h3>
                {intl.get(`${promptCode}.view.message.title.billHeaderInfo`).d('开票单头信息')}
              </h3>
              <a>
                {collapseKeys.headerInfoForm
                  ? collapseKeys.headerInfoForm.some((o) => o === 'headerInfoForm')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')
                  : intl.get(`hzero.common.button.up`).d('收起')}
              </a>
              <Icon
                type={
                  collapseKeys.headerInfoForm
                    ? collapseKeys.headerInfoForm.some((o) => o === 'headerInfoForm')
                      ? 'up'
                      : 'down'
                    : 'up'
                }
              />
            </React.Fragment>
          }
        >
          <React.Fragment>
            <Row className={styles['information-container']}>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.billNum`).d('开票单号')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.displayBillNum}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl
                        .get(`${promptCode}.model.invoiceBill.supplier.invoiceTitle`)
                        .d('开票主体')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.invoiceTitle}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('entity.company.tag').d('公司')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.companyName}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.noTaxAmount`).d('不含税总额')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.priceShieldFlag === 1
                        ? '***'
                        : numberRender(headerInfo.netAmount, 2)}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.currencyCode}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('entity.business.tag').d('业务实体')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.ouName}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.priceShieldFlag === 1
                        ? '***'
                        : numberRender(headerInfo.taxAmount, 2)}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('hzero.common.status').d('状态')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.billStatusMeaning}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.purOrganization}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl
                        .get(`${promptCode}.model.invoiceBill.all.taxIncludedAmount`)
                        .d('含税总额')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.priceShieldFlag === 1
                        ? '***'
                        : numberRender(headerInfo.taxIncludedAmount, 2)}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.invOrganization}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.purchaseAgent}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('entity.roles.creator').d('创建人')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.createdByName}
                    </Col>
                  </Row>
                </Col>
              </Row>
              {isShowOpinion && (
                <Row gutter={48} className={styles['half-row']}>
                  <Col span={12}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.approvedRemark`)
                        .d('审核意见')}
                    >
                      {isOpinionEdit
                        ? form.getFieldDecorator('approvedRemark', {
                            initialValue: headerInfo.approvedRemark,
                          })(<TextArea rows={2} style={{ height: '56px' }} />)
                        : headerInfo.approvedRemark}
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.supplierName}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('entity.supplier.code').d('供应商编码')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.supplierNum}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.supplierSiteName}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={24}>
                  <Row>
                    <Col span={2} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.supplier.remark`).d('供应商备注')}
                    </Col>
                    <Col span={11} className={styles['information-item-children']}>
                      {isRemarkEdit
                        ? form.getFieldDecorator('remark', {
                            initialValue: headerInfo.remark,
                          })(<TextArea rows={2} />)
                        : headerInfo.remark}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row gutter={48} className={styles['information-item']}>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get('hzero.common.date.creation').d('创建日期')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.creationDate}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.submittedDate`).d('提交日期')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.submittedDate}
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={9} className={styles['information-item-label']}>
                      {intl.get(`${promptCode}.model.invoiceBill.partnerName`).d('出票方')}
                    </Col>
                    <Col span={15} className={styles['information-item-children']}>
                      {headerInfo.drawerSupplierName}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Row>
          </React.Fragment>
        </Collapse.Panel>
      </Collapse>
    );
  }
}
