/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import { Form, Row, Col, DatePicker, Input, Badge, InputNumber } from 'hzero-ui';
import { noop, isUndefined, isFunction, isNumber } from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import { getDateFormat, getCurrentTenant } from 'utils/utils';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import { ChunkUploadProps } from '@/utils/SsrcRegx';
// import CPopover from '@/routes/components/CPopover';
import { parseAmount } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';

import common from '@/routes/ssrc/common.less';
import FormInputWrapper from '../components/WrapperTooltip';

const FormItem = Form.Item;

class QuotationFrom extends Component {
  constructor(props) {
    super(props);

    const { onRef } = props || {};
    if (isFunction(onRef)) {
      onRef(this);
    }

    this.state = {};
  }

  // 获取单价含税节点
  @Bind()
  getCurrentQuotationPriceNode() {
    const {
      quotationHeader = {},
      isUnTaxPriceFlag,
      form,
      form: { getFieldDecorator },
      biddingLine = {},
      formLayout = {},
      currencyPrecision,
      caclRule,
      priceValidator = noop,
      handleChangeUnitPrice = noop,
      remote,
    } = this.props;
    const { tenantId = null } = quotationHeader || {};
    const node = (
      <Form.Item
        label={intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)')}
        {...formLayout}
      >
        {getFieldDecorator('currentQuotationPrice', {
          initialValue: biddingLine.currentQuotationPrice,
          rules: [
            {
              required:
                form.getFieldValue('abandonedFlag') !== 1 &&
                biddingLine.lineStatus === 'IN_QUOTATION' &&
                biddingLine.abandonedFlag === 0 &&
                !isUnTaxPriceFlag &&
                !biddingLine.priceReadonlyFlag,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPrice`).d('单价'),
              }),
            },
            {
              validator: priceValidator,
            },
          ],
        })(
          <FormInputWrapper
            priceReadonlyFlag={biddingLine.priceReadonlyFlag === 1}
            disabled={
              form.getFieldValue('abandonedFlag') === 1 ||
              biddingLine.lineStatus !== 'IN_QUOTATION' ||
              (isNumber(biddingLine.validQuotationPrice) && !biddingLine.continuousQuotationFlag) ||
              isUnTaxPriceFlag ||
              biddingLine.priceReadonlyFlag === 1
            }
            onChange={(val) => handleChangeUnitPrice(val, biddingLine)}
            // precision={4}
            style={{ width: '100%' }}
            min="0"
            max="99999999999999999999"
            parser={(val) => parseAmount(val, currencyPrecision)}
            allowThousandth
            zeroValueVisibleFlag={
              caclRule === 'Amount' &&
              isUnTaxPriceFlag &&
              form.getFieldValue('netPrice') !== 0 &&
              parseAmount(form.getFieldValue('currentQuotationPrice'), currencyPrecision) == 0
            }
            taxFlag={isUnTaxPriceFlag}
            currencyPrecision={currencyPrecision}
            queryPrecisionParams={{
              purTenantId: tenantId,
            }}
          />
        )}
      </Form.Item>
    );
    return remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_CURRENT_PRICE_FORM_ITEM_NODE',
          node,
          {
            quotationHeader,
            isUnTaxPriceFlag,
            form,
            biddingLine,
            formLayout,
            currencyPrecision,
            caclRule,
            priceValidator,
            handleChangeUnitPrice,
            parseAmount,
          }
        )
      : node;
  }

  render() {
    const {
      quotationHeader = {},
      organizationId,
      isUnTaxPriceFlag,
      customizeForm = noop,
      custLoading,
      form,
      form: { getFieldDecorator },
      biddingLine = {},
      formLayout = {},
      currentRecord = {},
      currencyPrecision,
      caclRule,
      giveUpQuotationLine = noop,
      priceValidator = noop,
      handleChangeNetPrice = noop,
      handleChangeTaxIncludedFlag = noop,
      changeTaxId = noop,
      queryBiddingQuotationLine = noop,
      openLadder = noop,
      saveBiddingOffer = noop,
      changeQuantity = noop,
      fetchHeader = noop,
      financialPrecision,
      remote,
    } = this.props;
    const { tenantId = null } = quotationHeader || {};
    const { quotationLineId } = currentRecord || {};

    let cuxFreightAmountProps = {};
    cuxFreightAmountProps = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_QUOTATION_FORM_FREIGHT_AMOUNT_PROPS',
          cuxFreightAmountProps,
          {
            that: this,
            form,
            quotationHeader,
          }
        )
      : cuxFreightAmountProps;
    cuxFreightAmountProps = cuxFreightAmountProps || {};

    return (
      <div>
        {customizeForm(
          {
            code: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
            form,
            dataSource: biddingLine,
          },
          <Form className="writable-row-custom" custLoading={custLoading}>
            <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.abandon`).d('放弃')}
                  {...formLayout}
                >
                  {getFieldDecorator('abandonedFlag', {
                    initialValue: biddingLine.abandonedFlag,
                  })(
                    <Checkbox
                      disabled={
                        biddingLine.quotationScope === 'ALL_QUOTATION' ||
                        biddingLine.quotationLineStatus === 'ABANDONED'
                      }
                      checkedValue={1}
                      unCheckedValue={0}
                      onChange={(e) => giveUpQuotationLine(e, biddingLine)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>{this.getCurrentQuotationPriceNode()}</Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)')}
                  {...formLayout}
                >
                  {getFieldDecorator('netPrice', {
                    initialValue: biddingLine.netPrice,
                    rules: [
                      {
                        required:
                          form.getFieldValue('abandonedFlag') !== 1 &&
                          biddingLine.lineStatus === 'IN_QUOTATION' &&
                          biddingLine.abandonedFlag === 0 &&
                          isUnTaxPriceFlag &&
                          !biddingLine.priceReadonlyFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supQuo.netPrice`)
                            .d('单价(不含税)'),
                        }),
                      },
                      {
                        validator: priceValidator,
                      },
                    ],
                  })(
                    <FormInputWrapper
                      priceReadonlyFlag={biddingLine.priceReadonlyFlag === 1}
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION' ||
                        (isNumber(biddingLine.validQuotationPrice) &&
                          !biddingLine.continuousQuotationFlag) ||
                        !isUnTaxPriceFlag ||
                        biddingLine.priceReadonlyFlag === 1
                      }
                      onChange={(val) => handleChangeNetPrice(val, biddingLine)}
                      style={{ width: '100%' }}
                      min="0"
                      max="99999999999999999999"
                      parser={(val) => parseAmount(val, currencyPrecision)}
                      allowThousandth
                      zeroValueVisibleFlag={
                        caclRule === 'Amount' &&
                        !isUnTaxPriceFlag &&
                        form.getFieldValue('currentQuotationPrice') !== 0 &&
                        parseAmount(form.getFieldValue('netPrice'), currencyPrecision) == 0
                      }
                      taxFlag={!isUnTaxPriceFlag}
                      currencyPrecision={currencyPrecision}
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'none' }}>
                  {getFieldDecorator('totalAmount', {
                    initialValue: biddingLine.totalAmount,
                  })(<div />)}
                </Form.Item>
                <Form.Item style={{ display: 'none' }}>
                  {getFieldDecorator('netAmount', {
                    initialValue: biddingLine.netAmount,
                  })(<div />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('ssrc.common.productionPlace').d('产地')}
                  {...formLayout}
                >
                  {getFieldDecorator('origin', {
                    initialValue: biddingLine.origin,
                  })(<Input disabled={form.getFieldValue('abandonedFlag') === 1} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxIncludedFlag', {
                    initialValue: biddingLine.taxIncludedFlag,
                  })(
                    <Checkbox
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 || biddingLine.taxChangeFlag === 0
                      }
                      onChange={(e) => handleChangeTaxIncludedFlag(e, biddingLine)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxId', {
                    initialValue: biddingLine.taxId,
                    rules: [
                      {
                        required:
                          form.getFieldValue('abandonedFlag') !== 1 &&
                          biddingLine.taxChangeFlag &&
                          // biddingLine.taxIncludedFlag &&
                          form.getFieldValue('taxIncludedFlag') === 1,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supplierBid.modifyTheRate`)
                            .d('修改税率(%)'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      style={{ width: '98%' }}
                      code="SMDM.TAX"
                      textValue={biddingLine.taxRate}
                      textField="taxRate"
                      disabled={
                        biddingLine.taxChangeFlag === 0 ||
                        // biddingLine.taxIncludedFlag === 0 ||
                        form.getFieldValue('abandonedFlag') === 1 ||
                        form.getFieldValue('taxIncludedFlag') === 0
                      }
                      onChange={(value, dataList) => changeTaxId(value, dataList)}
                      queryParams={{
                        organizationId: getCurrentTenant().tenantId,
                        tenantId,
                      }}
                    />
                  )}
                  {getFieldDecorator('taxRate', { initialValue: biddingLine.taxRate })}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                {biddingLine.validDateInputType !== 'READONLY' ? (
                  <Form.Item
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
                      .d('报价有效期从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('currentExpiryDateFrom', {
                      initialValue:
                        biddingLine.currentExpiryDateFrom &&
                        moment(biddingLine.currentExpiryDateFrom, getDateFormat()),
                      rules: [
                        {
                          required:
                            form.getFieldValue('abandonedFlag') !== 1 &&
                            biddingLine.validDateInputType === 'REQUIRED',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
                              .d('报价有效期从'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                        disabled={
                          form.getFieldValue('abandonedFlag') === 1 ||
                          biddingLine.lineStatus !== 'IN_QUOTATION'
                        }
                        // disabledDate={(currentDate) =>
                        //   (form.getFieldValue('currentExpiryDateTo') &&
                        //     moment(form.getFieldValue('currentExpiryDateTo')).isBefore(
                        //       currentDate,
                        //       'day'
                        //     )) ||
                        //   moment().isAfter(currentDate, 'day')
                        // }
                        disabledDate={(currentDate) => {
                          const toData = form.getFieldValue('currentExpiryDateTo');
                          if (toData) {
                            return moment(toData).isBefore(currentDate, 'day');
                          }
                        }}
                      />
                    )}
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
                      .d('报价有效期从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('currentExpiryDateFrom', {
                      initialValue:
                        biddingLine.currentExpiryDateFrom &&
                        moment(biddingLine.currentExpiryDateFrom, getDateFormat()),
                    })(<span>{dateRender(biddingLine.currentExpiryDateFrom)}</span>)}
                  </Form.Item>
                )}
              </Col>
              <Col span={8}>
                {biddingLine.validDateInputType !== 'READONLY' ? (
                  <Form.Item
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityTo`)
                      .d('报价有效期至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('currentExpiryDateTo', {
                      initialValue:
                        biddingLine.currentExpiryDateTo &&
                        moment(biddingLine.currentExpiryDateTo, getDateFormat()),
                      rules: [
                        {
                          required:
                            form.getFieldValue('abandonedFlag') !== 1 &&
                            biddingLine.validDateInputType === 'REQUIRED',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityTo`)
                              .d('报价有效期至'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                        disabled={
                          form.getFieldValue('abandonedFlag') === 1 ||
                          biddingLine.lineStatus !== 'IN_QUOTATION'
                        }
                        disabledDate={(currentDate) => {
                          const fromDate = form?.getFieldValue('currentExpiryDateFrom');
                          if (fromDate) {
                            return moment(fromDate).isAfter(currentDate, 'day');
                          }

                          return moment().isAfter(currentDate, 'day');
                        }}
                      />
                    )}
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.quotationDateTo`)
                      .d('报价有效期至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('currentExpiryDateTo', {
                      initialValue:
                        biddingLine.currentExpiryDateTo &&
                        moment(biddingLine.currentExpiryDateTo, getDateFormat()),
                    })(<span>{dateRender(biddingLine.currentExpiryDateTo)}</span>)}
                  </Form.Item>
                )}
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`)
                    .d('报价明细')}
                  {...formLayout}
                >
                  {getFieldDecorator('quotationDetailFlag')(
                    <>
                      <QuotationDetailModal
                        rowData={biddingLine}
                        detailFrom="SUP_QUOTATION" // 针对一些子模块的情况
                        sourceFrom="RFX"
                        bidFlag={false}
                        quotationStatus={quotationHeader.quotationStatus}
                        continuousQuotationFlag={quotationHeader.continuousQuotationFlag}
                        disabled={form.getFieldValue('abandonedFlag')}
                        onBeforeOpen={saveBiddingOffer} // 报价明细保存或取消后保存头行数据（解决用户未保存数据点报价明细后数据被清空）
                        onOk={() => {
                          fetchHeader();
                          queryBiddingQuotationLine({ quotationLineId });
                        }}
                        onCancel={() => {
                          fetchHeader();
                          queryBiddingQuotationLine({ quotationLineId });
                        }}
                        headerData={quotationHeader}
                      />
                      {biddingLine.quotationDetailRequire === 1 && (
                        <Badge style={{ marginLeft: '2px' }} status="error" />
                      )}
                    </>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.ladderInquiryYesOrNot`)
                    .d('是否启用阶梯报价')}
                  {...formLayout}
                >
                  {getFieldDecorator('ladderInquiryFlag', {
                    initialValue: biddingLine.ladderInquiryFlag,
                  })(
                    <Checkbox
                      checkedValue={1}
                      unCheckedValue={0}
                      disabled={
                        biddingLine.diyLadderQuotationFlag === 0 ||
                        form.getFieldValue('abandonedFlag') === 1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.ladderLevel`).d('阶梯报价')}
                  {...formLayout}
                >
                  {getFieldDecorator('ladderQuotation')(
                    form.getFieldValue('ladderInquiryFlag') === 1 ? (
                      <>
                        <a onClick={() => openLadder(biddingLine)}>
                          {intl
                            .get(`ssrc.supplierQuotation.view.message.button.ladderLevel`)
                            .d('阶梯报价')}
                        </a>
                        {biddingLine.ladderInquiryRequire === 1 &&
                          form?.getFieldValue('abandonedFlag') !== 1 && (
                            <Badge style={{ marginLeft: '2px' }} status="error" />
                          )}
                      </>
                    ) : (
                      <div />
                    )
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`)
                    .d('可供数量')}
                  {...formLayout}
                >
                  {getFieldDecorator('currentQuotationQuantity', {
                    rules: [
                      {
                        required:
                          biddingLine.quantityChangeFlag === 1 &&
                          form.getFieldValue('abandonedFlag') === 0 &&
                          biddingLine.lineStatus === 'IN_QUOTATION' &&
                          biddingLine.abandonedFlag === 0,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`)
                            .d('可供数量'),
                        }),
                      },
                    ],
                    initialValue: biddingLine.currentQuotationQuantity,
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      uom={biddingLine.uomId}
                      min="0"
                      disabled={
                        biddingLine.quantityChangeFlag === 0 ||
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION'
                      }
                      style={{ width: '98%' }}
                      max="99999999999999999999"
                      onChange={(val) => changeQuantity(val, biddingLine)}
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.promisedDeliveryDate`)
                    .d('承诺交货期')}
                  {...formLayout}
                >
                  {getFieldDecorator('currentPromisedDate', {
                    initialValue:
                      biddingLine.currentPromisedDate &&
                      moment(biddingLine.currentPromisedDate, getDateFormat()),
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder={null}
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.includingFreight`)
                    .d('是否含运费')}
                  {...formLayout}
                >
                  {getFieldDecorator('freightIncludedFlag', {
                    initialValue: biddingLine.freightIncludedFlag,
                  })(
                    <Checkbox
                      disabled={
                        quotationHeader.freightUpdatableFlag === 0 ||
                        form.getFieldValue('abandonedFlag') === 1
                      }
                      onChange={(record) => {
                        if (!isUndefined(record)) {
                          form.setFieldsValue({
                            freightIncludedFlag: record.target.checked,
                            freightAmount: '',
                          });
                        }
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.freightAmount`).d('运费')}
                  {...formLayout}
                >
                  {getFieldDecorator('freightAmount', {
                    initialValue: biddingLine.freightAmount,
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      precision={financialPrecision} // 财务精度
                      min="0"
                      max="99999999999999999999"
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION' ||
                        form.getFieldValue('freightIncludedFlag') === 1
                      }
                      style={{ width: '100%' }}
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                      {...cuxFreightAmountProps}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)')}
                  {...formLayout}
                >
                  {getFieldDecorator('currentDeliveryCycle', {
                    initialValue: biddingLine.currentDeliveryCycle,
                    rules: [
                      {
                        pattern: /^[1-9]\d*$/,
                        message: intl.get('ssrc.common.positiveInteger').d('正整数'),
                      },
                    ],
                  })(
                    <InputNumber
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.minimumPurchaseAmount`)
                    .d('最小采购量')}
                  {...formLayout}
                >
                  {getFieldDecorator('minPurchaseQuantity', {
                    initialValue: biddingLine.minPurchaseQuantity,
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      uom={biddingLine.uomId}
                      min="0"
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION'
                      }
                      style={{ width: '100%' }}
                      max="99999999999999999999"
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.minimumPackageAmount`)
                    .d('最小包装量')}
                  {...formLayout}
                >
                  {getFieldDecorator('minPackageQuantity', {
                    initialValue: biddingLine.minPackageQuantity,
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      uom={biddingLine.uomId}
                      min="0"
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION'
                      }
                      style={{ width: '98%' }}
                      max="99999999999999999999"
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.quotationDescription`)
                    .d('报价说明')}
                  {...formLayout}
                >
                  {getFieldDecorator('currentQuotationRemark', {
                    initialValue: biddingLine.currentQuotationRemark,
                    rules: [
                      {
                        max: 500,
                        message: intl.get('hzero.common.validation.max', {
                          max: 500,
                        }),
                      },
                    ],
                  })(
                    <Input
                      style={{ width: '98%' }}
                      disabled={
                        form.getFieldValue('abandonedFlag') === 1 ||
                        biddingLine.lineStatus !== 'IN_QUOTATION'
                      }
                      trim
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.supplierLineAttachment`)
                    .d('供应商行附件')}
                  {...formLayout}
                >
                  {getFieldDecorator('currentAttachmentUuid', {
                    initialValue: biddingLine.currentAttachmentUuid,
                  })(
                    <Upload
                      key={biddingLine.quotationLineId}
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-quotationline"
                      attachmentUUID={biddingLine.currentAttachmentUuid}
                      tenantId={organizationId}
                      viewOnly={form.getFieldValue('abandonedFlag') === 1}
                      {...ChunkUploadProps}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}

const hocComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(Com);
};

export default hocComponent(QuotationFrom);
