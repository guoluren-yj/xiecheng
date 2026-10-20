/* eslint-disable react/jsx-indent-props */
/**
 * DetailHeader.js - 发票协同详情页面头信息
 * @date: 2018-12-03
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Input, InputNumber, DatePicker, Form, Spin, Collapse, Icon } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'dva/router';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { math } from 'choerodon-ui/dataset';

import { getDateTimeFormat, getDateFormat } from 'utils/utils';
// import withCustomize from 'srm-front-cuz/lib/h0Customize'
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { thousandBitSeparator, precisionNum } from '@/routes/utils';
import BasicInfoForm from './BasicInfoForm';
import styles from './index.less';

const promptCode = 'sfin.invoiceBill';
const { TextArea } = Input;

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryDetailHeader'],
}))
@withRouter
@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO'],
// })
// 由于个性化存在同名字段，将发票头和基本信息的表单拆分开，页面保存的时候需注意表单取值
export default class DetailHeader extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    // if (props.onRef) {
    //   props.onRef(this);
    // }
    this.state = {
      collapseKeys: {}, // 头信息折叠面板key
      contentKeys: {}, // 内容信息折叠面板key
      // invoiceHeaderId,
    };
  }

  componentDidMount() {
    this.init();
  }

  // shouldComponentUpdate (prevProps) {
  //   if (prevProps.defaultActiveKey !== this.props.defaultActiveKey) {
  //     this.fetchDetail(this.props.defaultActiveKey);
  //     // eslint-disable-next-line react/no-did-update-set-state
  //     return true;
  //   }
  // }

  componentDidUpdate(prevProps) {
    const { match, showPubType = true } = prevProps;
    if (showPubType) {
      if (match.params.invoiceHeaderId !== undefined) {
        const {
          params: { invoiceHeaderId },
        } = match;
        if (this.props.match.params.invoiceHeaderId !== invoiceHeaderId) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.fetchDetail();
        }
      } else if (prevProps.invoiceHeaderId !== this.props.defaultActiveKey) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.fetchDetail();
      }
    }
  }

  /**
   * 查询详情页面行信息
   */
  @Bind()
  init() {
    this.fetchDetail();
  }

  @Bind()
  fetchDetail() {
    const { dispatch, match, type, isInvoiceVerify } = this.props;
    if (match.params.invoiceHeaderId !== undefined) {
      const { invoiceHeaderId } = match.params;
      // this.props.form.resetFields();
      if (isInvoiceVerify) {
        dispatch({
          type: 'invoice/queryDetailHeader',
          payload: {
            type,
            invoiceHeaderId,
            isInvoiceVerify,
            customizeUnitCode:
              'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
          },
        }).then(() => {
          this.props.form.resetFields();
        });
      } else {
        dispatch({
          type: 'invoice/queryDetailHeader',
          payload: {
            type,
            invoiceHeaderId,
            customizeUnitCode:
              'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
          },
        }).then(() => {
          this.props.form.resetFields();
        });
      }
    } else {
      const { invoiceHeaderId } = this.props;
      if (isInvoiceVerify) {
        dispatch({
          type: 'invoice/queryDetailHeader',
          payload: {
            type,
            invoiceHeaderId,
            isInvoiceVerify,
            customizeUnitCode:
              'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
          },
        });
      } else {
        dispatch({
          type: 'invoice/queryDetailHeader',
          payload: {
            type,
            invoiceHeaderId,
            customizeUnitCode:
              'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO,SFIN.INVOICE_UPDATE_DETAIL.BASIC_INFO',
          },
        }).then(() => {
          this.props.form.resetFields();
        });
      }
    }
  }

  /**
   * onCollapseChange - 发票头折叠面板onChange
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

  /**
   * onContentChange - 发票内容折叠面板onChange
   * @param {Array<string>} onContentChange - Panels key
   */
  @Bind()
  onContentChange(arr, key) {
    const { contentKeys } = this.state;
    this.setState({
      contentKeys: {
        ...contentKeys,
        [key]: arr,
      },
    });
  }

  approvedRemarkRender = () => {
    const { type, form } = this.props;
    return (
      <Row
        gutter={48}
        className={classNames({
          [styles['information-item']]: true,
          [styles['information-item-edit']]: type === 'approve',
        })}
      >
        <Col span={24}>
          {type === 'approve' ? (
            <Form.Item
              label={intl.get(`${promptCode}.model.invoiceBill.approvedRemark`).d('审核意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('approvedRemark', {
                initialValue: this.headerInfo.approvedRemark,
              })(<TextArea rows={2} />)}
            </Form.Item>
          ) : (
            <Form.Item
              label={intl.get(`${promptCode}.model.invoiceBill.approvedRemark`).d('审核意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('approvedRemark')(
                <span>{this.headerInfo.approvedRemark}</span>
              )}
            </Form.Item>
          )}
        </Col>
      </Row>
    );
  };

  reviewedRemarkRender = () => {
    const { type, form } = this.props;
    return (
      <Row
        gutter={48}
        className={classNames({
          [styles['information-item']]: true,
          [styles['information-item-edit']]: type === 'review',
        })}
      >
        <Col span={24}>
          {type === 'review' ? (
            <Form.Item
              label={intl.get(`${promptCode}.model.invoiceBill.reviewedRemark`).d('复核意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('reviewedRemark', {
                initialValue: this.headerInfo.reviewedRemark,
              })(<TextArea rows={2} />)}
            </Form.Item>
          ) : (
            <Form.Item
              label={intl.get(`${promptCode}.model.invoiceBill.reviewedRemark`).d('复核意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('reviewedRemark')(
                <span>{this.headerInfo.reviewedRemark}</span>
              )}
            </Form.Item>
          )}
        </Col>
      </Row>
    );
  };

  returnedRemarkRender = () => {
    const { type, form } = this.props;
    return (
      <Row
        gutter={48}
        className={classNames({
          [styles['information-item']]: true,
          [styles['information-item-edit']]: type === 'return',
        })}
      >
        <Col span={24}>
          {type === 'return' ? (
            <Form.Item
              label={intl.get(`${promptCode}.model.invoiceBill.returnedRemark`).d('退回意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('returnedRemark', {
                initialValue: this.headerInfo.returnedRemark,
              })(<TextArea rows={2} />)}
            </Form.Item>
          ) : (
            <Form.Item
              label={intl.get(`${promptCode}.model.invoiceBill.returnedRemark`).d('退回意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('returnedRemark')(
                <span>{this.headerInfo.returnedRemark}</span>
              )}
            </Form.Item>
          )}
        </Col>
      </Row>
    );
  };

  render() {
    const { collapseKeys, contentKeys } = this.state;
    const {
      loading,
      invoice: { detailHeader, invoiceVerifyDetailHeader },
      type,
      form,
      showPubType,
      isInvoiceVerify,
    } = this.props;
    const { getFieldDecorator } = form;
    const headerInfo = isInvoiceVerify
      ? invoiceVerifyDetailHeader[type] || {}
      : detailHeader[type] || {};
    // console.log(headerInfo.amountPrecision)
    this.headerInfo = headerInfo;
    const { customizeForm } = this.props;
    const basicInfoProps = {
      type,
      loading,
      headerInfo,
      contentKeys,
      onContentChange: this.onContentChange,
      approvedRemarkRender: this.approvedRemarkRender,
      reviewedRemarkRender: this.reviewedRemarkRender,
      returnedRemarkRender: this.returnedRemarkRender,
    };
    return (
      <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['centralizedForm']}
          onChange={(arr) => this.onCollapseChange(arr, 'centralizedForm')}
        >
          <Collapse.Panel
            forceRender
            showArrow={false}
            key="centralizedForm"
            header={
              <React.Fragment>
                <h3>{intl.get(`${promptCode}.view.InvoiceHeader`).d('发票头信息')}</h3>
                <a>
                  {collapseKeys.centralizedForm
                    ? collapseKeys.centralizedForm.some((o) => o === 'centralizedForm')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')
                    : intl.get(`hzero.common.button.up`).d('收起')}
                </a>
                <Icon
                  type={
                    collapseKeys.centralizedForm
                      ? collapseKeys.centralizedForm.some((o) => o === 'centralizedForm')
                        ? 'up'
                        : 'down'
                      : 'up'
                  }
                />
              </React.Fragment>
            }
          >
            {customizeForm(
              {
                code: 'SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO',
                form,
                dataSource: headerInfo,
                readOnly: type === 'summary' || type === 'supplier',
              },
              <Form>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('invoiceNum')(<span>{headerInfo.invoiceNum}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.taxInvoiceDateIssued`)
                        .d('开票日期')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {type === 'create' || type === 'update'
                        ? form.getFieldDecorator('taxInvoiceDateIssued', {
                            initialValue:
                              headerInfo.taxInvoiceDateIssued &&
                              moment(headerInfo.taxInvoiceDateIssued),
                            rules: [
                              {
                                required: true,
                                message: intl
                                  .get(`${promptCode}.model.invoiceBill.invoiceDateCannotBeEmpty`)
                                  .d('开票日期不能为空'),
                              },
                            ],
                          })(
                            <DatePicker
                              format={getDateFormat()}
                              placeholder={null}
                              style={{ width: '100%' }}
                            />
                          )
                        : getFieldDecorator('taxInvoiceDateIssued')(
                          <span>
                            {headerInfo.taxInvoiceDateIssued &&
                                moment(headerInfo.taxInvoiceDateIssued).format(DEFAULT_DATE_FORMAT)}
                          </span>
                          )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    {type === 'create' || type === 'update' ? (
                      <Form.Item
                        label={intl
                          .get(`${promptCode}.model.invoiceBill.taxInvoiceNumbers`)
                          .d('税务发票号码')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {form.getFieldDecorator('taxInvoiceNum', {
                          initialValue: headerInfo.taxInvoiceNum,
                          rules: [
                            {
                              required: true,
                              message: intl
                                .get(
                                  `${promptCode}.model.invoiceBill.taxationInvoiceNumbersNotNull`
                                )
                                .d('税务发票号码不能为空'),
                            },
                            // {
                            //   min: 0,
                            //   pattern: /^\w+$/,
                            //   message: intl
                            //     .get(`${promptCode}.verify.formatError`)
                            //     .d('发票代码只能由数字字母符号组成'),
                            // },
                          ],
                        })(<Input inputChinese={false} style={{ width: '100%' }} />)}
                      </Form.Item>
                    ) : (
                      <Form.Item
                        label={intl
                          .get(`${promptCode}.model.invoiceBill.taxInvoiceNumbers`)
                          .d('税务发票号码')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('taxInvoiceNum')(
                          <span>{headerInfo.taxInvoiceNum}</span>
                        )}
                      </Form.Item>
                    )}
                  </Col>
                </Row>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplierNum`)
                        .d('供应商编码')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('supplierNum', {
                        initialValue: headerInfo.supplierNum,
                      })(<span>{headerInfo.supplierNum}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.payableInvoice.totalNonTax`)
                        .d('未税总额(系统)')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('taxWithoutAmount')(
                        <span>
                          {headerInfo.priceShieldFlag ? (
                            '***'
                          ) : headerInfo.taxAmount !== null &&
                            !math.eq(headerInfo.taxAmountSystem, headerInfo.taxAmount) ? (
                            // eslint-disable-next-line react/jsx-indent
                            <span style={{ color: 'red' }}>
                              {`${thousandBitSeparator(
                                headerInfo.taxWithoutAmount,
                                headerInfo.amountPrecision
                              )}`}
                            </span>
                          ) : (
                            <span>
                              {`${thousandBitSeparator(
                                headerInfo.taxWithoutAmount,
                                headerInfo.amountPrecision
                              )}`}
                            </span>
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.invoiceAmount`)
                        .d('发票总额')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {type === 'create' || type === 'update'
                        ? form.getFieldDecorator('taxIncludedAmount', {
                            initialValue: headerInfo.taxIncludedAmount,
                            rules: [
                              {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl
                                    .get(`${promptCode}.model.invoiceBill.invoiceAmount`)
                                    .d('发票总额'),
                                }),
                              },
                              // {
                              //   validator: (i, value, callback) => {
                              //     const currentLength = Number(value).toString().split('.')[1]
                              //       ? Number(value).toString().split('.')[1].length
                              //       : 0;

                              //     if (currentLength > headerInfo.amountPrecision) {
                              //       callback(
                              //         // intl
                              //         //   .get(`${promptCode}.model.invoiceBill.msgError`)
                              //         //   .d(`精度校验不通过`)
                              //         '精度校验不通过'
                              //       );
                              //     } else {
                              //       callback();
                              //     }
                              //   },
                              // },
                            ],
                          })(
                            <InputNumber
                              precision={precisionNum(
                                form.getFieldValue('taxIncludedAmount'),
                                {
                                  $form: form,
                                  amountPrecision: headerInfo.amountPrecision,
                                },
                                'taxIncludedAmount'
                              )}
                              // {...precisionParams(headerInfo.taxIncludedAmount, true)}
                              allowThousandth
                              style={{ width: '100%' }}
                            />
                          )
                        : getFieldDecorator('taxIncludedAmount')(
                          <span>
                            {type !== 'supplier' && headerInfo.priceShieldFlag ? (
                                '***'
                              ) : headerInfo.taxIncludedAmount !== null &&
                                math.eq(
                                  headerInfo.taxIncludedAmountSystem,
                                  headerInfo.taxIncludedAmount
                                ) ? (
                                thousandBitSeparator(
                                  headerInfo.taxIncludedAmount,
                                  headerInfo.amountPrecision
                                )
                              ) : (
                                <span style={{ color: 'red' }}>
                                  {thousandBitSeparator(
                                    headerInfo.taxIncludedAmount,
                                    headerInfo.amountPrecision
                                  )}
                                </span>
                              )}
                          </span>
                          )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplierName`)
                        .d('供应商名称')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('supplierName')(<span>{headerInfo.supplierName}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.taxIncludedAmountSystem`)
                        .d('含税总额（系统）')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('taxIncludedAmountSystem')(
                        <span>
                          {headerInfo.priceShieldFlag ? (
                            '***'
                          ) : headerInfo.taxIncludedAmount !== null &&
                            !math.eq(
                              headerInfo.taxIncludedAmountSystem,
                              headerInfo.taxIncludedAmount
                            ) ? (
                            // eslint-disable-next-line react/jsx-indent
                            <span style={{ color: 'red' }}>
                              {`${thousandBitSeparator(
                                headerInfo.taxIncludedAmountSystem,
                                headerInfo.amountPrecision
                              )}`}
                            </span>
                          ) : (
                            <span>
                              {`${thousandBitSeparator(
                                headerInfo.taxIncludedAmountSystem,
                                headerInfo.amountPrecision
                              )}`}
                            </span>
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.invoiceTaxAmount`)
                        .d('发票税额')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {type === 'create' || type === 'update'
                        ? form.getFieldDecorator('taxAmount', {
                            initialValue: headerInfo.taxAmount,
                            rules: [
                              {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl
                                    .get(`${promptCode}.model.invoiceBill.invoiceTaxAmount`)
                                    .d('发票税额'),
                                }),
                              },
                              // {
                              //   validator: (i, value, callback) => {
                              //     const currentLength = Number(value).toString().split('.')[1]
                              //       ? Number(value).toString().split('.')[1].length
                              //       : 0;

                              //     if (currentLength > headerInfo.amountPrecision) {
                              //       callback(
                              //         // intl
                              //         //   .get(`${promptCode}.model.invoiceBill.msgError`)
                              //         //   .d(`精度校验不通过`)
                              //         '精度校验不通过'
                              //       );
                              //     } else {
                              //       callback();
                              //     }
                              //   },
                              // },
                            ],
                          })(
                            <InputNumber
                              // precision={headerInfo.amountPrecision}
                              precision={precisionNum(
                                form.getFieldValue('taxAmount'),
                                {
                                  $form: form,
                                  amountPrecision: headerInfo.amountPrecision,
                                },
                                'taxAmount'
                              )}
                              // {...precisionParams(headerInfo.taxAmount, true)}
                              allowThousandth
                              style={{ width: '100%' }}
                            />
                          )
                        : getFieldDecorator('taxAmount')(
                          <span>
                            {type !== 'supplier' && headerInfo.priceShieldFlag ? (
                                '***'
                              ) : headerInfo.taxAmount !== null &&
                                math.eq(headerInfo.taxAmountSystem, headerInfo.taxAmount) ? (
                                thousandBitSeparator(
                                  headerInfo.taxAmount,
                                  headerInfo.amountPrecision
                                )
                              ) : (
                                <span style={{ color: 'red' }}>
                                  {thousandBitSeparator(
                                    headerInfo.taxAmount,
                                    headerInfo.amountPrecision
                                  )}
                                </span>
                              )}
                          </span>
                          )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.supplierSiteName`)
                        .d('供应商地点')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('supplierSiteName')(
                        <span>{headerInfo.supplierSiteName}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.taxAmountSystem`)
                        .d('税额（系统）')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('taxAmountSystem')(
                        <span>
                          {headerInfo.priceShieldFlag ? (
                            '***'
                          ) : headerInfo.taxAmount !== null &&
                            !math.eq(headerInfo.taxAmountSystem, headerInfo.taxAmount) ? (
                            // eslint-disable-next-line react/jsx-indent
                            <span style={{ color: 'red' }}>
                              {`${thousandBitSeparator(
                                headerInfo.taxAmountSystem,
                                headerInfo.amountPrecision
                              )}`}
                            </span>
                          ) : (
                            <span>
                              {`${thousandBitSeparator(
                                headerInfo.taxAmountSystem,
                                headerInfo.amountPrecision
                              )}`}
                            </span>
                          )}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.openingState`).d('开具状态')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('issueStatusCodeMeaning')(
                        <span>{headerInfo.issueStatusCodeMeaning}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.openingStateDetail`)
                        .d('开具状态明细')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('issueMessage')(<span>{headerInfo.issueMessage}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.`).d('扣款金额')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('deductedTaxIncludedAmount')(
                        <span>
                          {`${thousandBitSeparator(
                            headerInfo.deductedTaxIncludedAmount || 0,
                            headerInfo.amountPrecision
                          )}`}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.deductionTaxAmount`)
                        .d('扣款税额')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('deductedTaxAmount')(
                        <span>
                          {`${thousandBitSeparator(
                            headerInfo.deductedTaxAmount || 0,
                            headerInfo.amountPrecision
                          )}`}
                        </span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.drawerSupplierName`)
                        .d('出票方')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('drawerSupplierName')(
                        <span>{`${numberRender(headerInfo.drawerSupplierName || 0, 2)}`}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类型')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('businessTypeMeaning')(
                        <span>{headerInfo.businessTypeMeaning}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  <Col span={16}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.invoiceRemark`)
                        .d('发票备注')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {type === 'create' || type === 'update'
                        ? form.getFieldDecorator('remark', {
                            initialValue: headerInfo.remark,
                            rules: [
                              {
                                max: 240,
                                message: intl.get('hzero.common.validation.max', {
                                  max: 240,
                                }),
                              },
                            ],
                          })(<TextArea rows={2} />)
                        : getFieldDecorator('remark', {
                            initialValue: headerInfo.remark,
                          })(<span>{headerInfo.remark}</span>)}
                      {getFieldDecorator('invoiceStatus', {
                        initialValue: headerInfo.invoiceStatus,
                      })(<span />)}
                    </Form.Item>
                  </Col>
                  {type === 'approve' && !showPubType && (
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`${promptCode}.model.invoiceBill.invoiceType`)
                          .d('发票类型')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('attributeVarchar1', {
                          initialValue: headerInfo.attributeVarchar1,
                        })(
                          <ValueList
                            lovCode="SCUX.BJCY.INVOICE_TYPE"
                            lazyLoad={false}
                            allowClear
                            disabled
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                </Row>
                {/* {type === 'sync' && ( */}
                <Row
                  gutter={48}
                  className={classNames({
                    [styles['information-item']]: true,
                    [styles['information-item-edit']]: type === 'create' || type === 'update',
                  })}
                >
                  {type === 'sync' && (
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`${promptCode}.model.invoiceBill.accountingDate`)
                          .d('记账日期')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {form.getFieldDecorator('accountingDate', {
                          initialValue: headerInfo.accountingDate,
                        })(
                          <DatePicker
                            format={getDateTimeFormat()}
                            placeholder={null}
                            style={{ width: '100%' }}
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {type === 'sync' && (
                    <Col span={16}>
                      <Form.Item
                        label={intl.get(`${promptCode}.model.invoiceBill.syncRemark`).d('导入说明')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {form.getFieldDecorator('syncRemark', {
                          initialValue: headerInfo.syncRemark,
                        })(<Input />)}
                      </Form.Item>
                    </Col>
                  )}
                </Row>
                {type === 'approve' && this.approvedRemarkRender()}
                {type === 'review' && this.reviewedRemarkRender()}
                {type === 'return' && this.returnedRemarkRender()}
              </Form>
            )}
          </Collapse.Panel>
        </Collapse>
        <BasicInfoForm {...basicInfoProps} />
      </Spin>
    );
  }
}
