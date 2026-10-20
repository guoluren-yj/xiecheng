import React, { Component, Fragment } from 'react';
import { Form, Row, Col, Collapse, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import CPopover from '@/routes/components/CPopover';
import EditTable from 'components/EditTable';
import { isNumber, sum, noop } from 'lodash';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import common from '@/routes/ssrc/common.less';
import CountDown from '../../components/CountDown';

const FormItem = Form.Item;
const { Panel } = Collapse;

class InquiryHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfos'], // 打开的折叠面板key
    };
  }

  /**
   * onCollapseChange - 折叠面板onChange
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

  // 保证金格式
  bidBoundFormatter(value = null) {
    const isZero = value === 0 || value === '0' || value === '0.00' || value === '0.0';
    const FREE = intl.get('ssrc.common.view.gratis').d('免费');
    if (isZero) {
      return FREE;
    }

    return value;
  }

  /**
   * 倒计时 - 此方法被 [华友钴业] 二开, 严禁他人, 删除/修改 此方法名
   * @protected
   */
  renderCountDown(headerInfo = {}) {
    if (!headerInfo) {
      return;
    }
    const { quotationName } = this.props;

    const {
      currentDateTime = null,
      currentQuotationRound = null,
      quotationEndDate = null,
      bargainStatus = null,
    } = headerInfo;

    let title = intl
      .get(`ssrc.supplierQuotation.model.supQuo.commonGridQuotationPrice`, { quotationName })
      .d('{quotationName}');
    if (currentQuotationRound) {
      title = `${intl.get('ssrc.common.the').d('第')} ${currentQuotationRound} ${intl
        .get('ssrc.common.round')
        .d('轮')}`;
    }
    if (bargainStatus === 'BARGAINING_ONLINE') {
      title = intl.get('ssrc.common.view.bargainPrice').d('议价');
    }

    return (
      <span>
        {`${title} ${intl.get('ssrc.supplierQuotation.view.supQuo.cutOffTime').d('截止时间')}`}
        <CountDown sysNow={currentDateTime} endTime={quotationEndDate} type="day" />
      </span>
    );
  }

  @Bind()
  getColumns() {
    const { quotationName, headerInfo = {} } = this.props;
    const { roundQuotationRankFlag, currentQuotationRound } = headerInfo || {};

    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'quotationRound',
        width: 60,
        render: (val, record) =>
          record.currentFlag ? <div style={{ color: 'green' }}> {val} </div> : <div> {val} </div>,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, { quotationName })
          .d('{quotationName}状态'),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
        render: (val, record) =>
          record.currentFlag ? <div style={{ color: 'green' }}> {val} </div> : <div> {val} </div>,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartTime`, { quotationName })
          .d('{quotationName}开始时间'),
        dataIndex: 'roundQuotationStartDate',
        width: 140,
        render: (val, record) => {
          const formatVal = dateTimeRender(val);
          return record.currentFlag ? (
            <div style={{ color: 'green' }}> {formatVal} </div>
          ) : (
            <div> {formatVal} </div>
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndTime`, { quotationName })
          .d('{quotationName}截止时间'),
        dataIndex: 'roundQuotationEndDate',
        width: 140,
        render: (val, record) => {
          const formatVal = dateTimeRender(val);
          return record.currentFlag ? (
            <div style={{ color: 'green' }}> {formatVal} </div>
          ) : (
            <div> {formatVal} </div>
          );
        },
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
            dataIndex: 'roundRank',
            width: 60,
            render: (val, record) =>
              record.currentFlag ? (
                <div style={{ color: 'green' }}> {val} </div>
              ) : (
                <div> {val} </div>
              ),
          }
        : null,
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.taxRateQuotationAmount`)
          .d('含税报价总金额'),
        dataIndex: 'quotationAmount',
        width: 120,
        render: (val, record) =>
          record.currentFlag ? (
            <div style={{ color: 'green' }}> {numberSeparatorRender(val)} </div>
          ) : (
            <div> {numberSeparatorRender(val)} </div>
          ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxRateQuotationAmount`)
          .d('报价总金额(不含税)'),
        dataIndex: 'netQuotationAmount',
        width: 120,
        render: (val, record) =>
          record.currentFlag ? (
            <div style={{ color: 'green' }}> {numberSeparatorRender(val)} </div>
          ) : (
            <div> {numberSeparatorRender(val)} </div>
          ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.roundQutaionReson`)
          .d('发起本轮报价原因'),
        dataIndex: 'roundRemark',
        width: 160,
        render: (val, record) =>
          record.currentFlag ? <div style={{ color: 'green' }}> {val} </div> : <div> {val} </div>,
      },
    ].filter(Boolean);
    return columns;
  }

  renderFormFields = () => {
    const {
      quotationName,
      headerInfo = {},
      tenantId,
      form,
      form: { getFieldDecorator },
      sectionAndDataFlag,
      sourceCategoryName,
      viewApplicationOrgModal = () => {},
      changeCurrencyCode,
      remote,
    } = this.props;
    const {
      companyName, // 客户
      currencyCode = null, // 币种
      quotationEndDate, // 报价截止时间
      auctionDirectionMeaning, // 报价方向
      templateName, // 寻源模板
      sourceCategoryMeaning, // 寻源类别
      secondarySourceCategoryMeaning, // 新招标-寻源类别
      quotationLineNumber, // 报价行数
      quotationTotalAmount, // 报价总金额
      rfxRemark, // 备注
      multiCurrencyFlag = 0, // 允许多币种报价
      sourceProjectTotalAmount = null, // 寻源项目总金额
      applicationScopeFlag = 0,
      supplierStatus,
    } = headerInfo;
    const currentSectionAndDataFlag = sectionAndDataFlag();
    const wholeAbandonFlag =
      supplierStatus &&
      (supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'); // 报价-整单放弃标识

    const currentFields = [
      <Row gutter={48} className="writable-row">
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
            label={intl.get('ssrc.supplierQuotation.model.supQuo.currency').d('币种')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('currencyCode', {
              initialValue: currencyCode,
              rules: [
                {
                  required: !!multiCurrencyFlag && !wholeAbandonFlag,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('ssrc.supplierQuotation.model.supQuo.currency').d('币种'),
                  }),
                },
              ],
            })(
              <Lov
                code="SMDM.EXCHANGE_RATE.CURRENCY"
                textValue={currencyCode}
                disabled={!multiCurrencyFlag}
                lovOptions={{
                  displayField: 'currencyCode',
                  valueField: 'currencyCode',
                }}
                onChange={(val, record) => changeCurrencyCode(val, record)}
              />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonSourceRoundNumber`, {
                sourceCategoryName,
              })
              .d('{sourceCategoryName}次数')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('roundNumber', {
              initialValue: headerInfo.roundNumber,
            })(<span>{headerInfo.roundNumber}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationDeadline`, {
                quotationName,
              })
              .d('{quotationName}截止时间')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('quotationEndDate', {
              initialValue: quotationEndDate,
            })(<span>{dateTimeRender(quotationEndDate)}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
            {getFieldDecorator('auctionDirectionMeaning', {
              initialValue: auctionDirectionMeaning,
            })(<span>{auctionDirectionMeaning}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingTemplate`).d('寻源模板')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('templateName', {
              initialValue: templateName,
            })(<span>{templateName}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
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
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={
              !currentSectionAndDataFlag
                ? intl
                    .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationTotalAmount`, {
                      quotationName,
                    })
                    .d('{quotationName}总金额')
                : intl
                    .get(`ssrc.supplierQuotation.model.supQuo.commonSectionQuotationTotalAmount`, {
                      quotationName,
                    })
                    .d('标段{quotationName}总金额')
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
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingCategory`).d('寻源类别')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sourceCategoryMeaning', {
              initialValue: secondarySourceCategoryMeaning || sourceCategoryMeaning,
            })(<span>{secondarySourceCategoryMeaning || sourceCategoryMeaning}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationLineNumber`, {
                quotationName,
              })
              .d('{quotationName}行数')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('quotationLineNumber', {
              initialValue: quotationLineNumber,
            })(<span>{quotationLineNumber}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.busiAttach`).d('商务附件')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rfxBusinessAttachmentUuid', {
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
            {getFieldDecorator('rfxTechAttachmentUuid', {
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
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.sealedQuotation`).d('密封报价')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sealedQuotationFlag', {
              initialValue: headerInfo.sealedQuotationFlag,
            })(<span>{yesOrNoRender(headerInfo.sealedQuotationFlag)}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingType`).d('寻源类型')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sourceTypeMeaning', {
              initialValue: headerInfo.sourceTypeMeaning,
            })(<span>{headerInfo.sourceTypeMeaning}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.priceCategory`).d('价格类型')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('priceCategoryMeaning', {
              initialValue: headerInfo.priceCategoryMeaning,
            })(<span>{headerInfo.priceCategoryMeaning}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col {...FORM_COL_3_LAYOUT}>
          {headerInfo.paymentTermFlag ? (
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeId', {
                initialValue: headerInfo.paymentTypeId,
                rules: [
                  {
                    required: !wholeAbandonFlag,
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
                    tenantId: headerInfo.tenantId,
                  }}
                  textValue={headerInfo.paymentTypeName}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: headerInfo.paymentTypeName,
              })(<span>{headerInfo.paymentTypeName}</span>)}
            </FormItem>
          )}
        </Col>
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
                    required: !wholeAbandonFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
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
                    tenantId: headerInfo.tenantId,
                  }}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTermName', {
                initialValue: headerInfo.paymentTermName,
              })(<span>{headerInfo.paymentTermName}</span>)}
            </FormItem>
          )}
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('bidBond', {
              initialValue: headerInfo.bidBond,
            })(
              <span>
                {Number(headerInfo.bidBond) === 0
                  ? intl.get('ssrc.common.view.gratis').d('免费')
                  : numberSeparatorRender(headerInfo.bidBond) || null}
              </span>
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('quotationRoundNumber', {
              initialValue: headerInfo.quotationRoundNumber,
            })(<span>{headerInfo.quotationRoundNumber}</span>)}
          </FormItem>
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
      </Row>,
      <Row gutter={48} className="read-row">
        {headerInfo &&
          headerInfo.sourceFrom === 'PROJECT' &&
          headerInfo.subjectMatterRule === 'PACK' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('sectionName', {
                  initialValue: headerInfo.sectionName,
                })(<span>{headerInfo.sectionName}</span>)}
              </FormItem>
            </Col>
          )}
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...EDIT_FORM_ITEM_LAYOUT}>
            {getFieldDecorator('rfxRemark', {
              initialValue: rfxRemark,
            })(<CPopover content={rfxRemark}>{rfxRemark}</CPopover>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('applicationScopeFlag')(
              <a disabled={!applicationScopeFlag} onClick={() => viewApplicationOrgModal()}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
              </a>
            )}
          </FormItem>
        </Col>
      </Row>,
    ].filter(Boolean);

    const fields = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_BASE_FORM_CUX_FIELDS_PROCESS',
          currentFields,
          { headerComponentThis: this, headerInfo, form }
        )
      : currentFields;

    return fields;
  };

  render() {
    const {
      custkey,
      headerInfo = {},
      customizeForm = noop,
      customizeTable = noop,
      roundQuotationInfo,
    } = this.props;
    const {
      rfxNum, // RFX 单号
      rfxTitle, // 询价单标题
      currentQuotationRound,
      roundQuotationRule,
    } = headerInfo;
    const { collapseKeys } = this.state;
    const scrollX = sum(this.getColumns().map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <Collapse
        // className="form-collapse"
        className={common['page-content-custom-supplierQuotation']}
        defaultActiveKey={['baseInfos', 'roundQuotation']}
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
              <div style={{ width: '65%', display: 'inline-flex', alignItems: 'center' }}>
                <h3
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '65%',
                  }}
                >
                  {rfxNum} -
                  {
                    <Tooltip title={`${rfxNum}-${rfxTitle}`} overlayStyle={{ minWidth: '300px' }}>
                      {rfxTitle}
                    </Tooltip>
                  }
                </h3>
                <a style={{ marginLeft: '8px', marginRight: '8px' }}>
                  {collapseKeys.includes('baseInfos')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
              </div>
              <div>{this.renderCountDown(headerInfo)}</div>
            </div>
          }
          key="baseInfos"
        >
          {customizeForm(
            {
              code: `SSRC.${custkey}SUPPLIER_QUOTATION.BASE_FORM`,
              form: this.props.form,
              dataSource: headerInfo,
            },
            <Form className="read-row-custom">{this.renderFormFields()}</Form>
          )}
        </Panel>

        {(['AUTO', 'AUTO_CHECK', 'AUTO_SCORE'].includes(roundQuotationRule) &&
          currentQuotationRound > 0) ||
        (['CHECK', 'SCORE'].includes(roundQuotationRule) && currentQuotationRound > 1) ? (
          <Fragment>
            <div
              style={{
                lineHeight: '16px',
                fontSize: '14px',
                marginBottom: '16px',
                height: '16px',
                display: 'flex',
              }}
            >
              <div
                style={{
                  backgroundColor: '#00BFBF',
                  width: '2px',
                  height: '16px',
                  marginRight: '8px',
                }}
              />
              <div>
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.roundQuotationInfoTable`)
                  .d('多轮报价信息表')}
              </div>
            </div>
            {customizeTable(
              {
                code: `SSRC.${custkey}SUPPLIER_QUOTATION.ROUND_QUOTATION_TABLE`,
              },
              <EditTable
                bordered
                rowKey="roundHeaderDateId"
                columns={this.getColumns()}
                scroll={{ x: scrollX }}
                dataSource={roundQuotationInfo}
                pagination={false}
              />
            )}
          </Fragment>
        ) : null}
      </Collapse>
    );
  }
}

const withStandardCompEnhancer = (Comp) => {
  const HOCComponent = formatterCollections({ code: ['ssrc.supplierQuotation', 'ssrc.common'] })(
    Comp
  );
  return HOCComponent;
};

export { InquiryHeader, withStandardCompEnhancer };
export default withStandardCompEnhancer(InquiryHeader);
