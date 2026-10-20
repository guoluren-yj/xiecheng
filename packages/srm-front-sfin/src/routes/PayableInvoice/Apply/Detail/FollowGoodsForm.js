import React, { Component } from 'react';
import { Row, Col, Input, Form, DatePicker, InputNumber } from 'hzero-ui';
import moment from 'moment';
import classNames from 'classnames';

import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { getDateFormat } from 'utils/utils';
import styles from '../../index.less';
import { thousandsRender } from '@/utils/utils';
// import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.payableInvoice';
const { TextArea } = Input;

/**
 * 应付发票申请 - 随货开票明细表单
 * @extends {Component} - Component
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FollowGoodsForm extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  render() {
    const { form, isEdit, headerInfo = {} } = this.props;
    return (
      <React.Fragment>
        <Row className={styles['information-container']}>
          <Row
            gutter={48}
            className={classNames({
              [styles['information-item']]: true,
              [styles['information-item-edit']]: isEdit,
            })}
          >
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.invoiceNum`).d('SRM发票号')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.invoiceNum}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col
                  span={9}
                  className={
                    isEdit ? styles['item-label-required'] : styles['information-item-label']
                  }
                >
                  {intl.get(`${promptCode}.model.taxInvoiceDateIssued`).d('开票日期')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {isEdit ? (
                    <Form.Item>
                      {form.getFieldDecorator('taxInvoiceDateIssued', {
                        initialValue:
                          headerInfo.taxInvoiceDateIssued &&
                          moment(headerInfo.taxInvoiceDateIssued, getDateFormat()),
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.taxInvoiceDateIssued`)
                                .d('开票日期'),
                            }),
                          },
                        ],
                      })(
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateFormat()}
                          // disabledDate={currentDate => moment().isBefore(currentDate, 'day')}
                        />
                      )}
                    </Form.Item>
                  ) : (
                    headerInfo.taxInvoiceDateIssued
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col
                  span={9}
                  className={
                    isEdit ? styles['item-label-required'] : styles['information-item-label']
                  }
                >
                  {intl
                    .get(`${promptCode}.model.payableInvoice.taxationInvoiceCode`)
                    .d('税务发票代码')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {isEdit ? (
                    <Form.Item>
                      {form.getFieldDecorator('taxInvoiceCode', {
                        initialValue: headerInfo.taxInvoiceCode,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.payableInvoice.taxationInvoiceCode`)
                                .d('税务发票代码'),
                            }),
                          },
                          {
                            pattern: /^[\d;；]+$/,
                            message: intl
                              .get(`${promptCode}.view.message.payableInvoice.inputInteger`)
                              .d('请输入正整数'),
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  ) : (
                    headerInfo.taxInvoiceCode
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            gutter={48}
            className={classNames({
              [styles['information-item']]: true,
              [styles['information-item-edit']]: isEdit,
            })}
          >
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
                  {intl.get(`${promptCode}.model.payableInvoice.supplierNum`).d('供应商编码')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.supplierNum || headerInfo.supplierCompanyNum}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.drawerSupplierName`).d('出票方')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.drawerSupplierName}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            gutter={48}
            className={classNames({
              [styles['information-item']]: true,
              [styles['information-item-edit']]: isEdit,
            })}
          >
            <Col span={8}>
              <Row>
                <Col
                  span={9}
                  className={
                    isEdit ? styles['item-label-required'] : styles['information-item-label']
                  }
                >
                  {intl.get(`${promptCode}.model.payableInvoice.taxInvoiceNum`).d('税务发票号')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {isEdit ? (
                    <Form.Item>
                      {form.getFieldDecorator('taxInvoiceNum', {
                        initialValue: headerInfo.taxInvoiceNum,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.payableInvoice.taxInvoiceNum`)
                                .d('税务发票号'),
                            }),
                          },
                          {
                            pattern: /^[\d;；]+$/,
                            message: intl
                              .get(`${promptCode}.view.message.payableInvoice.inputInteger`)
                              .d('请输入正整数'),
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  ) : (
                    headerInfo.taxInvoiceNum
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.supplierName`).d('供应商名称')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.supplierName || headerInfo.supplierCompanyName}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.taxIncludedAmountSystem`).d('含税总额(系统)')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.taxIncludedAmountSystem !== headerInfo.taxIncludedAmount &&
                  headerInfo.taxIncludedAmount !== null ? (
                    <span style={{ color: 'red' }}>
                      {thousandsRender(headerInfo.taxIncludedAmountSystem)}
                      {/* {thousandBitSeparator(
                          headerInfo.taxIncludedAmountSystem,
                          headerInfo.amountPrecision
                        )} */}
                    </span>
                  ) : (
                    thousandsRender(headerInfo.taxIncludedAmountSystem)
                    // thousandBitSeparator(
                    //   headerInfo.taxIncludedAmountSystem,
                    //   headerInfo.amountPrecision
                    // )
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            gutter={48}
            className={classNames({
              [styles['information-item']]: true,
              [styles['information-item-edit']]: isEdit,
            })}
          >
            <Col span={8}>
              <Row>
                <Col
                  span={9}
                  className={
                    isEdit ? styles['item-label-required'] : styles['information-item-label']
                  }
                >
                  {intl.get(`${promptCode}.model.taxIncludedAmount.invoice`).d('发票总额')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {isEdit ? (
                    <Form.Item>
                      {form.getFieldDecorator('taxIncludedAmount', {
                        initialValue: numberRender(headerInfo.taxIncludedAmount, 2, false),
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.taxIncludedAmount.invoice`)
                                .d('发票总额'),
                            }),
                          },
                        ],
                      })(<InputNumber precision={2} min={0} style={{ width: '100%' }} />)}
                    </Form.Item>
                  ) : headerInfo.taxIncludedAmountSystem === headerInfo.taxIncludedAmount ? (
                    thousandsRender(headerInfo.taxIncludedAmount)
                  ) : (
                    // thousandBitSeparator(headerInfo.taxIncludedAmount, headerInfo.amountPrecision)
                    <span style={{ color: 'red' }}>
                      thousandsRender(headerInfo.taxIncludedAmount)
                      {/* {thousandBitSeparator(
                        headerInfo.taxIncludedAmount,
                        headerInfo.amountPrecision
                      )} */}
                    </span>
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.supplierSiteName`).d('供应商地点')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.supplierSiteName}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.taxAmountSystem`).d('税额(系统)')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.taxAmountSystem !== headerInfo.taxAmount &&
                  headerInfo.taxAmount !== null ? (
                    <span style={{ color: 'red' }}>
                      {numberRender(headerInfo.taxAmountSystem, 2, false)}
                    </span>
                  ) : (
                    numberRender(headerInfo.taxAmountSystem, 2, false)
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            gutter={48}
            className={classNames({
              [styles['information-item']]: true,
              [styles['information-item-edit']]: isEdit,
            })}
          >
            <Col span={8}>
              <Row>
                <Col
                  span={9}
                  className={
                    isEdit ? styles['item-label-required'] : styles['information-item-label']
                  }
                >
                  {intl.get(`${promptCode}.model.payableInvoice.invoice.tab.tax`).d('发票税额')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {isEdit ? (
                    <Form.Item>
                      {form.getFieldDecorator('taxAmount', {
                        initialValue: numberRender(headerInfo.taxAmount, 2, false),
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.model.taxAmount.invoice`).d('发票总额'),
                            }),
                          },
                        ],
                      })(<InputNumber precision={2} min={0} style={{ width: '100%' }} />)}
                    </Form.Item>
                  ) : headerInfo.taxAmountSystem === headerInfo.taxAmount ? (
                    numberRender(headerInfo.taxAmount, 2, false)
                  ) : (
                    <span style={{ color: 'red' }}>
                      {numberRender(headerInfo.taxAmount, 2, false)}
                    </span>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            gutter={48}
            className={classNames({
              [styles['information-item']]: true,
              [styles['information-item-edit']]: isEdit,
            })}
          >
            <Col span={24}>
              <Row>
                <Col span={2} className={styles['information-item-label']}>
                  {intl.get(`${promptCode}.model.payableInvoice.remark`).d('备注')}
                </Col>
                <Col span={11} className={styles['information-item-children']}>
                  {isEdit ? (
                    <Form.Item>
                      {form.getFieldDecorator('remark', {
                        initialValue: headerInfo.remark,
                      })(<TextArea rows={2} />)}
                    </Form.Item>
                  ) : (
                    headerInfo.remark
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Row>
      </React.Fragment>
    );
  }
}
