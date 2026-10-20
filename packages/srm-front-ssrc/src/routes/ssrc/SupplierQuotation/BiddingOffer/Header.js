import React, { Component } from 'react';
import { Form, Row, Col, Collapse, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
import CountDown from '../../components/CountDown';

const { Panel } = Collapse;
const FormItem = Form.Item;

// @Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.supplierQuotation', 'ssrc.common'] })
@observer
export default class InquiryHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfos'], // 打开的折叠面板key
    };
  }

  /**
   * 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  changePaymentType(val, record = {}) {
    const { form } = this.props;
    if (!val) {
      return;
    }
    const { typeId: paymentTypeId, typeName: paymentTypeName } = record || {};

    form.setFieldsValue({
      paymentTypeId,
      paymentTypeName,
    });
  }

  // 倒计时
  renderCountDown = (headerInfo = {}) => {
    const { biddingOfferRemote } = this.props;
    if (!headerInfo) {
      return;
    }

    const {
      currentDateTime = null,
      currentQuotationRound = null,
      quotationEndDate = null,
      bargainStatus = null,
    } = headerInfo;

    let title = intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价');
    if (currentQuotationRound) {
      title =
        intl.get('ssrc.common.the').d('第') +
        currentQuotationRound +
        intl.get('ssrc.common.round').d('轮');
    }
    if (bargainStatus === 'BARGAINING_ONLINE') {
      title = intl.get('ssrc.common.view.bargainPrice').d('议价');
    }

    return (
      <span>
        {title}
        {intl.get('ssrc.supplierQuotation.view.supQuo.cutOffTime').d('截止时间')}
        <CountDown
          sysNow={currentDateTime}
          endTime={quotationEndDate}
          type="day"
          remote={biddingOfferRemote}
        />
      </span>
    );
  };

  @Bind()
  changePaymentTerm(val, record = {}) {
    const { form } = this.props;
    if (!val) {
      return;
    }
    const { termId: paymentTermId, termName: paymentTermName } = record || {};

    form.setFieldsValue({
      paymentTermId,
      paymentTermName,
    });
  }

  render() {
    const {
      headerInfo = {},
      tenantId,
      customizeForm,
      form: { getFieldDecorator },
      sectionAndDataFlag,
      headerCountTimeInfo = {},
      viewApplicationOrgModal = () => {},
      changeCurrencyCode,
      custLoading,
      biddingOfferRemote,
    } = this.props;
    const { collapseKeys } = this.state;
    const {
      rfxNum, // RFX 单号
      rfxTitle, // 询价单标题
      companyName, // 客户
      currencyCode = null, // 币种
      auctionDirectionMeaning, // 报价方向
      templateName, // 寻源模板
      sourceCategoryMeaning, // 寻源类别
      quotationLineNumber, // 报价行数
      quotationTotalAmount, // 报价总金额
      rfxRemark, // 备注
      multiCurrencyFlag = 0, // 允许多币种报价
      sourceProjectTotalAmount = null, // 寻源项目总金额
      applicationScopeFlag = 0,
    } = headerInfo;
    const currentSectionAndDataFlag = sectionAndDataFlag();
    const headerDataCountTime = isEmpty(headerCountTimeInfo) ? headerInfo : headerCountTimeInfo;
    const newQuotationEndDate = isEmpty(headerCountTimeInfo)
      ? headerInfo?.quotationEndDate
      : headerCountTimeInfo?.quotationEndDate;

    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={['baseInfos']}
        onChange={this.onCollapseChange}
      >
        <Panel
          showArrow={false}
          header={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: '16px',
                marginRight: '16px',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <h3>{rfxNum && rfxTitle ? `${rfxNum}-${rfxTitle}` : ''}</h3>
                <a style={{ marginLeft: '8px', marginRight: '8px' }}>
                  {collapseKeys.includes('baseInfos')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
              </div>
              {biddingOfferRemote ? (
                biddingOfferRemote.process(
                  'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_COUNT_DOWN_NODE',
                  <div>{this.renderCountDown(headerDataCountTime)}</div>,
                  {
                    that: this,
                  }
                )
              ) : (
                <div>{this.renderCountDown(headerDataCountTime)}</div>
              )}
            </div>
          }
          key="baseInfos"
        >
          {customizeForm(
            {
              code: 'SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
              form: this.props.form,
              dataSource: headerInfo,
            },
            <Form custLoading={custLoading}>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('companyName', {
                      initialValue: companyName,
                    })(<span>{companyName}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`ssrc.supplierQuotation.model.supQuo.currency`).d('币种')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currencyCode', {
                      initialValue: currencyCode,
                      rules: [
                        {
                          required: !!multiCurrencyFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('ssrc.supplierQuotation.model.supQuo.currency')
                              .d('币种'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="SMDM.EXCHANGE_RATE.CURRENCY"
                        textValue={currencyCode}
                        disabled={!multiCurrencyFlag}
                        onChange={(val, record) => changeCurrencyCode(val, record)}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.quotationEndDate`)
                      .d('报价截止时间')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationEndDate', {
                      initialValue: newQuotationEndDate,
                    })(<span>{dateTimeRender(newQuotationEndDate)}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
                    {getFieldDecorator('auctionDirectionMeaning', {
                      initialValue: auctionDirectionMeaning,
                    })(<span>{auctionDirectionMeaning}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.sourcingTemplate`)
                      .d('寻源模板')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('templateName', {
                      initialValue: templateName,
                    })(<span>{templateName}</span>)}
                  </FormItem>
                </Col>
                {currentSectionAndDataFlag ? (
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`ssrc.supplierQuotation.model.supQuo.sProjectTotalPrice`)
                        .d('寻源项目总金额')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('sourceProjectTotalAmount', {
                        initialValue: sourceProjectTotalAmount,
                      })(<span>{numberSeparatorRender(sourceProjectTotalAmount)}</span>)}
                    </FormItem>
                  </Col>
                ) : null}
              </Row>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={
                      !currentSectionAndDataFlag
                        ? intl
                            .get(`ssrc.supplierQuotation.model.supQuo.quotationTotalAmount`)
                            .d('报价总金额')
                        : intl
                            .get('ssrc.supplierQuotation.model.supQuo.sectionQuotationTotalAmount')
                            .d('标段报价总金额')
                    }
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationTotalAmount', {
                      initialValue: quotationTotalAmount,
                    })(<span>{numberSeparatorRender(quotationTotalAmount)}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.sourcingCategory`)
                      .d('寻源类别')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('sourceCategoryMeaning', {
                      initialValue: sourceCategoryMeaning,
                    })(<span>{sourceCategoryMeaning}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.quotationLineNumber`)
                      .d('报价行数')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationLineNumber', {
                      initialValue: quotationLineNumber,
                    })(<span>{quotationLineNumber}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.businessAttachmentUuid`)
                      .d('商务附件')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('businessAttachmentUuid', {
                      initialValue: headerInfo.rfxBusinessAttachmentUuid,
                    })(
                      <Upload
                        filePreview
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="ssrc-rfx-rfxheader"
                        attachmentUUID={headerInfo.rfxBusinessAttachmentUuid}
                        tenantId={tenantId}
                        viewOnly
                        icon="download"
                      />
                    )}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.technicalAttachment`)
                      .d('技术附件')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('techAttachmentUuid', {
                      initialValue: headerInfo.rfxTechAttachmentUuid,
                    })(
                      <Upload
                        filePreview
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="ssrc-rfx-rfxheader"
                        attachmentUUID={headerInfo.rfxTechAttachmentUuid}
                        tenantId={tenantId}
                        viewOnly
                        icon="download"
                      />
                    )}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.sealedQuotation`)
                      .d('密封报价')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('sealedQuotationFlag', {
                      initialValue: headerInfo.sealedQuotationFlag,
                    })(<span>{yesOrNoRender(headerInfo.sealedQuotationFlag)}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.sourcingType`)
                      .d('寻源类型')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('sourceTypeMeaning', {
                      initialValue: headerInfo.sourceTypeMeaning,
                    })(<span>{headerInfo.sourceTypeMeaning}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.priceCategory`)
                      .d('价格类型')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('priceCategoryMeaning', {
                      initialValue: headerInfo.priceCategoryMeaning,
                    })(<span>{headerInfo.priceCategoryMeaning}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  {headerInfo.paymentTermFlag ? (
                    <FormItem
                      label={intl
                        .get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`)
                        .d('付款方式')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('paymentTypeId', {
                        initialValue: headerInfo.paymentTypeId,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`)
                                .d('付款方式'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SMDM.PAYMENTTYPE"
                          onChange={(val, record) => this.changePaymentType(val, record)}
                          queryParams={{
                            paymentTypeId: 'paymentTypeId',
                          }}
                          textValue={headerInfo.paymentTypeName}
                        />
                      )}
                    </FormItem>
                  ) : (
                    <FormItem
                      label={intl
                        .get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`)
                        .d('付款方式')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('paymentTypeId', {
                        initialValue: headerInfo.paymentTypeId,
                      })(<span>{headerInfo.paymentTypeName}</span>)}
                    </FormItem>
                  )}
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  {headerInfo.paymentTermFlag ? (
                    <FormItem
                      label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('paymentTermId', {
                        initialValue: headerInfo.paymentTermId,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`ssrc.common.model.common.termsOfPayment`)
                                .d('付款条款'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SMDM.PAYMENT.TERM"
                          onChange={(val, record) => this.changePaymentTerm(val, record)}
                          textValue={headerInfo.paymentTermName}
                          queryParams={{
                            enabledFlag: 1,
                          }}
                        />
                      )}
                    </FormItem>
                  ) : (
                    <FormItem
                      label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('paymentTermId', {
                        initialValue: headerInfo.paymentTermId,
                      })(<span>{headerInfo.paymentTermName}</span>)}
                    </FormItem>
                  )}
                </Col>
                {headerInfo && headerInfo.sourceFrom === 'PROJECT' && (
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`ssrc.supplierQuotation.model.supplierQuotation.sourceProjectNum`)
                        .d('寻源项目编号')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('sourceProjectNum', {
                        initialValue: headerInfo.sourceProjectNum,
                      })(<span>{headerInfo.sourceProjectNum}</span>)}
                    </FormItem>
                  </Col>
                )}
                {headerInfo && headerInfo.sourceFrom === 'PROJECT' && (
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`ssrc.supplierQuotation.model.inquiryHall.sourceProjectName`)
                        .d('寻源项目名称')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('sourceProjectName', {
                        initialValue: headerInfo.sourceProjectName,
                      })(<span>{headerInfo.sourceProjectName}</span>)}
                    </FormItem>
                  </Col>
                )}
              </Row>
              <Row gutter={48} className="read-row">
                {headerInfo &&
                  headerInfo.sourceFrom === 'PROJECT' &&
                  headerInfo.subjectMatterRule === 'PACK' && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.sectionName`)
                          .d('标段名称')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('sectionName', {
                          initialValue: headerInfo.sectionName,
                        })(<span>{headerInfo.sectionName}</span>)}
                      </FormItem>
                    </Col>
                  )}
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('roundNumber', {
                      initialValue: headerInfo.roundNumber,
                    })(<span>{headerInfo.roundNumber}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`hzero.common.remark`).d('备注')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('rfxRemark', {
                      initialValue: rfxRemark,
                    })(<span>{rfxRemark}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`)
                      .d('适用范围')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('applicationScopeFlag')(
                      <a onClick={() => viewApplicationOrgModal()} disabled={!applicationScopeFlag}>
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
                      </a>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </Panel>
      </Collapse>
    );
  }
}
