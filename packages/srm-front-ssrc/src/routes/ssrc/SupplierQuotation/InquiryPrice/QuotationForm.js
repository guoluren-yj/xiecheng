/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import { Form, Row, Col, DatePicker, Input, Badge, InputNumber } from 'hzero-ui';
import { noop, isUndefined, isFunction } from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
// import { yesOrNoRender, dateRender } from 'utils/renderer';
// import { FORM_COL_3_LAYOUT } from 'utils/constants';
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

class QuotationFrom extends Component {
  constructor(props) {
    super(props);

    const { onRef } = props || {};
    if (isFunction(onRef)) {
      onRef(this);
    }

    this.state = {};
  }

  /**
   * 获取单价含税formItem
   * @protected 此方法被【奥克斯】二开，请勿修改方法名！！！
   */
  @Bind()
  getCurrentQuotationPriceNode() {
    const {
      quotationHeader = {},
      isUnTaxPriceFlag,
      form,
      form: { getFieldDecorator },
      biddingLine = {},
      formLayout = {},
      isSubmit,
      bargingFlag,
      currencyPrecision,
      caclRule,
      priceValidator = noop,
      handleChangeUnitPrice = noop,
    } = this.props;
    const { tenantId = null } = quotationHeader || {};

    return (
      <Form.Item
        name="currentQuotationPrice"
        label={intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)')}
        {...formLayout}
      >
        {getFieldDecorator('currentQuotationPrice', {
          initialValue: biddingLine.currentQuotationPrice,
          rules: [
            {
              required:
                !form.getFieldValue('abandonedFlag') &&
                (!bargingFlag || (isSubmit && bargingFlag)) &&
                !isUnTaxPriceFlag &&
                !biddingLine.eliminateRoundNumber &&
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
              form.getFieldValue('abandonedFlag') ||
              (biddingLine.continuousQuotationFlag === 0 &&
                biddingLine.currentQuotationPrice &&
                biddingLine.quotationLineStatus === 'SUBMITTED') ||
              (biddingLine.bargainFlag === 0 &&
                biddingLine.bargainStatus === 'BARGAINING_ONLINE') ||
              isUnTaxPriceFlag ||
              biddingLine.eliminateRoundNumber ||
              biddingLine.priceReadonlyFlag === 1
            }
            onChange={(val) => handleChangeUnitPrice(val, biddingLine)}
            // precision={4}
            style={{ width: '98%' }}
            min="0"
            max="99999999999999999999"
            parser={(val) => parseAmount(val, currencyPrecision)}
            allowThousandth
            zeroValueVisibleFlag={
              caclRule === 'Amount' &&
              isUnTaxPriceFlag &&
              form.getFieldValue('netPrice') !== 0 &&
              parseAmount(form?.getFieldValue('currentQuotationPrice'), currencyPrecision) == 0
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
  }

  getRows() {
    const {
      quotationHeader = {},
      organizationId,
      quotationName,
      isUnTaxPriceFlag,
      form,
      form: { getFieldDecorator },
      biddingLine = {},
      formLayout = {},
      isSubmit,
      bargingFlag,
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
      backQuotationLine = noop,
      saveBiddingOffer = noop,
      changeQuantity = noop,
      queryQuotationHeader = noop,
      bidFlag = false,
      remote,
      financialPrecision,
    } = this.props;
    const { tenantId = null } = quotationHeader || {};

    let cuxFreightAmountProps = {};
    cuxFreightAmountProps = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_QUOTATION_FORM_FREIGHT_AMOUNT_PROPS',
          cuxFreightAmountProps,
          {
            that: this,
            form,
            quotationHeader,
          }
        )
      : cuxFreightAmountProps;
    cuxFreightAmountProps = cuxFreightAmountProps || {};

    const rows = [
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          <Form.Item
            label={intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃')}
            name="abandonedFlag"
            {...formLayout}
          >
            {getFieldDecorator('abandonedFlag', {
              initialValue: biddingLine.abandonedFlag,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={
                  biddingLine.quotationScope === 'ALL_QUOTATION' ||
                  biddingLine.eliminateRoundNumber ||
                  biddingLine.quotationLineStatus === 'ABANDONED' ||
                  (biddingLine.bargainFlag === 0 &&
                    biddingLine.bargainStatus === 'BARGAINING_ONLINE')
                }
                onChange={(e) => giveUpQuotationLine(e, biddingLine)}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={8}>{this.getCurrentQuotationPriceNode()}</Col>
        <Col span={8}>
          <Form.Item
            name="netPrice"
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)')}
            {...formLayout}
          >
            {getFieldDecorator('netPrice', {
              initialValue: biddingLine.netPrice,
              rules: [
                {
                  required:
                    !form.getFieldValue('abandonedFlag') &&
                    (!bargingFlag || (isSubmit && bargingFlag)) &&
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
                  form.getFieldValue('abandonedFlag') ||
                  (biddingLine.continuousQuotationFlag === 0 &&
                    biddingLine.currentQuotationPrice &&
                    biddingLine.quotationLineStatus === 'SUBMITTED') ||
                  (biddingLine.bargainFlag === 0 &&
                    biddingLine.bargainStatus === 'BARGAINING_ONLINE') ||
                  !isUnTaxPriceFlag ||
                  biddingLine.priceReadonlyFlag === 1
                }
                onChange={(val) => handleChangeNetPrice(val, biddingLine)}
                // precision={4}
                style={{ width: '98%' }}
                min="0"
                max="99999999999999999999"
                parser={(val) => parseAmount(val, currencyPrecision)}
                allowThousandth
                zeroValueVisibleFlag={
                  caclRule === 'Amount' &&
                  !isUnTaxPriceFlag &&
                  form.getFieldValue('currentQuotationPrice') !== 0 &&
                  // eslint-disable-next-line eqeqeq
                  parseAmount(form.getFieldValue('netPrice'), currencyPrecision) == 0
                }
                taxFlag={!isUnTaxPriceFlag}
                currencyPrecision={currencyPrecision}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )}
          </Form.Item>
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
      </Row>,
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          <Form.Item
            name="taxIncludedFlag"
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税')}
            {...formLayout}
          >
            {getFieldDecorator('taxIncludedFlag', {
              initialValue: biddingLine.taxIncludedFlag,
            })(
              <Checkbox
                disabled={
                  form.getFieldValue('abandonedFlag') === 1 ||
                  biddingLine.taxChangeFlag === 0 ||
                  biddingLine.eliminateRoundNumber
                }
                onChange={(e) => handleChangeTaxIncludedFlag(e, biddingLine)}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="taxId"
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
                    form.getFieldValue('taxIncludedFlag') === 1 &&
                    !biddingLine.eliminateRoundNumber,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`ssrc.supplierQuotation.model.supplierBid.modifyTheRate`)
                      .d('税率(%)'),
                  }),
                },
              ],
            })(
              <Lov
                code="SMDM.TAX"
                style={{ width: '98%' }}
                textValue={biddingLine.taxRate}
                textField="taxRate"
                disabled={
                  biddingLine.taxChangeFlag === 0 ||
                  // biddingLine.taxIncludedFlag === 0 ||
                  form.getFieldValue('abandonedFlag') === 1 ||
                  form.getFieldValue('taxIncludedFlag') === 0 ||
                  biddingLine.eliminateRoundNumber
                }
                onChange={(value, dataList) => changeTaxId(value, dataList, biddingLine)}
                queryParams={{
                  organizationId: getCurrentTenant().tenantId,
                  tenantId,
                }}
              />
            )}
            {getFieldDecorator('taxRate', { initialValue: biddingLine.taxRate })}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="origin"
            label={intl.get('ssrc.common.productionPlace').d('产地')}
            {...formLayout}
          >
            {getFieldDecorator('origin', {
              initialValue: biddingLine.origin,
            })(<Input disabled={form.getFieldValue('abandonedFlag') === 1} />)}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          {biddingLine.validDateInputType !== 'READONLY' ? (
            <Form.Item
              name="currentExpiryDateFrom"
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
                      biddingLine.validDateInputType === 'REQUIRED' &&
                      !biddingLine.eliminateRoundNumber,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.quotatDateFrom`)
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
                    form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
                  }
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
              name="currentExpiryDateFrom"
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
              name="currentExpiryDateTo"
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.quotationDateTo`)
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
                      biddingLine.validDateInputType === 'REQUIRED' &&
                      !biddingLine.eliminateRoundNumber,
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
                    form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
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
              name="currentExpiryDateTo"
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
            name="quotationDetailFlag"
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细')}
            {...formLayout}
          >
            {getFieldDecorator('quotationDetailFlag', {
              initialValue: biddingLine.quotationDetailFlag,
            })(
              <>
                <QuotationDetailModal
                  rowData={biddingLine}
                  sourceFrom="RFX"
                  bidFlag={bidFlag}
                  quotationStatus={quotationHeader.quotationStatus}
                  continuousQuotationFlag={quotationHeader.continuousQuotationFlag}
                  disabled={form.getFieldValue('abandonedFlag') || biddingLine.eliminateRoundNumber}
                  detailFrom="SUP_QUOTATION"
                  onBeforeOpen={() => saveBiddingOffer()} // 报价明细保存或取消后保存头行数据（解决用户未保存数据点报价明细后数据被清空）
                  onOk={() => {
                    const { quotationLineId = null } = currentRecord || {};
                    queryQuotationHeader();
                    queryBiddingQuotationLine(
                      {},
                      {
                        quotationLineIds: quotationLineId,
                      }
                    );
                  }}
                  onCancel={() => {
                    const { quotationLineId = null } = currentRecord || {};
                    queryQuotationHeader();
                    queryBiddingQuotationLine(
                      {},
                      {
                        quotationLineIds: quotationLineId,
                      }
                    );
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
      </Row>,
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          <Form.Item
            name="currentQuotationQuantity"
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量')}
            {...formLayout}
          >
            {getFieldDecorator('currentQuotationQuantity', {
              rules: [
                {
                  required:
                    biddingLine.quantityChangeFlag === 1 &&
                    form.getFieldValue('abandonedFlag') === 0 &&
                    !biddingLine.eliminateRoundNumber,
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
                  biddingLine.eliminateRoundNumber
                }
                style={{ width: '98%' }}
                // precision={2}
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
            name="ladderInquiryFlag"
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
                  form.getFieldValue('abandonedFlag') === 1 ||
                  biddingLine.eliminateRoundNumber
                }
              />
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="ladderQuotation"
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.ladderLevel`).d('阶梯报价')}
            {...formLayout}
          >
            {getFieldDecorator('ladderQuotation')(
              <>
                {form.getFieldValue('ladderInquiryFlag') === 1 &&
                form.getFieldValue('abandonedFlag') !== 1 &&
                !biddingLine.eliminateRoundNumber ? (
                  <a
                    onClick={() => openLadder(biddingLine)}
                    disabled={
                      form.getFieldValue('ladderInquiryFlag') !== 1 ||
                      form.getFieldValue('abandonedFlag') !== 0 ||
                      biddingLine.eliminateRoundNumber
                    }
                  >
                    {intl
                      .get(`ssrc.supplierQuotation.view.message.button.ladderLevel`)
                      .d('阶梯报价')}
                  </a>
                ) : (
                  ''
                )}
                {biddingLine.ladderInquiryRequire === 1 &&
                  form?.getFieldValue('abandonedFlag') !== 1 && (
                    <Badge style={{ marginLeft: '2px' }} status="error" />
                  )}
              </>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="currentQuotationRemark"
            label={intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationDescription`, {
                quotationName,
              })
              .d('{quotationName}说明')}
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
                  form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
                }
                trim
              />
            )}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          <Form.Item
            name="freightIncludedFlag"
            label={intl.get(`ssrc.supplierQuotation.model.supQuo.includingFreight`).d('是否含运费')}
            {...formLayout}
          >
            {getFieldDecorator('freightIncludedFlag', {
              initialValue: biddingLine.freightIncludedFlag,
            })(
              <Checkbox
                disabled={
                  quotationHeader.freightUpdatableFlag === 0 ||
                  form.getFieldValue('abandonedFlag') === 1 ||
                  biddingLine.eliminateRoundNumber
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
            name="freightAmount"
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
                  form.getFieldValue('freightIncludedFlag') === 1 ||
                  biddingLine.eliminateRoundNumber
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
            name="currentPromisedDate"
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
                  form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
                }
              />
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="currentDeliveryCycle"
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
                  form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
                }
              />
            )}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          <Form.Item
            name="minPurchaseQuantity"
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
                  form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
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
        <Col span={8}>
          <Form.Item
            name="minPackageQuantity"
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
                  form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
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
      </Row>,
      <Row gutter={32} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Col span={8}>
          <Form.Item
            name="backQuotation"
            label={intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonBackQuotation`, {
                quotationName,
              })
              .d('收回{quotationName}')}
            {...formLayout}
          >
            {getFieldDecorator('backQuotation')(
              <a
                onClick={() => backQuotationLine(biddingLine)}
                disabled={
                  biddingLine.sealedQuotationFlag !== 1 ||
                  biddingLine.quotationLineStatus !== 'SUBMITTED' ||
                  biddingLine.eliminateRoundNumber
                }
              >
                {intl.get(`ssrc.supplierQuotation.view.message.button.takeBack`).d('收回')}
              </a>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="currentAttachmentUuid"
            label={intl
              .get(`ssrc.supplierQuotation.model.supQuo.supplierLineAttachment`)
              .d('供应商行附件')}
            {...formLayout}
          >
            {getFieldDecorator('currentAttachmentUuid', {
              initialValue: biddingLine.currentAttachmentUuid,
            })(
              <Upload
                filePreview
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-quotationline"
                attachmentUUID={biddingLine.currentAttachmentUuid}
                tenantId={organizationId}
                viewOnly={
                  form.getFieldValue('abandonedFlag') === 1 || biddingLine.eliminateRoundNumber
                }
                {...ChunkUploadProps}
              />
            )}
          </Form.Item>
        </Col>
      </Row>,
    ];

    const fields = remote
      ? remote.process('SSRC_SUPPLIER_QUOTATION.LINE_FORM_FIELDS', rows, { that: this })
      : rows;

    return fields || [];
  }

  render() {
    const { customizeForm = noop, form, custkey, biddingLine = {} } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: `SSRC.${custkey}SUPPLIER_QUOTATION.LINE_FORM`,
            form,
            dataSource: biddingLine,
          },
          <Form key={biddingLine?.quotationLineId}>{this.getRows()}</Form>
        )}
      </div>
    );
  }
}

const hocComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(Com);
};

export default hocComponent(QuotationFrom);
export { QuotationFrom as QuotationForm, hocComponent };
