import React, { Component } from 'react';
import {
  Form,
  Output,
  DataSet,
  Button,
  CheckBox,
  Lov,
  DatePicker,
  NumberField,
} from 'choerodon-ui/pro';
import { Popover, Icon, Text, Tooltip } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { noop, isNil } from 'lodash';
// import { Throttle } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { warningDataSet } from '../Stores/formDS';
import WarningPrice from './WarningPrice';
import SupplierHeaderBaseInfoLink from './SupplierHeaderBaseInfoLink';

import TotalPriceLineTable from './TotalPriceTable';
import { Status, BidPrice, CurrencyPrice, RankTrenkRender, TrafficLight } from '../../components';
import { priceCompareText } from '../../utils/renders';

import Styles from './index.less';

@observer
class QuotationDetail extends Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }

    this.warningDS = new DataSet(warningDataSet()); // 警戒价ds
    this.detailLoading = false;

    this.state = {
      detailLoading: false,
    };
  }

  toggleContentLoading = (detailLoading = false) => {
    this.detailLoading = detailLoading;
    this.setState({
      detailLoading,
    });
  };

  // 数量
  getRfxQuantity = (data) => {
    const { doubleUnitFlag } = this.props;
    const { rfxQuantity, secondaryQuantity } = data || {};

    const currentQuantity = !doubleUnitFlag ? rfxQuantity : secondaryQuantity;
    const formatCurrentQuantity = !isNil(currentQuantity)
      ? numberSeparatorRender(currentQuantity)
      : '';

    return formatCurrentQuantity;
  };

  // unit price 详情
  renderHeaderInfo = () => {
    const { getCustomizeUnitCode, detailViewItemInfoFormDS, customizeCommon } = this.props;
    // const { current } = detailViewFormDS || {};
    // const { itemName = '', specs = '', secondaryQuantity, rfxQuantity } = current
    //   ? current.get(['itemName', 'specs', 'secondaryQuantity', 'rfxQuantity'])
    //   : {};

    // const formatCurrentQuantity = this.getRfxQuantity({ rfxQuantity, secondaryQuantity });

    const field = detailViewItemInfoFormDS.getField('rfxQuantity');
    const fieldLabel = field.get('label', detailViewItemInfoFormDS.current);

    const fieldsConfig = {
      rfxQuantity: {
        label: fieldLabel,
        useLabel: true,
        // label: intl.get("ssrc.inquiryHall.model.inquiryHall.rfxQuantity").d('需求数量'),
        render: ({ record }) => {
          const { secondaryQuantity, rfxQuantity } = record
            ? record.get(['secondaryQuantity', 'rfxQuantity'])
            : {};

          const formatCurrentQuantity = this.getRfxQuantity({ rfxQuantity, secondaryQuantity });

          return (
            <>
              {fieldLabel}：{formatCurrentQuantity}
            </>
          );
        },
      },
    };

    return (
      <div className={Styles['quotation-detail-header-wrap']}>
        {customizeCommon(
          {
            code: getCustomizeUnitCode('unitPriceDetailItemViewForm'),
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            dataSet={detailViewItemInfoFormDS}
            titleField="itemName"
            normalFields={['specs', 'rfxQuantity']}
            fieldsConfig={fieldsConfig}
          />
        )}
      </div>
    );
  };

  renderHeaderBaseInfo = (data = {}) => {
    const {
      getCustomizeUnitCode,
      customizeForm,
      afterSaveBaseInfoFetchHeader,
      headerInfo,
      getHeaderBasicInfoModalReadOnlyFlag,
      customizeBtnGroup,
      headerBasicInfoDS,
      headerBasicInfoDetailDS,
      fetchBasicInfoHeader,
      getBasicInfoCustomizeCode,
      beforeOpenHeaderBaseInfoModal,
      afterCloseHeaderBaseInfoModal,
      remote,
    } = this.props;
    const { biddingSceneFlag } = data || {};
    if (!biddingSceneFlag) {
      return '';
    }

    const disabledAllFields = getHeaderBasicInfoModalReadOnlyFlag();

    const currentProps = {
      getCustomizeUnitCode,
      customizeForm,
      afterSaveBaseInfoFetchHeader,
      disabledAllFields,
      headerInfo,
      customizeBtnGroup,
      headerBasicInfoDS,
      headerBasicInfoDetailDS,
      fetchBasicInfoHeader,
      getBasicInfoCustomizeCode,
      beforeOpenHeaderBaseInfoModal,
      afterCloseHeaderBaseInfoModal,
      getHeaderBasicInfoModalReadOnlyFlag,
      remote,
    };

    return (
      <span>
        <SupplierHeaderBaseInfoLink {...currentProps} />
      </span>
    );
  };

  // total price 主内容标题
  renderTotalPriceHeaderInfo = () => {
    const { detailViewFormDS } = this.props;
    const { current } = detailViewFormDS || {};
    const { itemName = '', rfxLineItemCount = 0 } = current
      ? current.get(['itemName', 'rfxLineItemCount'])
      : {};

    if (!itemName) {
      return '';
    }

    const renderItemAndWarning = (
      <span>
        {itemName || ''}
        {itemName && rfxLineItemCount > 1
          ? intl
              .get('ssrc.biddingHall.view.title.andMoreThanOneItemInfos', {
                count: rfxLineItemCount,
              })
              .d('等{count}个标的')
          : ''}
      </span>
    );

    return (
      <div className={Styles['quotation-detail-header-wrap']}>
        <div className={Styles['detail-title']}>
          <Popover content={renderItemAndWarning}>{renderItemAndWarning}</Popover>
          <span>
            {this.renderHeaderBaseInfo({
              biddingSceneFlag: 1,
            })}
          </span>
        </div>
      </div>
    );
  };

  /**
   * HIDE_IDENTITY_HIDE_QUOTE	隐藏身份隐藏报价
    HIDE_IDENTITY_OPEN_QUOTE	隐藏身份公开报价
    OPEN_IDENTITY_HIDE_QUOTE	公开身份隐藏报价
    OPEN_IDENTITY_OPEN_QUOTE  公开身份公开报价

    1.展示逻辑：根据竞价方式判断。
    1）当竞价方式为竞价，数据公开规则为隐藏身份隐藏报价/公开身份隐藏报价，不展示该字段；数据公开规则为公开身份公开报价/隐藏身份公开报价，展示该字段，展示名称【最低价】
    2）当竞价方式为拍卖时，数据公开规则为隐藏身份隐藏报价/公开身份隐藏报价，不展示该字段；数据公开规则为公开身份公开报价/隐藏身份公开报价，展示该字段，展示名称为最高价；
  */
  renderLowestPriceField = () => {
    const { headerInfo = {}, remote } = this.props;
    const { openRule, currencySymbol, isBritishBidTrafficLight } = headerInfo || {};
    if (!openRule || isBritishBidTrafficLight === 1) {
      return '';
    }

    const outRemoteProps = remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_QUOTATION_FORM_ITEM_PROPS',
          {},
          { headerInfo }
        )
      : {};

    return (
      <Output
        name="lowestQuotationPrice"
        renderer={({ record }) => {
          const { lowestQuotationPrice, lowestDisplaySupplierName } =
            record?.get(['lowestQuotationPrice', 'lowestDisplaySupplierName']) || {};
          const currency = currencySymbol ?? '';

          // if (isNil(lowestQuotationPrice)) {
          //   return;
          // }
          const lowestPriceValueFlag = !isNil(lowestQuotationPrice);

          const price = !isNil(lowestQuotationPrice)
            ? numberSeparatorRender(lowestQuotationPrice)
            : '';

          return (
            <div className={Styles['detail-header-form-lowest-wrap']}>
              {lowestPriceValueFlag ? (
                <div
                  className={`${Styles['detail-header-form-lowest-values']} detail-header-form-lowest-values-value`}
                >
                  <Popover content={<CurrencyPrice currencySymbol={currency} price={price} />}>
                    <CurrencyPrice currencySymbol={currency} price={price} />
                  </Popover>
                </div>
              ) : (
                '-'
              )}
              {lowestDisplaySupplierName ? <div className={Styles['divide-line-vertical']} /> : ''}
              {lowestDisplaySupplierName ? (
                <span
                  className={`${Styles['detail-header-form-lowest-supplier-name']} detail-header-form-lowest-supplier-name-val`}
                >
                  <Popover content={lowestDisplaySupplierName} placement="bottomLeft">
                    {lowestDisplaySupplierName}
                  </Popover>
                </span>
              ) : (
                ''
              )}
            </div>
          );
        }}
        {...outRemoteProps}
      />
    );
  };

  // 起竞价
  renderStartBiddingPrice = ({ value }) => {
    const { headerInfo = {} } = this.props;
    const { displayBiddingSupHeaderStatus, supplierStatus, currencySymbol } = headerInfo || {};

    // const { startingBiddingPrice, } = record?.get([
    //   'startingBiddingPrice',
    //   'trialStartingBiddingPrice',
    // ]) || {};
    const redFlag =
      displayBiddingSupHeaderStatus === 'NOT_START' || displayBiddingSupHeaderStatus === 'SIGN_IN';

    // 禁止报价
    const ProhibitFlag = supplierStatus === 'PROHIBIT_QUOTATION';

    if (ProhibitFlag) {
      return;
    }

    const currentStartingPrice = value;

    if (isNil(currentStartingPrice)) {
      return '-';
    }

    const price = numberSeparatorRender(currentStartingPrice);

    return (
      <span
        className={classnames(Styles['detail-form-start-bidding-price'], {
          [Styles['detail-form-red-price-value']]: redFlag,
        })}
      >
        <span>
          <Popover content={<CurrencyPrice currencySymbol={currencySymbol} price={price} />}>
            <CurrencyPrice currencySymbol={currencySymbol} price={price} />
          </Popover>
        </span>
      </span>
    );
  };

  renderStartBiddingPriceTrial = ({ record }) => {
    const { headerInfo = {} } = this.props;
    const { trialBiddingQueryFlag } = headerInfo || {};

    if (!record || !trialBiddingQueryFlag) {
      return '';
    }

    const { trialStartingBiddingPrice } = record.get(['trialStartingBiddingPrice']);

    return this.renderStartBiddingPrice({ record, value: trialStartingBiddingPrice });
  };

  renderQuotationRangeTrial = ({ record }) => {
    const { headerInfo = {} } = this.props;
    const { trialBiddingQueryFlag } = headerInfo || {};

    if (!record || !trialBiddingQueryFlag) {
      return '';
    }

    const { biddingTrialQuotationRange } = record.get(['biddingTrialQuotationRange']);

    return this.renderQuotationRange({ record, value: biddingTrialQuotationRange });
  };

  // 报价范围
  renderQuotationRange = ({ value, record }) => {
    if (!record) {
      return '';
    }

    const { floatType } = record.get(['floatType']);

    const currentQuotationRange = value;

    if (isNil(currentQuotationRange)) {
      return '-';
    }

    let currentQuotationRangeValue = numberSeparatorRender(currentQuotationRange);
    if (floatType === 'ratio') {
      currentQuotationRangeValue += '%';
    }

    return (
      <span className={Styles['detail-form-quotation-range']}>
        <Popover content={currentQuotationRangeValue}>{currentQuotationRangeValue}</Popover>
      </span>
    );
  };

  // 行不可编辑
  judgeLineDisabledFlag = () => {
    const { detailViewFormDS } = this.props;
    if (!detailViewFormDS) {
      return;
    }
    const headerRecordData = detailViewFormDS.getState('headerRecordData') || {};
    const { displayBiddingSupLineStatus } = headerRecordData || {};
    const lineDisabledFlag =
      displayBiddingSupLineStatus && displayBiddingSupLineStatus !== 'IN_PROGRESS';
    return lineDisabledFlag;
  };

  // 改变是否含税标识
  handleChangeTaxFlag = (val) => {
    const { detailViewFormDS, unitPriceAfterQuotatedPriceCalc = noop } = this.props;
    if (!detailViewFormDS || !detailViewFormDS.current) {
      return;
    }
    const { current: record } = detailViewFormDS || {};
    if (!val) {
      record.set('taxId', null);
      record.set('taxRate', null);
    }
    unitPriceAfterQuotatedPriceCalc({ record });
  };

  // 改变税率
  changeTax = (data) => {
    const { detailViewFormDS, unitPriceAfterQuotatedPriceCalc = noop } = this.props;
    if (!detailViewFormDS || !detailViewFormDS.current) {
      return;
    }
    const { current: record } = detailViewFormDS || {};
    const { taxRate = null, taxId = null } = data || {};
    record.set('taxId', { ...(data || {}), taxId, taxRate });
    unitPriceAfterQuotatedPriceCalc({ record });
  };

  // 数量
  changeQuantity = async () => {
    const { detailViewFormDS, unitPriceAfterQuotatedPriceCalc = noop } = this.props;
    if (!detailViewFormDS || !detailViewFormDS.current) {
      return;
    }
    const { current: record } = detailViewFormDS || {};
    const { handleChangeQuotationQuantity } = this.props;
    await handleChangeQuotationQuantity({ record });
    await unitPriceAfterQuotatedPriceCalc({ record });
  };

  // 总价必输-金额变更后，两个金额一样
  totalPriceCalcAfterChange = ({ record }) => {
    const { getTaxOrUntax } = this.props;
    const { qtnTotalAmount, qtnNetAmount } = record.get(['qtnTotalAmount', 'qtnNetAmount']);

    const taxFlag = getTaxOrUntax();

    let currentValue = qtnTotalAmount;
    if (!taxFlag) {
      currentValue = qtnNetAmount;
    }

    record.set({
      qtnTotalAmount: currentValue,
      qtnNetAmount: currentValue,
    });
  };

  renderQuotationForm = (options = {}) => {
    const {
      detailViewFormDS,
      submitQuotationPrice,
      pageReadOnlyFlag = 0,
      headerInfo = {},
      headerDS,
      customizeForm,
      getCustomizeUnitCode,
      // totalPriceFlag = 0,
      pageLoading,
      pageOperationLoading,
      remote,
      getCurrentStageBiddingRemainQuotationCount = noop,
      quotationInputAutoCalculateFlag = 1,
      unitPriceAfterQuotatedPriceCalc = noop,
    } = this.props;
    const {
      benchmarkPriceType,
      currencySymbol,
      defaultPrecision,
      supplierStatus,
      biddingPausedRealTimeStatus,
      tenantId = null,
      isBritishBidTrafficLight,
    } = headerInfo || {};
    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE'; // 含税标识
    const { columns = 1 } = options || {};

    const { current: formCurrent } = detailViewFormDS || {};

    if (!formCurrent) {
      return '';
    }

    const currentStageBiddingRemainQuotationCount = getCurrentStageBiddingRemainQuotationCount({
      record: formCurrent,
    });

    const headerRecordData = detailViewFormDS.getState('headerRecordData') || {};
    const { displayBiddingSupLineStatus } = headerRecordData || {};
    const notStartFlag =
      displayBiddingSupLineStatus === 'NOT_START' ||
      displayBiddingSupLineStatus === 'SIGN_IN' ||
      biddingPausedRealTimeStatus === 'NOT_START' ||
      biddingPausedRealTimeStatus === 'SIGN_IN';
    const lineDisabledFlag = this.judgeLineDisabledFlag();
    const bidPriceShowFlag =
      displayBiddingSupLineStatus !== 'NOT_START' &&
      displayBiddingSupLineStatus !== 'SIGN_IN' &&
      displayBiddingSupLineStatus !== 'BIDDING_END' &&
      displayBiddingSupLineStatus !== 'PAUSED' &&
      displayBiddingSupLineStatus !== 'CLOSED' &&
      supplierStatus !== 'PROHIBIT_QUOTATION';
    const pausedFlag = displayBiddingSupLineStatus === 'PAUSED';

    const submitVisibleFlag = !pageReadOnlyFlag && formCurrent && !lineDisabledFlag && !pausedFlag;
    // 起竞价显示
    const startingBiddingPriceVisible = isBritishBidTrafficLight !== 1;

    // 2023-10-18：标准精度埋点
    const remoteDefaultPrecision = remote
      ? remote.process('SSRC_SUPPLIER_BIDDINGHALL_PROCESS_DEFAULT_PRECISION', defaultPrecision, {
          detailViewFormDS,
          headerInfo,
        })
      : defaultPrecision;

    const PriceCommonProps = {
      record: formCurrent,
      pageReadOnlyFlag,
      headerInfo,
      headerDS,
      // disabledSubmitFlag: lineDisabledFlag,
      detailViewFormDS,
      currentPrecision: remoteDefaultPrecision,
      newLine: true,
      placeholder: intl.get('ssrc.common.unitPrice').d('单价'),
      changePriceCancelCalculateFlag: quotationInputAutoCalculateFlag !== 1 ? 1 : 0,
      afterQuotatedPriceCalc: unitPriceAfterQuotatedPriceCalc,
    };

    const outRemoteProps = remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_QUOTATION_FORM_ITEM_PROPS',
          {},
          { headerInfo }
        )
      : {};

    return (
      <div
        className={classnames(Styles['detail-header-form-wrap'], 'detail-header-form-wrap-form')}
      >
        {this.renderWarning()}

        {customizeForm(
          {
            code: getCustomizeUnitCode('unitPriceDetailViewForm'),
            dataSet: detailViewFormDS,
            disableMaxCol: true,
          },
          <Form dataSet={detailViewFormDS} columns={columns} labelAlign="left" useColon={false}>
            {startingBiddingPriceVisible ? (
              <Output
                name="startingBiddingPrice"
                renderer={({ record }) => {
                  const { startingBiddingPrice } = record?.get(['startingBiddingPrice']) || {};

                  if (isNil(startingBiddingPrice)) {
                    return;
                  }

                  const price = numberSeparatorRender(startingBiddingPrice);

                  return (
                    <span className={Styles['detail-form-start-bidding-price']}>
                      <Popover
                        content={<CurrencyPrice currencySymbol={currencySymbol} price={price} />}
                      >
                        <CurrencyPrice currencySymbol={currencySymbol} price={price} />
                      </Popover>
                    </span>
                  );
                }}
                {...outRemoteProps}
              />
            ) : (
              ''
            )}
            <Output name="quotationRange" renderer={this.renderQuotationRange} />
            {!notStartFlag ? this.renderLowestPriceField() : ''}
            {!notStartFlag ? (
              <Output
                name="biddingQuotationRank"
                renderer={({ record }) => {
                  const { biddingQuotationRank, displayQuotationPrice } =
                    record?.get(['biddingQuotationRank', 'displayQuotationPrice']) || {};
                  if (isNil(biddingQuotationRank)) {
                    return '';
                  }

                  const price = !isNil(displayQuotationPrice)
                    ? numberSeparatorRender(displayQuotationPrice)
                    : '';

                  // 排名node
                  const rankNode =
                    isBritishBidTrafficLight !== 1 ? (
                      <>
                        <div
                          className={`${Styles['detail-header-form-rank-quotation-values']} detail-header-form-rank-quotation-values-val`}
                        >
                          {intl
                            .get('ssrc.inquiryHall.model.inquiryHall.theRankLevel', {
                              rank: biddingQuotationRank,
                            })
                            .d('第{rank}名')}
                          <RankTrenkRender record={formCurrent} />
                        </div>
                        <div className={Styles['divide-line-vertical']} />
                      </>
                    ) : (
                      ''
                    );

                  return (
                    <div className={Styles['detail-header-form-rank-quotation-wrap']}>
                      {remote
                        ? remote.render(
                            'SSRC_SUPPLIER_BIDDINGHALL_RENDER_QUOTATION_DETAIL_FORM_RANK_NODE',
                            rankNode,
                            {
                              detailViewFormDS,
                            }
                          )
                        : rankNode}
                      <div
                        className={`${Styles['detail-header-form-rank-quotation-values-supplier-name']} detail-header-form-rank-quotation-values-supplier-name-val`}
                      >
                        <Popover
                          content={<CurrencyPrice currencySymbol={currencySymbol} price={price} />}
                        >
                          <TrafficLight record={record} />
                          <CurrencyPrice currencySymbol={currencySymbol} price={price} />
                        </Popover>
                      </div>
                    </div>
                  );
                }}
                {...outRemoteProps}
              />
            ) : (
              ''
            )}

            {bidPriceShowFlag ? (
              taxFlag ? (
                <BidPrice
                  name="currentQuotationSecPrice"
                  validField="validQuotationSecPrice"
                  {...PriceCommonProps}
                />
              ) : (
                <BidPrice
                  name="netSecondaryPrice"
                  validField="validNetSecondaryPrice"
                  {...PriceCommonProps}
                />
              )
            ) : (
              ''
            )}
            <CheckBox name="taxIncludedFlag" onChange={this.handleChangeTaxFlag} />
            <Lov name="taxId" style={{ width: '39%' }} onChange={this.changeTax} />
            <C7nPrecisionInputNumber
              name="currentQuotationSecQuantity"
              record={formCurrent}
              uom="secondaryUomId"
              onChange={this.changeQuantity}
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
            {bidPriceShowFlag ? <DatePicker name="currentExpiryDateFrom" /> : ''}
            {bidPriceShowFlag ? <DatePicker name="currentExpiryDateTo" /> : ''}
            <Output name="priceBatchQuantity" showHelp="label" />
          </Form>
        )}

        {!notStartFlag ? (
          <div className={Styles['detail-header-form-below-wrap']}>
            {this.renderPriceValidateMessage({
              iconFlag: 1,
            })}
            {submitVisibleFlag ? (
              <div>
                <Button
                  color="primary"
                  loading={pageLoading || pageOperationLoading}
                  onClick={submitQuotationPrice}
                  className={Styles['quotation-price-btn']}
                  disabled={currentStageBiddingRemainQuotationCount === 0}
                >
                  {intl.get('ssrc.biddingHall.view.title.quotationPriceImmediately').d('立即出价')}
                </Button>
              </div>
            ) : (
              ''
            )}

            {this.renderReminQuotationCount()}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  // total amount price
  renderTotalAmountQuotationForm = (options = {}) => {
    const {
      remote,
      detailViewFormDS,
      submitQuotationPrice,
      pageReadOnlyFlag = 0,
      headerInfo = {},
      headerDS,
      customizeForm,
      getCustomizeUnitCode,
      totalPriceFlag = 0,
      pageLoading,
      pageOperationLoading,
      supplementUnitPriceFlag,
      getCurrentStageBiddingRemainQuotationCount = noop,
      quotationInputAutoCalculateFlag = 1,
      japanDutchTotalPrice,
      japanBiddingTotalPrice = noop,
      biddingSupplierEliminate = noop,
      dutchBiddingTotalPrice = noop,
    } = this.props;
    const {
      benchmarkPriceType,
      biddingTotalPricePrinciple,
      currencySymbol,
      financialPrecision,
      supplierStatus,
      biddingPausedRealTimeStatus,
      isBritishBidTrafficLight,
      trialBiddingQueryFlag,
    } = headerInfo || {};
    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
    const { customizeUnitCodeName = 'totalPriceDetailViewForm', columns = 2 } = options || {};
    const { current: formCurrent } = detailViewFormDS || {};
    if (!formCurrent) {
      return '';
    }

    const japanTotalBidding = japanBiddingTotalPrice();

    const currentStageBiddingRemainQuotationCount = getCurrentStageBiddingRemainQuotationCount({
      record: formCurrent,
    });

    const {
      displayBiddingSupHeaderStatus,
      biddingSupplementPriceRunningFlag,
      selfCurrentBiddingRoundAcceptFlag,
      biddingRoundSupplierStatus,
      biddingEliminateRoundNumber,
    } = formCurrent
      ? formCurrent.get([
          'displayBiddingSupHeaderStatus',
          'biddingSupplementPriceRunningFlag',
          'selfCurrentBiddingRoundAcceptFlag',
          'biddingRoundSupplierStatus',
          'biddingEliminateRoundNumber',
        ])
      : {};

    const PriceCommonProps = {
      record: formCurrent,
      pageReadOnlyFlag,
      headerInfo,
      headerDS,
      // disabledSubmitFlag: supplementUnitPriceFlag,
      currentPrecision: financialPrecision,
      totalPriceFlag,
      newLine: true,
      placeholder: intl.get('ssrc.biddingHall.model.biddingRecord.totalPrice').d('总价'),
      changePriceCancelCalculateFlag: quotationInputAutoCalculateFlag === 1 ? 0 : 1,
      afterQuotatedPriceCalc: this.totalPriceCalcAfterChange,
    };

    // 禁止报价
    const ProhibitFlag = supplierStatus === 'PROHIBIT_QUOTATION';
    const eliminateStatus = biddingSupplierEliminate();

    const pausedFlag = displayBiddingSupHeaderStatus === 'PAUSED';
    const totalPriceRequired =
      biddingTotalPricePrinciple &&
      biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' &&
      displayBiddingSupHeaderStatus;
    const notStartFlag =
      displayBiddingSupHeaderStatus === 'NOT_START' ||
      displayBiddingSupHeaderStatus === 'SIGN_IN' ||
      biddingPausedRealTimeStatus === 'NOT_START' ||
      biddingPausedRealTimeStatus === 'SIGN_IN';
    const bidPriceShowFlag =
      displayBiddingSupHeaderStatus !== 'NOT_START' &&
      displayBiddingSupHeaderStatus !== 'SIGN_IN' &&
      displayBiddingSupHeaderStatus !== 'BIDDING_END' &&
      displayBiddingSupHeaderStatus !== 'PAUSED' &&
      displayBiddingSupHeaderStatus !== 'CLOSED' &&
      displayBiddingSupHeaderStatus !== 'FINISHED' &&
      !ProhibitFlag &&
      biddingSupplementPriceRunningFlag !== 1;

    const submitVisibleFlag = !pausedFlag && !pageReadOnlyFlag;
    // 起竞价显示
    const startingBiddingPriceVisible = isBritishBidTrafficLight !== 1;

    // 接受 按钮 增加气泡，内容和头滚动条内容一致
    let acceptButtonTooltipText = '';
    if (japanTotalBidding) {
      acceptButtonTooltipText = intl
        .get('ssrc.biddingHall.view.title.japanDutchWarningQuotationRuleTextWithEliminateRound', {
          biddingEliminateRoundNumber,
        })
        .d(
          '供应商点击“接受”按钮后有资格进入下一轮竞价环节，若供应商连续在{biddingEliminateRoundNumber}轮竞价过程中未点击“接受”按钮，则视为放弃本次竞价资格。'
        );

      if (isNil(biddingEliminateRoundNumber)) {
        acceptButtonTooltipText = intl
          .get('ssrc.biddingHall.view.title.japanDutchWarningQuotationRuleText')
          .d(
            '供应商点击“接受”按钮后就有资格进入下一轮竞价环节，若未点击“接受”按钮，则视为放弃本次竞价资格。'
          );
      }
    }

    if (dutchBiddingTotalPrice()) {
      acceptButtonTooltipText = intl
        .get('ssrc.biddingHall.view.title.dutchWarningQuotationRuleTextWithEliminateRound', {
          biddingEliminateRoundNumber,
        })
        .d('若点击接受按钮则视为接受当前价格，若其他供应商先接受当前价格，则本次竞价结束。');
    }

    const _detailViewFormProps = {
      dataSet: detailViewFormDS,
      columns,
      labelAlign: 'left',
      useColon: false,
      labelWidth: 120,
    };
    const detailViewFormProps = remote?.process
      ? remote.process(
          'SSRC_SUPPLIER_BIDDINGHALL_QUOTATIONDETAIL_FORM_PROPS',
          _detailViewFormProps,
          { japanBiddingTotalPrice, dutchBiddingTotalPrice }
        )
      : _detailViewFormProps;
    return (
      <div
        className={classnames(
          Styles['detail-header-form-wrap'],
          {
            [Styles['detail-header-form-total-price-wrap']]: totalPriceFlag,
          },
          'detail-header-form-wrap-form'
        )}
      >
        {customizeForm(
          {
            code: getCustomizeUnitCode('totalPriceDetailViewForm') || customizeUnitCodeName,
            dataSet: detailViewFormDS,
            disableMaxCol: true,
          },
          <Form {...detailViewFormProps}>
            {startingBiddingPriceVisible && !trialBiddingQueryFlag ? (
              <Output name="startingBiddingPrice" renderer={this.renderStartBiddingPrice} />
            ) : (
              ''
            )}
            {startingBiddingPriceVisible && trialBiddingQueryFlag ? (
              <Output
                name="trialStartingBiddingPrice"
                renderer={this.renderStartBiddingPriceTrial}
              />
            ) : (
              ''
            )}
            <Output
              name="quotationRange"
              hidden={japanDutchTotalPrice && trialBiddingQueryFlag}
              renderer={this.renderQuotationRange}
            />
            <Output
              name="biddingTrialQuotationRange"
              hidden={!japanDutchTotalPrice || !trialBiddingQueryFlag}
              renderer={this.renderQuotationRangeTrial}
            />
            ,{!notStartFlag && !japanDutchTotalPrice ? this.renderLowestPriceField() : ''}
            {!notStartFlag && !japanDutchTotalPrice ? (
              <Output
                name="biddingQuotationRank"
                renderer={({ record }) => {
                  const { biddingQuotationRank, displayQuotationPrice } =
                    record?.get(['biddingQuotationRank', 'displayQuotationPrice']) || {};
                  if (isNil(biddingQuotationRank)) {
                    return '';
                  }

                  const price = numberSeparatorRender(displayQuotationPrice) ?? '';

                  return (
                    <div className={Styles['detail-header-form-rank-quotation-wrap']}>
                      {isBritishBidTrafficLight !== 1 ? (
                        <>
                          <div
                            className={`${Styles['detail-header-form-rank-quotation-values']} detail-header-form-rank-quotation-values-val`}
                          >
                            {intl
                              .get('ssrc.inquiryHall.model.inquiryHall.theRankLevel', {
                                rank: biddingQuotationRank,
                              })
                              .d('第{rank}名')}

                            <RankTrenkRender record={formCurrent} />
                          </div>
                          <div className={Styles['divide-line-vertical']} />
                        </>
                      ) : (
                        ''
                      )}
                      <div
                        className={classnames(
                          Styles['detail-header-form-rank-quotation-values-supplier-name'],
                          {
                            [Styles[
                              'detail-header-form-rank-quotation-values-supplement-price'
                            ]]: supplementUnitPriceFlag,
                          },
                          'detail-header-form-rank-quotation-values-supplier-name-val'
                        )}
                      >
                        <TrafficLight record={record} />
                        <CurrencyPrice currencySymbol={currencySymbol} price={price} />
                      </div>
                    </div>
                  );
                }}
              />
            ) : (
              ''
            )}
            {!notStartFlag && japanDutchTotalPrice && !eliminateStatus ? (
              <Output name="currentBiddingRoundNumber" />
            ) : (
              ''
            )}
            {!notStartFlag && japanDutchTotalPrice && !eliminateStatus ? (
              <Output
                name="nextBiddingRoundPrice"
                renderer={({ record }) => {
                  const { nextBiddingRoundPrice } = record?.get(['nextBiddingRoundPrice']) || {};

                  if (isNil(nextBiddingRoundPrice)) {
                    return '-';
                  }

                  const price = numberSeparatorRender(nextBiddingRoundPrice) ?? '';

                  return <CurrencyPrice currencySymbol={currencySymbol} price={price} />;
                }}
              />
            ) : (
              ''
            )}
            {!notStartFlag && japanDutchTotalPrice ? (
              taxFlag ? (
                <Output
                  name="validQtnTotalAmount"
                  renderer={({ record }) => {
                    const { validQtnTotalAmount } = record?.get(['validQtnTotalAmount']) || {};

                    if (isNil(validQtnTotalAmount)) {
                      return '-';
                    }

                    const price = numberSeparatorRender(validQtnTotalAmount) ?? '';

                    return (
                      <span className={Styles['ssrc-bidding-hall-red-price-value']}>
                        <CurrencyPrice currencySymbol={currencySymbol} price={price} />
                      </span>
                    );
                  }}
                />
              ) : (
                <Output
                  name="validQtnNetAmount"
                  renderer={({ record }) => {
                    const { validQtnNetAmount } = record?.get(['validQtnNetAmount']) || {};

                    if (isNil(validQtnNetAmount)) {
                      return '-';
                    }

                    const price = numberSeparatorRender(validQtnNetAmount) ?? '';

                    return (
                      <span className={Styles['ssrc-bidding-hall-red-price-value']}>
                        <CurrencyPrice currencySymbol={currencySymbol} price={price} />
                      </span>
                    );
                  }}
                />
              )
            ) : (
              ''
            )}
            {!notStartFlag && japanDutchTotalPrice && !eliminateStatus ? (
              <NumberField
                name="currentBiddingRoundPrice"
                prefix={currencySymbol}
                style={{ width: '240px' }}
                className="ssrc-bidding-hall-quotation-bidding-round-price-input"
              />
            ) : (
              ''
            )}
            {/* british */}
            {bidPriceShowFlag && totalPriceRequired && !japanDutchTotalPrice ? (
              taxFlag ? (
                <BidPrice
                  name="qtnTotalAmount"
                  validField="validQtnTotalAmount"
                  {...PriceCommonProps}
                />
              ) : (
                <BidPrice
                  name="qtnNetAmount"
                  validField="validQtnNetAmount"
                  {...PriceCommonProps}
                />
              )
            ) : (
              ''
            )}
          </Form>
        )}

        {!notStartFlag &&
        !supplementUnitPriceFlag &&
        totalPriceRequired &&
        !japanDutchTotalPrice ? (
          <div
            className={classnames(
              Styles['detail-header-form-below-wrap'],
              Styles['detail-header-form-below-total-button-wrap']
            )}
          >
            {this.renderPriceValidateMessage({ iconFlag: 1 })}
            {submitVisibleFlag ? (
              <Button
                color="primary"
                loading={pageLoading || pageOperationLoading}
                onClick={submitQuotationPrice}
                className={Styles['quotation-price-btn']}
                disabled={currentStageBiddingRemainQuotationCount === 0}
              >
                {intl.get('ssrc.biddingHall.view.title.quotationPriceImmediately').d('立即出价')}
              </Button>
            ) : (
              ''
            )}

            {this.renderReminQuotationCount()}
          </div>
        ) : (
          ''
        )}

        {!notStartFlag && !supplementUnitPriceFlag && totalPriceRequired && japanDutchTotalPrice ? (
          <div
            className={classnames(
              Styles['detail-header-form-below-wrap'],
              Styles['detail-header-form-below-total-button-wrap']
            )}
          >
            {submitVisibleFlag ? (
              <Tooltip title={acceptButtonTooltipText} placement="right">
                <Button
                  color="primary"
                  loading={pageLoading || pageOperationLoading}
                  onClick={submitQuotationPrice}
                  className={Styles['quotation-price-btn']}
                  disabled={
                    selfCurrentBiddingRoundAcceptFlag === 1 ||
                    biddingRoundSupplierStatus === 'ACCEPTED' ||
                    biddingRoundSupplierStatus === 'ELIMINATE'
                  }
                >
                  {intl.get('ssrc.biddingHall.view.title.supplierAcceptPrice').d('接受')}
                </Button>
              </Tooltip>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        {remote.process
          ? remote.process('SSRC_SUPPLIER_BIDDINGHALL_QUOTATIONDETAIL_FORM_FOOTER', null, {
              japanBiddingTotalPrice,
              dutchBiddingTotalPrice,
              acceptButtonTooltipText,
            })
          : null}
      </div>
    );
  };

  renderPriceValidateMessage = (otherProps) => {
    const { detailViewFormDS, headerInfo, pageReadOnlyFlag, totalPriceFlag, remote } = this.props;
    const { iconFlag = 1 } = otherProps || {};
    const { benchmarkPriceType, biddingQuotationMethod } = headerInfo || {};
    const currentFormRecord = detailViewFormDS?.current;
    const {
      currentQuotationSecPrice,
      netSecondaryPrice,
      startingBiddingPrice,
      // safePrice,
      qtnTotalAmount,
      qtnNetAmount,
      // displayQuotationPrice,
    } = currentFormRecord
      ? currentFormRecord.get([
          'currentQuotationSecPrice',
          'netSecondaryPrice',
          'startingBiddingPrice',
          // 'safePrice',
          'qtnTotalAmount',
          'qtnNetAmount',
          // 'displayQuotationPrice',
        ])
      : {};

    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
    let price = currentQuotationSecPrice; // 含税
    if (!taxFlag) {
      price = netSecondaryPrice;
    }

    if (totalPriceFlag) {
      price = qtnTotalAmount; // 含税
      if (!taxFlag) {
        price = qtnNetAmount;
      }
    }

    if (pageReadOnlyFlag || isNil(price) || isNil(startingBiddingPrice)) {
      return '';
    }

    const biddingPriceValidate =
      biddingQuotationMethod === 'BIDDING' && math.gt(price, startingBiddingPrice);
    const auctionPriceValidate =
      biddingQuotationMethod === 'AUCTION' && math.lt(price, startingBiddingPrice);

    // const biddingSafePriceValidate = math.lt(displayQuotationPrice, safePrice);
    // const auctionSafePriceValidate = math.gt(displayQuotationPrice, safePrice);

    const priceCompareTextProps = {
      biddingPriceValidate,
      auctionPriceValidate,
      biddingQuotationMethod,
      // biddingSafePriceValidate,
      // auctionSafePriceValidate,
    };

    /**
     * 标准埋点，获取二开埋点的参数
     * @protected 捷泰科技
     * src-32218需求中的一点改动了auctionPriceValidate字段
     */
    const remotePriceCompareTextProps = remote
      ? remote.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_PRICE_COMPARE_TEXT_PROPS',
          priceCompareTextProps,
          {
            headerInfo,
          }
        )
      : priceCompareTextProps;

    const text = priceCompareText(remotePriceCompareTextProps);

    if (!text) {
      return '';
    }

    return (
      <div className={Styles['price-below-start-bidding-priceWrap']}>
        {iconFlag ? <Icon type="info" style={{ marginRight: '8px', fontSize: '14px' }} /> : ''}
        <Text>{text}</Text>
      </div>
    );
  };

  getCurrentHeaderRecordData = () => {
    const { detailViewFormDS } = this.props;
    if (!detailViewFormDS) {
      return;
    }

    const currentHeaderRecordData = detailViewFormDS.getState('headerRecordData');
    return currentHeaderRecordData;
  };

  // 当前单据是否已停止
  currentBiddingEnd = () => {
    const currentHeaderRecordData = this.getCurrentHeaderRecordData();
    const { displayBiddingSupLineStatus } = currentHeaderRecordData || {};

    const endFlag =
      displayBiddingSupLineStatus === 'BIDDING_END' || displayBiddingSupLineStatus === 'CLOSED';
    return endFlag;
  };

  // 剩余可出价次数
  renderReminQuotationCount = () => {
    const {
      detailViewFormDS,
      pageReadOnlyFlag,
      getCurrentStageBiddingRemainQuotationCount = noop,
    } = this.props;
    const currentFormRecord = detailViewFormDS?.current;
    const headerRecordData = detailViewFormDS.getState('headerRecordData') || {};
    const { displayBiddingSupLineStatus } = headerRecordData || {};
    const { displayBiddingSupHeaderStatus } = currentFormRecord
      ? currentFormRecord.get(['displayBiddingSupHeaderStatus'])
      : {};

    const currentStageBiddingRemainQuotationCount = getCurrentStageBiddingRemainQuotationCount({
      record: currentFormRecord,
    });

    const biddingEndFlag = this.currentBiddingEnd();
    const pausedFlag =
      displayBiddingSupHeaderStatus === 'PAUSED' || displayBiddingSupLineStatus === 'PAUSED';

    if (
      isNil(currentStageBiddingRemainQuotationCount) ||
      pageReadOnlyFlag ||
      biddingEndFlag ||
      pausedFlag
    ) {
      return '';
    }

    return (
      <div className={Styles['detail-header-form-submit-after-beleft-count']}>
        {intl
          .get('ssrc.biddingHall.view.title.biddingRemainingQuotationCount', {
            count: currentStageBiddingRemainQuotationCount,
          })
          .d('剩余可出价{count}次')}
      </div>
    );
  };

  // form view status
  renderUnitPriceStatus = () => {
    const {
      detailViewFormDS,
      supplierCollection = noop,
      pageReadOnlyFlag,
      unitPriceFlag,
      totalPriceFlag,
      headerInfo,
      initPage,
      countDownTimerOver = noop,
      headerRule,
      // pageLoading,
      countDownShowAllZeroFlag,
      remote,
      hideIdentityAndQuote = noop,
      getCurrentProcessNode = noop,
    } = this.props;

    const headerRecordData = detailViewFormDS.getState('headerRecordData');

    const statusProps = {
      record: detailViewFormDS?.current,
      supplierCollection,
      pageReadOnlyFlag,
      headerRecordData,
      unitPriceFlag,
      totalPriceFlag,
      headerInfo,
      initPage,
      countDownTimerOver,
      headerRule,
      countDownShowAllZeroFlag,
      remote,
      hideIdentityAndQuote,
      getCurrentProcessNode,
    };

    return (
      <div>
        <Status {...statusProps} />
      </div>
    );
  };

  // form view status
  renderTotalPriceStatus = () => {
    const {
      detailViewFormDS,
      supplierCollection = noop,
      pageReadOnlyFlag,
      unitPriceFlag,
      totalPriceFlag,
      headerInfo,
      supplementUnitPriceFlag,
      headerRule,
      // pageLoading,
      countDownShowAllZeroFlag,
      hideIdentityAndQuote,
      japOrDutchBidding = noop,
      japOrDutchBiddingTotalPrice = noop,
      biddingSupplierEliminate = noop,
    } = this.props;

    const statusProps = {
      record: detailViewFormDS?.current,
      supplierCollection,
      pageReadOnlyFlag,
      unitPriceFlag,
      totalPriceFlag,
      headerInfo,
      supplementUnitPriceFlag,
      headerRule,
      countDownShowAllZeroFlag,
      hideIdentityAndQuote,
      japOrDutchBidding,
      japOrDutchBiddingTotalPrice,
      biddingSupplierEliminate,
    };

    return (
      <div>
        <Status {...statusProps} />
      </div>
    );
  };

  // 总价-自动计算所有行金额
  autoCalcTotalPriceAllLineAmount = () => {
    const { totalPriceTableDS, detailViewFormDS } = this.props;
    const { length } = totalPriceTableDS || {};
    const { current: formCurrent } = detailViewFormDS || {};
    if (!length || !formCurrent) {
      return;
    }

    // const taxFlag = getTaxOrUntax();

    const {
      supplementQtnNetAmount = 0,
      supplementQtnTotalAmount = 0,
      qtnTotalAmountTemp = 0,
      qtnNetAmountTemp = 0,
      biddingSupplementPriceRunningFlag = 0,
    } = formCurrent
      ? formCurrent.get([
          'supplementQtnNetAmount',
          'supplementQtnTotalAmount',
          'qtnTotalAmountTemp',
          'qtnNetAmountTemp',
          'biddingSupplementPriceRunningFlag',
        ])
      : {};

    let headerAmountField = 'currentQtnTotalAmount'; // 当前页行金额值
    let headerAmount = qtnTotalAmountTemp; // 头上所有页的行金额
    const lineAmountField = 'currentLnTotalAmount'; // 每行的行金额字段

    // 未税金额字段
    let headerNetAmountField = 'currentQtnNetAmount';
    let headerNetAmount = qtnNetAmountTemp;
    const lineNetAmountField = 'currentLnNetAmount';

    // if (!taxFlag) {
    //   headerAmount = qtnNetAmount;
    //   lineAmountField = 'currentLnNetAmount';
    //   headerAmountField = 'currentQtnNetAmount';
    // }

    // 补充单价-更换金额字段
    if (biddingSupplementPriceRunningFlag) {
      headerAmount = supplementQtnTotalAmount;
      headerAmountField = 'currentSupplementQtnTotalAmount';

      headerNetAmount = supplementQtnNetAmount;
      headerNetAmountField = 'currentSupplementQtnNetAmount';

      // if (!taxFlag) {
      //   headerAmount = supplementQtnNetAmount;
      //   headerAmountField = 'currentSupplementQtnNetAmount';
      // }
    }

    let currentPrinstineAllLineAmount = 0;
    let currentTableAllLineAmount = 0;
    // 未税计算
    let currentPrinstineAllLineNetAmount = 0;
    let currentTableAllLineNetAmount = 0;
    // let amountDifference = null;

    runInAction(() => {
      totalPriceTableDS.forEach((record) => {
        if (!record) {
          return;
        }

        const prinstineAmount = record.getPristineValue(lineAmountField);
        const { [lineAmountField]: lineAmount = 0 } = record.get([lineAmountField]);

        const prinstineNetAmount = record.getPristineValue(lineNetAmountField);
        const { [lineNetAmountField]: lineNetAmount = 0 } = record.get([lineNetAmountField]);

        currentTableAllLineAmount = math.plus(currentTableAllLineAmount || 0, lineAmount || 0) || 0; // currnet amount total
        currentPrinstineAllLineAmount =
          math.plus(currentPrinstineAllLineAmount || 0, prinstineAmount || 0) || 0; // prinstine amount

        // 未税
        currentTableAllLineNetAmount =
          math.plus(currentTableAllLineNetAmount || 0, lineNetAmount || 0) || 0; // currnet amount net total
        currentPrinstineAllLineNetAmount =
          math.plus(currentPrinstineAllLineNetAmount || 0, prinstineNetAmount || 0) || 0; // prinstine amount net
      });

      /**
       * 合计
       * */
      const qtnAmountTotal = math.plus(
        math.minus(currentTableAllLineAmount, currentPrinstineAllLineAmount),
        headerAmount || 0
      );

      // 未税合计
      const qtnAmountNet = math.plus(
        math.minus(currentTableAllLineNetAmount, currentPrinstineAllLineNetAmount),
        headerNetAmount || 0
      );

      const totalAmount = biddingSupplementPriceRunningFlag
        ? {
            [headerAmountField]: qtnAmountTotal,
            [headerNetAmountField]: qtnAmountNet,
            // supplementQtnTotalAmount: qtnAmountTotal, // 产品要求补充单价算头一次未税和含税，有问题，需要前端当前值
            // supplementQtnNetAmount: qtnAmountNet,
          }
        : {
            [headerAmountField]: qtnAmountTotal,
            [headerNetAmountField]: qtnAmountNet,
            qtnTotalAmount: qtnAmountTotal,
            qtnNetAmount: qtnAmountNet,
          };

      // 前端当前计算合集
      formCurrent.set(totalAmount);
      // if (biddingSupplementPriceRunningFlag) {
      //   // 计算差额: 我的报价-合计 = 差额
      //   amountDifference = math.minus(qtnAmountTotal || 0, headerAmount || 0);
      //   formCurrent.set('amountDifference', amountDifference);
      // }
    });
  };

  // warning message
  renderWarning = () => {
    const { pageReadOnlyFlag, detailViewFormDS } = this.props;

    const { current: formCurrent } = detailViewFormDS || {};
    if (!formCurrent) {
      return '';
    }

    const { biddingDeleteFlag } = formCurrent?.get(['biddingDeleteFlag']);

    if (!biddingDeleteFlag || pageReadOnlyFlag) {
      return '';
    }

    return (
      <div className={Styles['ssrc-bidding-hall-quotation-partial-delete-quotaion-message']}>
        <Icon type="error" style={{ fontSize: '12px', color: '#f06200' }} />
        <span className={Styles['delete-quotation-text-tips']}>
          <Text>
            {intl
              .get('ssrc.biddingHall.view.quotationPriceHasDeleteAndReQuoted')
              .d('您的最新报价已被删除，如有异议，请联系本次竞价负责人处理。')}
          </Text>
        </span>
      </div>
    );
  };

  // 补充单价进行中判断
  supplementPriceFlag = () => {
    const { detailViewFormDS, totalPriceFlag } = this.props;

    const { current: formCurrentRecord } = detailViewFormDS || {};
    const { biddingSupplierPriceSubmitFlag, biddingSupplementPriceRunningFlag } = formCurrentRecord
      ? formCurrentRecord.get([
          'biddingSupplierPriceSubmitFlag',
          'biddingSupplementPriceRunningFlag',
        ])
      : {};

    const flag =
      totalPriceFlag && !biddingSupplierPriceSubmitFlag && biddingSupplementPriceRunningFlag;
    return flag;
  };

  /**
   *
   * 警戒降价比例/警戒降价金额
   * 供应商头状态=【签到中】【未开始】【进行中】【暂停】可编辑
     其他头状态不可编辑
  */
  renderWarningPrice = () => {
    const {
      headerInfo,
      refreshContent,
      organizationId,
      biddingSupLineCurId,
      rfxLineSupplierId,
      detailViewFormDS,
      pageReadOnlyFlag,
      totalPriceFlag,
      unitPriceFlag,
      submitQuotationPrice = noop,
      pageLoading,
      pageOperationLoading,
      supplementUnitPriceFlag,
      getCurrentStageBiddingRemainQuotationCount = noop,
      unitWholeBatchPriceFlag = false, // 单价-整单批量
      japanDutchTotalPrice,
      biddingFinishedOrProhibit = noop,
    } = this.props;
    const { detailLoading } = this.state;
    const { displayBiddingSupHeaderStatus, supplierStatus } = headerInfo || {};
    const headerRecordData = detailViewFormDS.getState('headerRecordData') || {};
    const { displayBiddingSupLineStatus } = headerRecordData || {};
    const { current: formCurrentRecord } = detailViewFormDS || {};
    const {
      displayQuotationPrice,
      biddingSupplementPriceRunningFlag,
      biddingSupplierPriceSubmitFlag,
    } = formCurrentRecord
      ? formCurrentRecord.get([
          'displayQuotationPrice',
          'biddingSupplementPriceRunningFlag',
          'biddingSupplierPriceSubmitFlag',
        ])
      : {};

    const lineDisabledFlag = this.judgeLineDisabledFlag();
    // 剩余可出价次数
    const currentStageBiddingRemainQuotationCount = getCurrentStageBiddingRemainQuotationCount({
      record: formCurrentRecord,
    });

    const prohibitQuotationFlag = supplierStatus === 'PROHIBIT_QUOTATION';

    let warningPriceShowFlag = false;
    if (unitPriceFlag) {
      warningPriceShowFlag =
        displayBiddingSupLineStatus === 'NOT_START' ||
        displayBiddingSupLineStatus === 'SIGN_IN' ||
        displayBiddingSupLineStatus === 'IN_PROGRESS' ||
        displayBiddingSupLineStatus === 'PAUSED';
    }
    if (totalPriceFlag) {
      warningPriceShowFlag =
        displayBiddingSupHeaderStatus === 'NOT_START' ||
        displayBiddingSupHeaderStatus === 'SIGN_IN' ||
        displayBiddingSupHeaderStatus === 'IN_PROGRESS' ||
        displayBiddingSupHeaderStatus === 'PAUSED';

      if (biddingSupplementPriceRunningFlag) {
        warningPriceShowFlag = false;

        if (isNil(displayQuotationPrice)) {
          warningPriceShowFlag = false;
        }
      }
    }

    const hideWarningPriceWrap =
      unitWholeBatchPriceFlag ||
      (japanDutchTotalPrice && warningPriceShowFlag) ||
      (biddingFinishedOrProhibit() && !biddingSupplierPriceSubmitFlag);

    if (hideWarningPriceWrap) {
      return '';
    }

    warningPriceShowFlag = !!warningPriceShowFlag && !prohibitQuotationFlag;

    const comProps = {
      toggleContentLoading: this.toggleContentLoading,
      detailLoading,
      headerInfo,
      pageReadOnlyFlag,
      supplementUnitPriceFlag,
      warningDS: this.warningDS,
      refreshContent,
      organizationId,
      biddingSupLineCurId,
      rfxLineSupplierId,
      detailViewFormDS,
      unitPriceFlag,
      totalPriceFlag,
      submitQuotationPrice,
      pageLoading,
      pageOperationLoading,
      lineDisabledFlag,
      warningPriceShowFlag,
      displayBiddingSupHeaderStatus,
      supplementPriceFlag: this.supplementPriceFlag(),
      currentStageBiddingRemainQuotationCount,
      japanDutchTotalPrice,
    };

    return <WarningPrice {...comProps} />;
  };

  renderTotalTableContent = () => {
    const totalPriceProps = this.props || {};
    const tableProps = {
      supplementPriceFlag: this.supplementPriceFlag(),
      autoCalcTotalPriceAllLineAmount: this.autoCalcTotalPriceAllLineAmount,
    };

    return <TotalPriceLineTable {...totalPriceProps} {...tableProps} />;
  };

  render() {
    const { totalPriceFlag, renderStatusAlert = noop } = this.props;

    // total price info
    if (totalPriceFlag) {
      return (
        <div
          className={classnames(
            Styles['supplier-bidding-hall-body-quotation-detail-wrap'],
            Styles['supplier-bidding-hall-body-quotation-detail-total-price-wrap']
          )}
        >
          <div className={classnames(Styles['detail-bidding-item-content-wrap'])}>
            {renderStatusAlert()}
            {this.renderTotalPriceHeaderInfo()}
            {this.renderTotalPriceStatus()}
            {this.renderWarning()}
            {this.renderTotalAmountQuotationForm({
              columns: 1, // 总价 表单列
              customizeUnitCodeName: 'totalPriceDetailViewForm',
            })}
            {this.renderTotalTableContent()}
          </div>
          {this.renderWarningPrice()}
        </div>
      );
    }

    // unit price info
    return (
      <div
        className={classnames(
          Styles['supplier-bidding-hall-body-quotation-detail-wrap'],
          Styles['supplier-bidding-hall-body-quotation-detail-unit-price-wrap']
        )}
      >
        {this.renderHeaderInfo()}
        {this.renderUnitPriceStatus()}
        {this.renderQuotationForm({
          columns: 1,
        })}
        {this.renderWarningPrice()}
      </div>
    );
  }
}

export default QuotationDetail;
