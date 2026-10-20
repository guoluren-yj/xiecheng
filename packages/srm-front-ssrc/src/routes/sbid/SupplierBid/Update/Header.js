/* eslint-disable no-constant-condition */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker } from 'hzero-ui';
import classNames from 'classnames';
import moment from 'moment';
import {
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import Upload from 'srm-front-boot/lib/components/Upload';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { numberSeparatorRender } from '@/utils/renderer';
import styles from './Header.less';

const promptCode = 'ssrc.supplierBid';
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@formatterCollections({ code: ['ssrc.supplierQuotation'] })
export default class InquiryHeader extends Component {
  @Bind()
  changePaymentType(val, record) {
    const { form } = this.props;
    if (!val) {
      return;
    }
    const { typeId: paymentTypeId, typeName: paymentTypeName } = record;

    form.setFieldsValue({
      paymentTypeId,
      paymentTypeName,
    });
  }

  @Bind()
  changePaymentTerm(val, record) {
    const { form } = this.props;
    if (!val) {
      return;
    }
    const { termId: paymentTermId, termName: paymentTerm } = record;

    form.setFieldsValue({
      paymentTermId,
      paymentTerm,
    });
  }

  render() {
    const {
      headerInfo = {},
      tenantId,
      form = {},
      code: { supplierExploration = [] },
      customizeForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      // bidNum, // bid 单号
      // bidTitle, // 招标书标题
      companyName, // 公司
      bidTypeMeaning, // 招标类别
      roundNumber, // 轮次
      evalMethodName, // 评标办法
      quotationEndDate, // 投标截止时间
      paymentTypeId, // 付款方式id
      paymentTypeName, // 付款方式名称
      // typeName, // 付款方式
      // paymentTerm, // 付款条款
      bidBond, // 保证金
      quotationRemark, // 备注
      // currentBusinessAttachmentUuid, // 商务投标文件,
      // currentTechAttachmentUuid, // 技术投标文件
      quotationStartDate, // 投标开始时间
      techAttachmentUuid, // 招标技术文件
      businessAttachmentUuid, // 招标商务文件
      totalBudgetFlag,
      totalBudget,
      techAttachmentFlag,
      businessAttachmentFlag,
      currencyCode, // 币种
      multiCurrencyFlag, // 允许多币种报价
      explorationFlag, // 是否需现场踏勘
      supplierExplorationStatus, // 供应商踏勘状态
      supplierExplorationDate, // 供应商踏勘日期
    } = headerInfo || {};

    return customizeForm(
      {
        code: 'SSRC.TENDER_HALL_UPDATE.HEADER',
        form: this.props.form,
        dataSource: headerInfo,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBid.bidCompany`).d('招标公司')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', { initialValue: companyName })(
                <span>{companyName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBid.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTypeMeaning', { initialValue: bidTypeMeaning })(
                <span>{bidTypeMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} style={{ display: 'none' }}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.supplierBid.quotationStartDate`)
                .d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', { initialValue: quotationStartDate })(
                <span>{quotationStartDate}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {multiCurrencyFlag === 1 ? (
              <FormItem
                label={intl.get(`ssrc.supplierBid.model.supplierBid.currencyType`).d('币种')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('currencyCode', {
                  initialValue: currencyCode,
                  rules: [
                    {
                      required: multiCurrencyFlag === 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.supplierBid.model.supplierBid.currencyType`).d('币种'),
                      }),
                    },
                  ],
                })(<Lov code="SMDM.EXCHANGE_RATE.CURRENCY" textValue={currencyCode} />)}
              </FormItem>
            ) : (
              <FormItem
                label={intl.get(`ssrc.supplierBid.model.supplierBid.currencyType`).d('币种')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('currencyCode', {
                  initialValue: currencyCode,
                })(<span>{currencyCode}</span>)}
              </FormItem>
            )}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBid.quotationEndDate`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', { initialValue: quotationEndDate })(
                <span>{quotationEndDate}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBid.roundNumber`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber', { initialValue: roundNumber })(
                <span>{roundNumber}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBid.evalMethodName`).d('评标办法')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('evalMethodName')(<span>{evalMethodName}</span>)}
            </FormItem>
          </Col>
        </Row>
        {/* <Row gutter={48} className={classNames(styles.rowNew, 'read-row')}> */}
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {headerInfo.paymentTermFlag ? (
              <FormItem
                label={intl.get(`${promptCode}.model.supplierBid.paymentTypeId`).d('付款方式')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('paymentTypeId', {
                  initialValue: paymentTypeId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.paymentTypeId`)
                          .d('付款方式'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.PAYMENTTYPE"
                    onChange={(val, record) => this.changePaymentType(val, record)}
                    queryParams={{
                      paymentTypeId,
                    }}
                    textValue={paymentTypeName}
                  />
                )}
              </FormItem>
            ) : (
              <FormItem
                label={intl.get(`${promptCode}.model.supplierBid.paymentTypeId`).d('付款方式')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('paymentTypeId', { initialValue: paymentTypeId })(
                  <span>{paymentTypeName}</span>
                )}
              </FormItem>
            )}
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            {headerInfo.paymentTermFlag ? (
              <Fragment>
                <FormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.model.supplierBid.paymentTerm`).d('付款条款')}
                >
                  {getFieldDecorator('paymentTermId', {
                    initialValue: headerInfo.paymentTermId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.supplierBid.paymentTerm`)
                            .d('付款条款'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SMDM.PAYMENT.TERM"
                      onChange={(val, record) => this.changePaymentTerm(val, record)}
                      textField="paymentTerm"
                      textValue={paymentTerm}
                    />
                  )}
                </FormItem>
              </Fragment>
            ) : (
              <FormItem
                label={intl.get(`${promptCode}.model.supplierBid.paymentTerm`).d('付款条款')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('paymentTermId', { initialValue: headerInfo.paymentTermId })(
                  <span>{paymentTerm}</span>
                )}
              </FormItem>
            )}
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBond').d('保证金')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', { initialValue: bidBond })(
                <span>
                  {Number(bidBond) === 0 || bidBond === null
                    ? intl.get(`${promptCode}.model.supplierBid.free`).d('免费')
                    : numberSeparatorRender(bidBond)}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classNames(styles['edited-from'])}>
          {totalBudgetFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${promptCode}.model.supplierBid.totalBudget`).d('预算金额')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('totalBudget', { initialValue: totalBudget })(
                  <span>{totalBudget}</span>
                )}
              </FormItem>
            </Col>
          )}
          {businessAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`${promptCode}.model.supplierBid.bidBusinessAttachment`)
                  .d('招标商务文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('businessAttachmentUuid', {
                  initialValue: businessAttachmentUuid,
                })(
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(businessAttachmentUuid) ? undefined : businessAttachmentUuid
                    }
                    tenantId={tenantId}
                    viewOnly
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          )}
          {techAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`${promptCode}.model.supplierBid.bidTechAttachment`)
                  .d('招标技术文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('techAttachmentUuid', { initialValue: techAttachmentUuid })(
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={isEmpty(techAttachmentUuid) ? undefined : techAttachmentUuid}
                    tenantId={tenantId}
                    viewOnly
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          )}
          {explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('supplierExplorationStatus', {
                  initialValue: supplierExplorationStatus,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear>
                    {supplierExploration &&
                      supplierExploration.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
          {getFieldValue('supplierExplorationStatus') === 'EXPLORED' ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期')}
                {...formLayout}
              >
                {getFieldDecorator('supplierExplorationDate', {
                  initialValue: supplierExplorationDate && moment(supplierExplorationDate),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker style={{ width: '100%' }} placeholder="" format={getDateFormat()} />
                )}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('quotationRemark', {
                initialValue: quotationRemark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
