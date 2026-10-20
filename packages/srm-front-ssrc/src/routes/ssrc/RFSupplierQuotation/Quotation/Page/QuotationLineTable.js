import React, { useState, useMemo, useCallback, useImperativeHandle } from 'react';
import { Attachment, Icon, Lov, CheckBox, Button } from 'choerodon-ui/pro';
import { Tooltip, Tag, Badge } from 'choerodon-ui';
// import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';
import { noop, isNaN, isEmpty, throttle, isNil } from 'lodash';

// import { DEFAULT_DATETIME_FORMAT, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import CountDown from '@/routes/ssrc/components/CountDown';
import { calculateBasicQty } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
// import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import QuotationDetailModal from '@/routes/components/QuotationDetailCurrent/Supplier';
import LadderPriceEditor from '@/routes/ssrc/components/LadderPrice/LadderPriceEditor';
import { InputNumberZeroTooltipWrap } from '@/routes/ssrc/SupplierQuotation/components/WrapperTooltip';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';
import { getJDQuotation } from '@/services/supplierQutationService';
// import {
//   batchMaintainItemQuotationLine,
//   // quotationLineBatchMaintain,
// } from '@/services/inquiryHallService';
import QuotationHistory from '../Modals/QuotationHistory';
import BatchMaintain from '../Modals/BatchMaintain';
import RankChart from '../Modals/RankChart';

import Styles from '../index.less';

// const Paginations = {
//   pageSizeOptions: ['10', '20', '50', '100', '200'],
// };

const AggregationPaginations = {
  pageSizeOptions: ['10', '15', '20', '30', '50'],
};

const QuotationLineTable = (props) => {
  const {
    quotationLineDS,
    customizeTable = noop,
    custLoading,
    organizationId,
    basicFormDS,
    getCustomizeUnitCode = () => {},
    queryQuotationLines = noop,
    initPage = noop,
    // categoryCode,
    bidFlag,
    quotationName,
    customizeForm,
    doubleUnitFlag = false,
    handleSaveQuotation,
    quotationRemote,
    batchUpdateLines = noop,
    onRef,
    currencyPrecision,
    financialPrecision,
    caclRule,
    rollingFetchQuotationListInfo = noop,
    handleFetchQuotationListNewMessage = noop,
    calcQuotationTableSummaryQuotationLine = noop,
    calcQuotationTableSummaryQuotationAmount = noop,
    tablePaginationChange = noop,
    afterQueryLineFetchRank = noop,
    updateBatchMaintainCache = noop,
    allPageDisabled = false,
  } = props;

  const [aggregation, setAggregation] = useState(false);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(
    onRef,
    () => ({
      aggregation,
      dynamicChangePrice,
    }),
    [aggregation, caclRule, financialPrecision, currencyPrecision, dynamicChangePrice]
  );

  const currentModal = {};

  const {
    quotationStatus,
    continuousQuotationFlag: headerContinuousQuotationFlag,
    sourceCategory,
    priceTypeCode,
    roundQuotationRankFlag,
    currentQuotationRound,
    // quotationRoundNumber,
    existBargainedFlag,
    // rfxNum,
    rfxHeaderId,
    quotationScope,
    tenantId,
    // auctionDirection,
    bargainStatus: bargainStatusHeader,
    supplierStatus,
    systemVersion, // 为2使用的新模板配置
    jdSupplierQuoteFlag, // 京东供应商标志
    quotationHeaderCurrentId = '',
  } = basicFormDS?.current
    ? basicFormDS.current?.get([
        'quotationStatus',
        'continuousQuotationFlag',
        'sourceCategory',
        'priceTypeCode',
        'roundQuotationRankFlag',
        'currentQuotationRound',
        'existBargainedFlag',
        // 'quotationRoundNumber',
        // 'rfxNum',
        'rfxHeaderId',
        'quotationScope',
        'tenantId',
        // 'auctionDirection',
        'bargainStatus',
        'supplierStatus',
        'systemVersion',
        'jdSupplierQuoteFlag',
        'quotationHeaderCurrentId',
      ])
    : {};
  const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';

  const RFAFlag = useMemo(() => sourceCategory === 'RFA', [sourceCategory]);
  const roundQuotationFieldHiddenFlag = useMemo(
    () => !roundQuotationRankFlag || currentQuotationRound < 2,
    [roundQuotationRankFlag, currentQuotationRound]
  );

  // 报价行状态
  const quotationLineStatusTableColor = useCallback(
    (record) => {
      let color = '';
      let backGround = '';
      const { displayQuotationLineStatus, displayQuotationLineStatusMeaning } = record?.get([
        'displayQuotationLineStatus',
        'displayQuotationLineStatusMeaning',
      ]);
      switch (displayQuotationLineStatus) {
        case 'NEW':
        case 'ROUND_QUOTATION':
          color = '#F88D10';
          backGround = 'rgba(252,160,0,0.10)';
          break;
        case 'SUBMITTED':
          color = '#47B881';
          backGround = 'rgba(71,184,129,0.10)';
          break;
        case 'ABANDONED':
          color = 'rgba(0,0,0,0.65)';
          backGround = 'rgba(0,0,0,0.06)';
          break;
        default:
          color = '#FC9300';
          backGround = '#FEF5E5';
          break;
      }
      return (
        <Tag
          style={{
            textAlign: 'center',
            backgroundColor: backGround,
            color,
            border: 0,
          }}
        >
          {displayQuotationLineStatusMeaning}
        </Tag>
      );
    },
    [basicFormDS, quotationLineDS]
  );

  // 放弃
  const giveUpQuotationLine = useCallback(
    (val = 0, record = {}) => {
      // const { taxChangeFlag, quantityChangeFlag } = record.get([
      //   'taxChangeFlag',
      //   'quantityChangeFlag',
      // ]);

      if (val) {
        // record.set('netPrice', null);
        // record.set('netSecondaryPrice', null);
        // record.set('brand', null);
        // record.set('origin', null);
        // record.set('biUomId', null);
        // record.set('uomConversionRate', null);
        // record.set('minPackageQuantitytPrice', null);
        // record.set('minPurchaseQuantity', null);
        // record.set('currentPromisedDate', null);
        // record.set('currentExpiryDateTo', null);
        // record.set('currentDeliveryCycle', null);
        // record.set('currentQuotationPrice', null);
        // record.set('currentQuotationSecPrice', null);
        // record.set('currentExpiryDateFrom', null);
        // record.set('currentQuotationRemark', null);
        // record.set('currentAttachmentUuid', null);
        // record.set('quotationStartDate', null);
        // record.set('quotationEndDate', null);
        record.set({
          currentQuotationPrice: null,
          currentQuotationSecPrice: null,
          netPrice: null,
          netSecondaryPrice: null,
          currentLnTotalAmount: null,
          currentLnNetAmount: null,
        });

        // if (taxChangeFlag === 1) {
        // record.set('taxId', {});
        // record.set('taxIncludedFlag', 0);
        // }
        // if (quantityChangeFlag === 1) {
        //   record.set('currentQuotationQuantity', null);
        //   record.set('currentQuotationSecQuantity', null);
        // }

        quotationLineDS.unSelect(record);
        calcQuotationTableSummaryQuotationLine();
        calcQuotationTableSummaryQuotationAmount();
      }
    },
    [
      basicFormDS,
      quotationLineDS,
      calcQuotationTableSummaryQuotationLine,
      calcQuotationTableSummaryQuotationAmount,
    ]
  );

  // 修改可供数量
  const handleChangeQuotationQuantityBase = (_, record) => {
    dynamicChangePrice(record);
  };

  // 可供数量-secondary
  const handleChangeQuotationQuantity = useCallback(
    async (val, record) => {
      const {
        // netSecondaryPrice,
        // currentSecondaryQuotationPrice,
        itemId,
        secondaryUomId,
        currentQuotationSecQuantity,
        uomId,
        rfxLineItemId,
      } = record?.get([
        // 'netSecondaryPrice',
        // 'currentSecondaryQuotationPrice',
        'itemId',
        'secondaryUomId',
        'currentQuotationSecQuantity',
        'uomId',
        'rfxLineItemId',
      ]);
      // const isExist =
      //   netSecondaryPrice !== '' && netSecondaryPrice !== undefined && netSecondaryPrice !== null;
      // const netAmount = math.multipliedBy(netSecondaryPrice, val); // 行金额未税

      // record.set('totalAmount', isExist ? currentSecondaryQuotationPrice : null);
      // record.set('netAmount', isExist ? netAmount : null);
      if (itemId && doubleUnitFlag) {
        if (secondaryUomId && val) {
          const res = await calculateBasicQty({
            secondaryQuantity: currentQuotationSecQuantity,
            itemId,
            businessKey: rfxLineItemId || record.id,
            doublePrimaryUomId: uomId,
            secondaryUomId,
            tenantId,
          });
          record.set('currentQuotationQuantity', res ?? '');
        } else if (val === 0) {
          record.set('currentQuotationQuantity', 0);
        }
      } else {
        record.set('currentQuotationQuantity', val);
      }
      dynamicChangePrice(record);
    },
    [basicFormDS, doubleUnitFlag]
  );

  // 改变含税标识
  const onChangeTaxIncludedFlag = (result, record) => {
    if (!result) {
      record.set('taxId', null);
      record.set('taxRate', null);
      record.set({
        taxRateType: null,
      });
    }
    dynamicChangePrice(record);
  };

  // 改变税率
  const changeTax = (data, record) => {
    const { taxRate = null, taxId = null, taxRateType = null } = data || {};
    record.set('taxId', { ...(data || {}), taxId, taxRate });
    record.set({
      taxRateType,
    });
    dynamicChangePrice(record);
  };

  // 按照基准价动态计算价格
  const dynamicChangePrice = (record = {}) => {
    if (!isUnTaxPriceFlag) {
      handleChangeQuotationPrice(record);
    } else {
      handleChangeNetPrice(record);
    }

    calcQuotationTableSummaryQuotationAmount(record);
  };

  // 阶梯报价-取消弹窗-刷新头行
  const handleCancelLadderPrice = useCallback(() => {
    initPage();
  }, [initPage]);

  // // 价格标题
  // const priceTitle = useCallback(
  //   (currentLabel = '') => {
  //     let currentTitle = null;
  //     if (auctionDirection === 'FORWARD') {
  //       currentTitle = intl
  //         .get('ssrc.common.title.forwardDirectionPriceTitleExplain')
  //         .d('采购方要求本单报价方向为英式，每次报价需高于上次报价');
  //     }
  //     if (auctionDirection === 'REVERSE') {
  //       // 荷兰
  //       currentTitle = intl
  //         .get('ssrc.common.title.reverseDirectionPriceTitleExplain')
  //         .d('采购方要求本单报价方向为荷兰式，每次报价需低于上次报价');
  //     }

  //     return <Tooltip title={currentTitle}>{currentLabel}</Tooltip>;
  //   },
  //   [quotationLineDS, auctionDirection]
  // );

  // 报价明细 props
  const quotationDetailProps = useMemo(
    () => ({
      bidFlag,
      headerData: basicFormDS,
      sourceFrom: 'RFX',
      rfxHeaderId,
      detailFrom: 'SUP_QUOTATION', // 针对一些子模块的情况
      quotationStatus,
      continuousQuotationFlag: headerContinuousQuotationFlag,
      onBeforeOpen: handleSaveQuotation, // 打开之前保存页面数据
      onOk: handleCancelLadderPrice,
      onCancel: handleCancelLadderPrice,
      basicFormDS,
    }),
    [
      quotationStatus,
      headerContinuousQuotationFlag,
      handleCancelLadderPrice,
      rfxHeaderId,
      basicFormDS,
      bidFlag,
    ]
  );

  // 通用禁用
  const commonDisabled = useCallback((record) => {
    const {
      abandonedFlag,
      bargainFlag,
      eliminateFlag,
      displayQuotationLineStatus,
      bargainStatus,
      continuousQuotationFlag,
      headerBargainFlag,
    } = record.get([
      'abandonedFlag',
      'bargainFlag',
      'eliminateFlag',
      'displayQuotationLineStatus',
      'bargainStatus',
      'continuousQuotationFlag',
      'headerBargainFlag',
    ]);

    const statusResult =
      displayQuotationLineStatus === 'NOT_START' ||
      displayQuotationLineStatus === 'ABANDONED' ||
      displayQuotationLineStatus === 'FINISHED';
    const continueResult =
      continuousQuotationFlag !== 1 && displayQuotationLineStatus === 'SUBMITTED';
    const bargainResult =
      bargainFlag !== 1 && headerBargainFlag === 1 && bargainStatus === 'BARGAINING_ONLINE';

    const baseResult =
      abandonedFlag || eliminateFlag || statusResult || continueResult || bargainResult;

    return baseResult;
  }, []);

  // change attachment
  const supplierAttachmentChange = useCallback((record) => {
    if (!record) {
      return;
    }

    record.set('updatedFlag', 1); // 行如果有变更，后端会依据此提交
  }, []);

  // 改变含税后，计算价格
  const handleChangeQuotationPrice = (record) => {
    if (!record) {
      return;
    }

    // const currencyPrecision = record.getState('currency_precision');
    // const financialPrecision = !isNil(record.get('finicial')) ? record.get('finicial') : 10;
    const {
      taxRate,
      taxIncludedFlag,
      taxChangeFlag,
      currentQuotationQuantity,
      currentQuotationSecQuantity,
      priceBatchQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        'taxChangeFlag',
        'taxRate',
        'currentQuotationQuantity',
        'currentQuotationSecQuantity',
        'priceBatchQuantity',
        'taxRateType',
      ]) || {};
    let currentQuotationPrice = record.get('currentQuotationPrice');
    if (doubleUnitFlag) {
      currentQuotationPrice = record.get('currentQuotationSecPrice');
    }

    const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
    const taxRateNew =
      Number(systemVersion) === 2 || taxChangeFlag
        ? taxIncludedFlag
          ? taxRate
          : 0
        : pristineTaxRate || 0;

    const CurrentQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    COMMONS.quantity = CurrentQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    COMMONS.taxUnitPrice = currentQuotationPrice;
    // 数量不存在，修改计算场景
    if (!CurrentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    const CalcCommons = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_TAX_PRICE_CHANGE_CALCULATE_PROPS',
          COMMONS,
          {
            // quotationLineDS,
            bidFlag,
            // initPage,
            basicFormDS,
          }
        )
      : COMMONS;

    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(CalcCommons) || {};

    const priceValueObject = {
      netPrice: calcNetUnitPrice,
      currentLnTotalAmount: calcTaxAmount,
      currentLnNetAmount: calcNetAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.netSecondaryPrice = calcNetUnitPrice;
    }

    record.set(priceValueObject);
    calcQuotationTableSummaryQuotationLine();
    calcQuotationTableSummaryQuotationAmount();
  };

  // 改变未税含税后，计算价格
  const handleChangeNetPrice = (record) => {
    if (!record) {
      return;
    }

    // const currencyPrecision = record.getState('currency_precision');
    // const financialPrecision = !isNil(record.get('financialPrecision'))
    //   ? record.get('financialPrecision')
    //   : 10;
    const {
      taxRate,
      taxIncludedFlag,
      taxChangeFlag,
      currentQuotationQuantity,
      currentQuotationSecQuantity,
      priceBatchQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        'taxChangeFlag',
        'taxRate',
        'currentQuotationQuantity',
        'currentQuotationSecQuantity',
        'priceBatchQuantity',
        'taxRateType',
      ]) || {};
    let netPrice = record.get('netPrice');
    if (doubleUnitFlag) {
      netPrice = record.get('netSecondaryPrice');
    }

    const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
    const taxRateNew =
      Number(systemVersion) === 2 || taxChangeFlag
        ? taxIncludedFlag
          ? taxRate
          : 0
        : pristineTaxRate || 0;

    const CurrentQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    COMMONS.quantity = CurrentQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    COMMONS.netUnitPrice = netPrice;
    // 数量不存在，修改计算场景
    if (!CurrentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }
    const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      currentQuotationPrice: calcTaxUnitPrice,
      currentLnTotalAmount: calcTaxAmount,
      currentLnNetAmount: calcNetAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.currentQuotationSecPrice = calcTaxUnitPrice;
    }

    record.set(priceValueObject);
    calcQuotationTableSummaryQuotationLine();
    calcQuotationTableSummaryQuotationAmount();
  };

  const columns = useMemo(() => {
    const columnsArr = [
      // {
      //   key: 'lineNumGroup',
      //   header: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
      //   width: 80,
      //   aggregation: true,
      //   aggregationLimit: 4,
      //   children: [{ name: 'rfxLineItemNum', width: 80, }],
      // }, // 行已按照状态排序，行号会显示混乱，产品暂决定不显示
      // 议价的时候不显示这一列
      {
        header: intl.get(`ssrc.common.biddingRanking`).d('竞价排名'),
        key: 'biddingRankingGroup',
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        hidden: !RFAFlag || bargainStatusHeader === 'BARGAINING_ONLINE',
        children: [
          {
            name: 'rank',
            hidden: !RFAFlag || bargainStatusHeader === 'BARGAINING_ONLINE',
            // hiddenInAggregation: true,
            width: 80,
            renderer: ({ record }) => {
              return (
                <RankChart
                  aggregation={aggregation}
                  name="rank"
                  headerDS={basicFormDS}
                  lineRecord={record}
                  organizationId={organizationId}
                  quotationRemote={quotationRemote}
                />
              );
            },
          },
        ],
      },

      {
        header: intl.get('hzero.common.status').d('状态'),
        key: 'statusGroup',
        width: 140,
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'displayQuotationLineStatus',
            title: aggregation
              ? ''
              : intl
                  .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, {
                    quotationName,
                  })
                  .d('{quotationName}状态'),
            width: 120,
            renderer: ({ record }) => {
              const { displayQuotationLineStatusMeaning, displayQuotationLineStatus } = record.get([
                'displayQuotationLineStatusMeaning',
                'displayQuotationLineStatus',
              ]);

              return renderStatusTag({
                status: displayQuotationLineStatus,
                statusMeaning: displayQuotationLineStatusMeaning,
              });
            },
          },
        ],
      },

      {
        header: intl.get('ssrc.rf.view.card.subtitle.itemInfo').d('物料信息'),
        name: 'itemInfo',
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'itemName',
          },
          {
            name: 'secondaryQuantityAndUomCombine',
            width: 120,
            hidden: !doubleUnitFlag,
            renderer: ({ record }) => {
              const { secondaryUomName, secondaryQuantity } = record?.get([
                'secondaryUomName',
                'secondaryQuantity',
              ]);
              return secondaryQuantity && secondaryUomName
                ? `${numberSeparatorRender(secondaryQuantity)}-${secondaryUomName}`
                : secondaryQuantity || secondaryUomName;
            },
          },
          {
            name: 'quantityAndUomCombine',
            width: 140,
            renderer: ({ record }) => {
              const { uomName, rfxQuantity } = record?.get(['uomName', 'rfxQuantity']);
              return rfxQuantity && uomName
                ? `${numberSeparatorRender(rfxQuantity)}-${uomName}`
                : rfxQuantity || uomName;
            },
          },
          { name: 'demandDate', width: 120 },
          {
            name: 'rfxAttachmentUuid',
            width: 120,
            // editro: (record) => {
            //   return (
            //     <Attachment readOnly record={record} name="rfxAttachmentUuid" viewMode="popup" />
            //   );
            // },
          },
          {
            name: 'specs',
            width: 120,
          },
        ],
      },

      {
        header: `${intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuoteInformation`, { quotationName })
          .d('{quotationName}信息')}2`,
        key: 'quotationInfo', // 报价基本信息组
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'abandonedFlag',
            width: 100,
            hidden: quotationScope === 'ALL_QUOTATION',
            editor: (record) => {
              return <CheckBox onChange={(val) => giveUpQuotationLine(val, record)} />;
            },
          },
          {
            name: 'currentQuotationSecQuantity',
            hidden: !doubleUnitFlag,
            width: 140,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  record={record}
                  uom="secondaryUomId"
                  name="currentQuotationSecQuantity"
                  onChange={(val) => handleChangeQuotationQuantity(val, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          },
          {
            name: 'currentQuotationQuantity',
            width: 140,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  record={record}
                  uom="uomId"
                  name="currentQuotationQuantity"
                  onChange={(val) => handleChangeQuotationQuantityBase(val, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          },
          {
            name: 'priceBatchQuantity',
            width: 100,
            align: 'right',
          },
          {
            name: 'ladderInquiryFlag',
            width: 100,
            hiddenInAggregation: true,
            editor: true,
          },
          {
            name: 'ladderLevel',
            width: 100,
            renderer: ({ record }) => {
              const {
                ladderInquiryFlag,
                abandonedFlag,
                eliminateFlag,
                ladderInquiryRequire,
              } = record.get([
                'ladderInquiryFlag',
                'abandonedFlag',
                'eliminateFlag',
                'ladderInquiryRequire',
              ]);
              const disabledFlag = commonDisabled(record);

              if (abandonedFlag || eliminateFlag) {
                return '-';
              }

              const currentProps = {
                customizeFlag: 1,
                customizeTable,
                doubleUnitFlag,
                disabled: disabledFlag,
                customizeUnitCode: getCustomizeUnitCode('ladderTable'),
                tenantId,
                basicFormDS,
                readOnly: allPageDisabled,
                pageSymbol: 'quotation',
                onBeforeOpen: handleSaveQuotation, // 打开页面之前保存数据
                onCancel: handleCancelLadderPrice,
                record,
                headerDS: basicFormDS,
                organizationId,
                remote: quotationRemote,
                remoteCode: 'SSRC_SUPPLIER_QUOTATION_NEW',
                currentModal,
              };

              const LadderLevelModalProps = quotationRemote
                ? quotationRemote.process(
                    'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_COLUMNS_LADDER_LEVEL_MODAL_PROPS',
                    currentProps,
                    {
                      quotationLineDS,
                      bidFlag,
                      initPage,
                      handleSaveQuotation,
                      basicFormDS,
                      handleCancelLadderPrice,
                      organizationId,
                    }
                  )
                : currentProps;

              return ladderInquiryFlag === 1 ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LadderPriceEditor {...LadderLevelModalProps} />
                  {ladderInquiryRequire === 1 ? (
                    <Badge style={{ marginLeft: '4px' }} status="error" />
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                '-'
              );
            },
          },
          {
            name: 'priceDetail',
            width: 100,
            renderer: ({ record }) => {
              const {
                abandonedFlag,
                eliminateFlag,
                continuousQuotationFlag,
                bargainFlag,
                bargainStatus,
                quotationDetailRequire,
                displayQuotationLineStatus,
              } = record.get([
                'abandonedFlag',
                'eliminateFlag',
                'continuousQuotationFlag',
                'bargainFlag',
                'bargainStatus',
                'quotationDetailRequire',
                'displayQuotationLineStatus',
              ]);

              if (abandonedFlag || eliminateFlag) {
                return '-';
              }

              const disabledFlag = ['NOT_START', 'FINISHED'].includes(displayQuotationLineStatus); // 针对竞价未开始和已结束处理

              const PriceDetailDisabledFlag = [
                abandonedFlag === 1 ||
                  (continuousQuotationFlag === 0 && displayQuotationLineStatus === 'SUBMITTED') ||
                  (bargainFlag === 0 && bargainStatus === 'BARGAINING_ONLINE') ||
                  eliminateFlag ||
                  allPageDisabled,
              ];

              const prePriceDetialProps = {
                ...quotationDetailProps,
                rowData: record,
                uiType: 'c7n-pro',
                disabled: disabledFlag,
                pageFrom: 'quotationQuery',
                incomingEditDisable: PriceDetailDisabledFlag,
                currentModal,
              };

              const PriceDetailProps = quotationRemote
                ? quotationRemote.process(
                    'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_COLUMNS_PRICE_DETAIL_MODAL_PROPS',
                    prePriceDetialProps,
                    {
                      quotationLineDS,
                      bidFlag,
                      initPage,
                      handleSaveQuotation,
                      basicFormDS,
                      handleCancelLadderPrice,
                      organizationId,
                    }
                  )
                : prePriceDetialProps;

              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <QuotationDetailModal {...PriceDetailProps} />
                  {quotationDetailRequire === 1 ? (
                    <Badge style={{ marginLeft: '4px' }} status="error" dot />
                  ) : (
                    ''
                  )}
                </div>
              );
            },
          },
        ],
      },
      // 议价的时候不显示这一列
      {
        header: intl.get(`ssrc.common.biddingOfferInfo`).d('竞价信息'),
        name: 'biddingOfferInfoGroup', // 竞价信息组
        align: 'left',
        hidden: !RFAFlag || bargainStatusHeader === 'BARGAINING_ONLINE',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'quotationStartDate',
            width: 140,
            hidden: !RFAFlag,
          },
          {
            name: 'quotationEndDate',
            width: 140,
            hidden: !RFAFlag,
          },
          {
            name: 'countDown',
            width: 120,
            hidden: !RFAFlag || !aggregation,
            renderer: ({ record }) => {
              const { currentDateTime, quotationEndDate } = record.get([
                'currentDateTime',
                'quotationEndDate',
              ]);

              const hiddenFlag = !currentDateTime || !quotationEndDate || !RFAFlag || !aggregation;
              if (hiddenFlag) {
                return '-';
              }

              return <CountDown sysNow={currentDateTime} endTime={quotationEndDate} type="day" />;
            },
          },
        ],
      },

      {
        header: intl.get(`ssrc.common.bargainInfo`).d('还价信息'),
        name: 'bargainInfoGroup', // 还价信息组
        align: 'left',
        hidden: !existBargainedFlag,
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'validBargainPrice',
            width: 120,
            hidden: !existBargainedFlag,
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          },
          {
            name: 'validBargainRemark',
            width: 200,
            hidden: !existBargainedFlag,
          },
          {
            name: 'bargainName',
            width: 120,
            hidden: !existBargainedFlag,
          },
        ],
      },

      {
        header: `${intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuoteInformation`, { quotationName })
          .d('{quotationName}信息')}3`,
        name: 'quotationInfoValidGroup', // 中标信息组
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'validQuotationSecPrice',
            hidden: !doubleUnitFlag,
            // hidden: roundQuotationFieldHiddenFlag,
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value, currencyPrecision),
          },
          {
            name: 'validNetSecondaryPrice',
            hidden: !doubleUnitFlag,
            width: 120,
            // hidden: roundQuotationFieldHiddenFlag,
            renderer: ({ value }) => numberSeparatorRender(value, currencyPrecision),
          },
          {
            name: 'validQuotationPrice',
            width: 120,
            renderer: ({ value }) => (
              <span> {numberSeparatorRender(value, currencyPrecision) ?? '-'}</span>
            ),
          },
          {
            name: 'validNetPrice',
            width: 120,
            renderer: ({ value }) => (
              <span> {numberSeparatorRender(value, currencyPrecision) ?? '-'}</span>
            ),
          },
          {
            name: 'currentLnTotalAmount',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value, financialPrecision),
          },
          {
            name: 'currentLnNetAmount',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value, financialPrecision),
          },
        ],
      },

      {
        header: intl.get(`ssrc.common.roundQuotationInfo`).d('多轮报价信息'),
        name: 'roundQuotationInfoGroup', // 多轮报价组
        width: 200,
        align: 'left',
        hidden: roundQuotationFieldHiddenFlag,
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'autoRoundRank',
            width: 120,
            hidden: roundQuotationFieldHiddenFlag,
          },
          {
            name: 'lastQuotationPrice',
            width: 120,
            hidden: roundQuotationFieldHiddenFlag,
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          },
          {
            name: 'lastValidNetPrice',
            width: 120,
            hidden: roundQuotationFieldHiddenFlag,
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          },
        ],
      },

      {
        header: `${intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuoteInformation`, {
            quotationName,
          })
          .d('{quotationName}信息')}1`,
        name: 'priceInfo', // 单价组
        width: 240,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'currentQuotationSecPrice',
            width: 130,
            hidden: !doubleUnitFlag,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationSecPrice"
                  record={record}
                  // headerRecord={basicFormDS.current}
                  currency="currencyCode"
                  dataSet={quotationLineDS}
                  onChange={() => handleChangeQuotationPrice(record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ value, record }) => {
              const netSecondaryPrice = record.get('netSecondaryPrice');
              const currentValue = numberSeparatorRender(value, currencyPrecision);

              const ZeroWarningFlag =
                caclRule === 'Amount' &&
                isUnTaxPriceFlag &&
                netSecondaryPrice !== 0 &&
                // eslint-disable-next-line eqeqeq
                currentValue == 0;

              return (
                <>
                  {currentValue}
                  <InputNumberZeroTooltipWrap
                    zeroValueVisibleFlag={ZeroWarningFlag}
                    taxFlag={isUnTaxPriceFlag}
                    styleObject={{
                      paddingLeft: '8px',
                    }}
                    currencyPrecision={currencyPrecision}
                  />
                </>
              );
            },
          },
          {
            name: 'netSecondaryPrice',
            width: 130,
            hidden: !doubleUnitFlag,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netSecondaryPrice"
                  record={record}
                  // headerRecord={basicFormDS.current}
                  currency="currencyCode"
                  dataSet={quotationLineDS}
                  onChange={() => handleChangeNetPrice(record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ value, record }) => {
              const currentQuotationSecPrice = record.get('currentQuotationSecPrice');
              const currentValue = numberSeparatorRender(value, currencyPrecision);

              const ZeroWarningFlag =
                caclRule === 'Amount' &&
                !isUnTaxPriceFlag &&
                currentQuotationSecPrice !== 0 &&
                // eslint-disable-next-line eqeqeq
                currentValue == 0;

              return (
                <>
                  {currentValue}
                  <InputNumberZeroTooltipWrap
                    zeroValueVisibleFlag={ZeroWarningFlag}
                    taxFlag={!isUnTaxPriceFlag}
                    styleObject={{
                      paddingLeft: '8px',
                    }}
                    currencyPrecision={currencyPrecision}
                  />
                </>
              );
            },
          },
          {
            name: 'currentQuotationPrice',
            width: 130,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationPrice"
                  record={record}
                  currency="currencyCode"
                  dataSet={quotationLineDS}
                  onChange={() => handleChangeQuotationPrice(record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ value, record }) => {
              const netPrice = record.get('netPrice');
              const currentValue = quotationRemote
                ? quotationRemote.process(
                    'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_CURRENT_PRICE_RENDER',
                    numberSeparatorRender(value, currencyPrecision),
                    {
                      record,
                      basicFormDS,
                    }
                  )
                : numberSeparatorRender(value, currencyPrecision);

              const ZeroWarningFlag =
                caclRule === 'Amount' &&
                isUnTaxPriceFlag &&
                netPrice !== 0 &&
                // eslint-disable-next-line eqeqeq
                currentValue == 0;

              return (
                <>
                  {currentValue}
                  <InputNumberZeroTooltipWrap
                    zeroValueVisibleFlag={ZeroWarningFlag}
                    taxFlag={isUnTaxPriceFlag}
                    styleObject={{
                      paddingLeft: '8px',
                    }}
                    currencyPrecision={currencyPrecision}
                  />
                </>
              );
            },
          },
          {
            name: 'netPrice',
            width: 130,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netPrice"
                  record={record}
                  currency="currencyCode"
                  dataSet={quotationLineDS}
                  onChange={() => handleChangeNetPrice(record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ value, record }) => {
              const currentQuotationPrice = record.get('currentQuotationPrice');

              const currentValue = quotationRemote
                ? quotationRemote.process(
                    'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_NET_PRICE_RENDER',
                    numberSeparatorRender(value, currencyPrecision),
                    {
                      record,
                      basicFormDS,
                    }
                  )
                : numberSeparatorRender(value, currencyPrecision);

              const ZeroWarningFlag =
                caclRule === 'Amount' &&
                !isUnTaxPriceFlag &&
                currentQuotationPrice !== 0 &&
                // eslint-disable-next-line eqeqeq
                currentValue == 0;

              return (
                <>
                  {currentValue}
                  <InputNumberZeroTooltipWrap
                    zeroValueVisibleFlag={ZeroWarningFlag}
                    taxFlag={!isUnTaxPriceFlag}
                    styleObject={{
                      paddingLeft: '8px',
                    }}
                    currencyPrecision={currencyPrecision}
                  />
                </>
              );
            },
          },
          {
            name: 'taxIncludedFlag',
            width: 120,
            editor: (record) => {
              return <CheckBox onChange={(val) => onChangeTaxIncludedFlag(val, record)} />;
            },
          },
          {
            name: 'taxId',
            width: 130,
            align: 'right',
            editor: (record) => {
              return (
                <Lov
                  paramMatcher={({ text }) => {
                    return !isNaN(text) ? { taxRate: text } : { taxCode: text };
                  }}
                  onChange={(val) => changeTax(val, record)}
                />
              );
            },
          },
        ],
      },

      {
        header: `${intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuoteInformation`, { quotationName })
          .d('{quotationName}信息')}4`,
        name: 'quotationHistoryInfo', // 报价日期与历史
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          { name: 'currentExpiryDateFrom', width: 130, editor: true },
          { name: 'currentExpiryDateTo', width: 130, editor: true },
          {
            name: 'freightIncludedFlag',
            width: 130,
            editor: (record) => {
              return (
                <CheckBox
                  onChange={() => {
                    record.set('freightAmount', null);
                  }}
                />
              );
            },
          },
          {
            name: 'freightAmount',
            width: 130,
            editor: (record) => {
              let freightAmountProps = {};
              freightAmountProps = quotationRemote
                ? quotationRemote.process(
                    'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_LINE_TABLE_FREIGHT_AMOUNT_EDITOR_PROPS',
                    freightAmountProps,
                    {
                      quotationLineDS,
                      bidFlag,
                      basicFormDS,
                      record,
                      pageProps: props,
                    }
                  )
                : freightAmountProps;
              freightAmountProps = freightAmountProps || {};

              return (
                <C7nPrecisionInputNumber
                  name="freightAmount"
                  record={record}
                  financial="currencyCode"
                  dataSet={quotationLineDS}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                  {...freightAmountProps}
                />
              );
            },
          },
          { name: 'currentDeliveryCycle', width: 130, editor: true },
          {
            name: 'quotationHistory',
            width: 130,
            renderer: ({ record }) => {
              const { quotationLineStatus, abandonedFlag } = record.get([
                'quotationLineStatus',
                'abandonedFlag',
                'eliminateFlag',
              ]);

              if (abandonedFlag || quotationLineStatus === 'NEW') {
                return;
              }

              const historyProps = {
                record,
                headerDS: basicFormDS,
                organizationId,
                customizeUnitCode: getCustomizeUnitCode('history'),
                quotationName,
                customizeTable,
                doubleUnitFlag,
                disabledViewFlag: quotationLineStatus === 'NEW',
              };

              return <QuotationHistory {...historyProps} />;
            },
          },
          {
            name: 'currentAttachmentUuid',
            width: 150,
            // editor: true,
            editor: (record) => {
              const { abandonedFlag, eliminateFlag } = record.get([
                'abandonedFlag',
                'eliminateFlag',
              ]);
              return (
                <Attachment
                  name="currentAttachmentUuid"
                  record={record}
                  funcType="link"
                  viewOnly={abandonedFlag === 1 || eliminateFlag}
                  viewMode="popup"
                  onUploadSuccess={() => supplierAttachmentChange(record)}
                  onRemove={() => supplierAttachmentChange(record)}
                  className="ssrc-attachment-upload-component"
                />
              );
            },
          },
        ],
      },
    ].filter(Boolean);
    // 二开埋点
    if (!quotationRemote) {
      return columnsArr;
    }
    // 二开 对属性进行加工，返回新属性 第二个参数是标准属性，第三个为需要传递的其他参数 此处没传
    const { columnsArr: newColumnsArr = [] } = quotationRemote.process(
      'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_LINE_COLUMNS',
      { columnsArr },
      {
        quotationLineDS,
        bidFlag,
        initPage,
        handleSaveQuotation,
        basicFormDS,
        handleCancelLadderPrice,
        organizationId,
      }
    );
    return newColumnsArr;
  }, [
    aggregation,
    quotationName,
    RFAFlag,
    bidFlag,
    basicFormDS,
    doubleUnitFlag,
    existBargainedFlag,
    isUnTaxPriceFlag,
    existBargainedFlag,
    quotationLineStatusTableColor,
    getCustomizeUnitCode,
    customizeTable,
    // changeCurrentQuotationPrice,
    // changeTax,
    // onChangeTaxIncludedFlag,
    roundQuotationFieldHiddenFlag,
    currentModal,
    supplierAttachmentChange,
    caclRule,
    currencyPrecision,
    financialPrecision,
    tenantId,
    calcQuotationTableSummaryQuotationLine,
    initPage,
    allPageDisabled,
  ]);

  // 表格筛选器-左
  // const leftRender = useCallback(
  //   (ds) => {
  //     return (
  //       <MutlTextFieldSearch
  //         name="multiItemName"
  //         searchBarDS={ds}
  //         placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称')}
  //       />
  //     );
  //   },
  //   [basicFormDS, aggregation]
  // );

  const batchMaintainFormEffectAmountValue = (data) => {
    let fields = [
      'currentQuotationQuantity',
      'currentQuotationSecQuantity',
      'priceBatchQuantity',
      'currentQuotationPrice',
      'netPrice',
      'currentQuotationSecPrice',
      'netSecondaryPrice',
      'abandonedFlag',
      'taxId',
      'taxIncludedFlag',
      'taxRate',
    ];

    fields = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_LINE_TABLE_BATCH_MAINTAIN_PRICE_RELATIVE_FIELDS',
          fields,
          {
            quotationLineDS,
            bidFlag,
            handleSaveQuotation,
            basicFormDS,
            data,
          }
        )
      : fields;

    let valueExistFlag = false;
    if (!data) {
      return valueExistFlag;
    }

    fields.forEach((field) => {
      const value = data[field];

      if (!isNil(value)) {
        valueExistFlag = true;
      }
    });

    return valueExistFlag;
  };

  // 批量维护-确认
  const confirmBatchMaintain = useCallback(
    throttle(async ({ data, currentData }) => {
      if (isEmpty(data)) {
        return;
      }

      const allEditFlag = Number(isEmpty(quotationLineDS?.selected));
      batchUpdateLines(quotationLineDS, data, allEditFlag, currentData);

      const saveAllPageFlag = batchMaintainFormEffectAmountValue(data);
      if (saveAllPageFlag) {
        handleSaveQuotation();
      }
    }, 1200),
    [
      getCustomizeUnitCode,
      quotationLineDS,
      quotationLineDS.selected,
      dynamicChangePrice,
      handleSaveQuotation,
      updateBatchMaintainCache,
    ]
  );

  // 取消批量维护
  const cancelBatchMaintain = useCallback(() => {
    quotationLineDS.unSelectAll();
    quotationLineDS.clearCachedSelected();
  }, [quotationLineDS]);

  // 批量编辑
  const batchMaintainButton = useCallback(() => {
    const batchProps = {
      customizeForm,
      customizeUnitCode: getCustomizeUnitCode('batchMaintain'),
      successedMaintain: queryQuotationLines,
      title: !quotationLineDS?.selected?.length
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchEditAllData').d('批量编辑全部数据')
        : null,
      text: quotationLineDS?.selected?.length
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')
        : intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
      disabled:
        quotationLineDS.length === 0 || supplierStatus === 'QUOTATION_ABANDONED' || allPageDisabled,
      confirmBatchMaintain: (values) => confirmBatchMaintain(values),
      cancelBatchMaintain,
      quotationLineDS,
      quotationRemote,
      basicFormDS,
      bidFlag,
      organizationId,
      name: 'batch',
    };

    return <BatchMaintain {...batchProps} />;
  }, [
    quotationLineDS,
    quotationLineDS.length,
    quotationLineDS.selected,
    customizeForm,
    getCustomizeUnitCode,
    confirmBatchMaintain,
    cancelBatchMaintain,
    supplierStatus,
    allPageDisabled,
  ]);

  // table advanced query
  const tableSearchQuery = useCallback(
    ({ params = {} }) => {
      const { multiItemName = null, ...others } = params || {};
      quotationLineDS.setQueryParameter('advanced', {
        ...others,
        multiItemName: multiItemName?.length ? multiItemName.join(',') : null,
      });
      queryQuotationLines();
    },
    [quotationLineDS, queryQuotationLines]
  );

  const rightRender = useCallback(() => {
    return (
      <div className={Styles['line-search']}>
        {/* {batchMaintainButton()} */}
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
        >
          <div
            className={!aggregation ? Styles['active-table-wide'] : ''}
            onClick={() => tableCustomAggregrationChange(false)}
            style={{
              width: '24px',
              height: '24px',
              textAlign: 'center',
            }}
          >
            <Icon type="reorder" className={!aggregation ? 'primaryColor' : 'disabled'} />
          </div>
        </Tooltip>
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView').d('聚合表视图')}
        >
          <div
            className={aggregation ? Styles['active-table-wide'] : ''}
            onClick={() => tableCustomAggregrationChange(true)}
            style={{
              width: '24px',
              height: '24px',
              textAlign: 'center',
              marginLeft: '8px',
            }}
          >
            <Icon type="view_day" className={aggregation ? 'primaryColor' : 'disabled'} />
          </div>
        </Tooltip>
      </div>
    );
  }, [aggregation, batchMaintainButton, quotationLineDS.selected]);

  // table onAggregtationChange
  // 表格个性化记录了这个设置， 在下次挂载时会加载这个设置，如果和你传的不一样，会触发onAggregationChange
  const tableCustomAggregrationChange = useCallback(
    async (aggregrationType = false) => {
      setAggregation(aggregrationType);
      if (aggregrationType) {
        quotationLineDS.pageSize = 10;
        quotationLineDS.loadData();
        quotationLineDS.query();
      }

      await quotationLineDS.query();
      await afterQueryLineFetchRank();
    },
    [
      aggregation,
      rollingFetchQuotationListInfo,
      handleFetchQuotationListNewMessage,
      quotationLineDS,
    ]
  );

  // JD-获取报价
  const handleJDQuotation = () => {
    if (!quotationHeaderCurrentId) return;
    const params = {
      organizationId,
      quotationHeaderCurrentId,
    };
    return getJDQuotation(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        // 查询报价行
        queryQuotationLines();
      }
    });
  };

  const getTableButtons = () => {
    let buttons = [
      batchMaintainButton(),
      Number(jdSupplierQuoteFlag) ? (
        <Button
          color="primary"
          funcType="flat"
          icon="play_for_work"
          onClick={handleJDQuotation}
          name="quotation"
        >
          {intl.get('ssrc.supplierQuotation.model.supQuo.getQuotation').d('获取报价')}
        </Button>
      ) : null,
    ];

    buttons = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_LINE_TABLE_BUTTONS',
          buttons,
          {
            ...props,
            bidFlag,
            // initPage,
            basicFormDS,
          }
        )
      : buttons;

    return buttons.filter(Boolean);
  };

  // quotation line table
  const tableContent = useCallback(() => {
    return (
      <SearchBarTable
        clearButton
        searchCode={getCustomizeUnitCode('tableSearch')}
        onQuery={tableSearchQuery}
        fieldProps={{}}
        showLoading={false}
        queryBar="none"
        searchBarConfig={{
          autoQuery: false,
          closeFilterSelector: true, // 不能切换筛选 和新建筛选了
          defaultExpand: false,
          right: {
            render: rightRender,
          },
          onQuery: tableSearchQuery,
        }}
        bordered
        aggregation={aggregation}
        custLoading={custLoading}
        dataSet={quotationLineDS}
        rowKey="quotationLineCurrentId"
        virtual={!aggregation}
        virtualCell={!aggregation}
        // style={{ maxHeight: !aggregation ? 'calc(100vh - 300px)' : '600px' }}
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        columns={columns}
        pagination={
          !aggregation
            ? {
                pageSizeOptions: ['10', '20', '50', '100', '200'],
                // onChange: tablePaginationChange,
              }
            : AggregationPaginations
        }
        onAggregationChange={tableCustomAggregrationChange}
        buttons={getTableButtons()}
      />
    );
  }, [
    aggregation,
    custLoading,
    quotationLineDS,
    quotationLineDS.status,
    quotationLineDS?.length,
    columns,
    tableCustomAggregrationChange,
    tableSearchQuery,
    batchMaintainButton,
    caclRule,
    currencyPrecision,
    financialPrecision,
    isUnTaxPriceFlag,
    tablePaginationChange,
    allPageDisabled,
    financialPrecision,
    currencyPrecision,
    jdSupplierQuoteFlag,
    handleJDQuotation,
    queryQuotationLines,
    quotationHeaderCurrentId,
    organizationId,
  ]);

  return (
    <div className={Styles['quotation-table']}>
      {customizeTable(
        { code: getCustomizeUnitCode('table'), buttonCode: getCustomizeUnitCode('tableButtons') },
        tableContent()
      )}
    </div>
  );
};

const hocComponent = (Com) => {
  return observer(Com);
};

export default hocComponent(QuotationLineTable);
