/**
 * HeaderInfo - 非寄销对账协同头信息.
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Icon, Input, Form, Collapse } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';
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
@withCustomize({
  unitCode: ['SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO'],
})
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
      customizeForm,
      isShowOpinion = true, // 显示评审
      isRemarkEdit = true, // 备注可编辑
      isOpinionEdit = true, // 评审可编辑
      headerInfo = {},
      showPubType = true,
    } = this.props;
    const { getFieldDecorator } = form;
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
            {customizeForm(
              {
                code: 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO',
                form,
                dataSource: headerInfo,
              },
              <Form>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.billNum`).d('开票单号')}
                    >
                      {getFieldDecorator('displayBillNum', {
                        initialValue: headerInfo.displayBillNum,
                      })(<span>{headerInfo.displayBillNum}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplierName`)
                        .d('供应商名称')}
                    >
                      {getFieldDecorator('supplierName')(<span>{headerInfo.supplierName}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.noTaxAmount`)
                        .d('不含税总额')}
                    >
                      {getFieldDecorator('netAmount')(
                        <span>
                          {headerInfo.priceShieldFlag === 1
                            ? '***'
                            : thousandBitSeparator(
                                headerInfo.netAmount,
                                headerInfo.amountPrecision
                              )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种')}
                    >
                      {getFieldDecorator('currencyCode')(<span>{headerInfo.currencyCode}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.supplier.code').d('供应商编码')}>
                      {getFieldDecorator('supplierNum')(<span>{headerInfo.supplierNum}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额')}
                    >
                      {getFieldDecorator('taxAmount')(
                        <span>
                          {headerInfo.priceShieldFlag === 1
                            ? '***'
                            : thousandBitSeparator(
                                headerInfo.taxAmount,
                                headerInfo.amountPrecision
                              )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item label={intl.get('hzero.common.status').d('状态')}>
                      {getFieldDecorator('billStatusMeaning')(
                        <span>{headerInfo.billStatusMeaning}</span>
                      )}
                      {getFieldDecorator('billStatus', {
                        initialValue: headerInfo.billStatus,
                      })(<span />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplierSiteName`)
                        .d('供应商地点')}
                    >
                      {getFieldDecorator('supplierSiteName')(
                        <span>{headerInfo.supplierSiteName}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.all.taxIncludedAmount`)
                        .d('含税总额')}
                    >
                      {getFieldDecorator('taxIncludedAmount', {
                        initialValue: headerInfo.taxIncludedAmount,
                      })(
                        <span>
                          {headerInfo.priceShieldFlag === 1
                            ? '***'
                            : thousandBitSeparator(
                                headerInfo.taxIncludedAmount,
                                headerInfo.amountPrecision
                              )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.deductionAmount`)
                        .d('扣款金额')}
                    >
                      {getFieldDecorator('deductionAmount')(
                        <span>
                          {thousandBitSeparator(
                            headerInfo.deductionAmount,
                            headerInfo.amountPrecision
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.deductionTaxAmount`)
                        .d('扣款税额')}
                    >
                      {getFieldDecorator('deductionTaxAmount')(
                        <span>
                          {thousandBitSeparator(
                            headerInfo.deductionTaxAmount,
                            headerInfo.amountPrecision
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类型')}
                    >
                      {getFieldDecorator('businessTypeMeaning')(
                        <span>{headerInfo.businessTypeMeaning}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={24}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplier.remark`)
                        .d('供应商备注')}
                    >
                      {isRemarkEdit
                        ? getFieldDecorator('remark', { initialValue: headerInfo.remark })(
                            // eslint-disable-next-line react/jsx-indent
                            <TextArea rows={2} />
                          )
                        : getFieldDecorator('remark')(<span>{headerInfo.remark}</span>)}
                    </Form.Item>
                  </Col>
                </Row>
                {showPubType
                  ? isShowOpinion && (
                      // eslint-disable-next-line react/jsx-indent
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
                              : getFieldDecorator('approvedRemark')(
                                  // eslint-disable-next-line react/jsx-indent
                                  <span>{headerInfo.approvedRemark}</span>
                                )}
                          </Form.Item>
                        </Col>
                      </Row>
                    )
                  : ''}
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.company.tag').d('公司')}>
                      {getFieldDecorator('companyName')(<span>{headerInfo.companyName}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.business.tag').d('业务实体')}>
                      {getFieldDecorator('ouName')(<span>{headerInfo.ouName}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.purchaseOrgName`)
                        .d('采购组织')}
                    >
                      {getFieldDecorator('purOrganization')(
                        <span>{headerInfo.purOrganization}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.organizationName`)
                        .d('库存组织')}
                    >
                      {getFieldDecorator('invOrganization')(
                        <span>{headerInfo.invOrganization}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员')}
                    >
                      {getFieldDecorator('purchaseAgent')(<span>{headerInfo.purchaseAgent}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('sfin.invoiceBill.model.invoiceBill.createName').d('创建人')}
                    >
                      {getFieldDecorator('createdByName')(<span>{headerInfo.createdByName}</span>)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item label={intl.get('hzero.common.date.creation').d('创建日期')}>
                      {getFieldDecorator('creationDate')(
                        <span>{dateTimeRender(headerInfo.creationDate)}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.submittedDate`)
                        .d('提交日期')}
                    >
                      {getFieldDecorator('submittedDate')(
                        <span>{dateTimeRender(headerInfo.submittedDate)}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.partnerName`).d('出票方')}
                    >
                      {getFieldDecorator('drawerSupplierName')(
                        <span>{headerInfo.drawerSupplierName}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
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
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplier.initialBalance`)
                        .d('期初余额')}
                    >
                      {getFieldDecorator('openingBalance')(
                        <span>
                          {thousandBitSeparator(
                            headerInfo.openingBalance,
                            headerInfo.amountPrecision
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplier.increasedMoney`)
                        .d('本期增加额')}
                    >
                      {getFieldDecorator('currentIncrease')(
                        <span>
                          {thousandBitSeparator(
                            headerInfo.currentIncrease,
                            headerInfo.amountPrecision
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48} className={styles['information-item']}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplier.DecreaseMoney`)
                        .d('本期减少额')}
                    >
                      {getFieldDecorator('currentDecrease')(
                        <span>
                          {thousandBitSeparator(
                            headerInfo.currentDecrease,
                            headerInfo.amountPrecision
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplier.EndingBalance`)
                        .d('期末余额')}
                    >
                      {getFieldDecorator('closingBalance')(
                        <span>
                          {thousandBitSeparator(
                            headerInfo.closingBalance,
                            headerInfo.amountPrecision
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </React.Fragment>
        </Collapse.Panel>
      </Collapse>
    );
  }
}
