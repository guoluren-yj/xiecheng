import React, { Component } from 'react';
import { Icon, Button, DataSet, Modal, CheckBox, Lov } from 'choerodon-ui/pro';
import { Popover, Text } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { noop, isEmpty, isNil, isFunction, throttle } from 'lodash';
import { Throttle } from 'lodash-decorators';
import classnames from 'classnames';
import { AutoSizer, List as VList } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { math } from 'choerodon-ui/dataset';

// import { yesOrNoRender } from 'utils/renderer';
import { SRM_SSRC } from '_utils/config';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
// import { getQuantityAndUomCombine } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { priceCompareText } from '@/routes/ssrc/BiddingHall/utils/renders';
import { saveBatchEdit } from '@/services/biddingHallService';
import { getCommonLineStatusColor } from '@/routes/ssrc/BiddingHall/utils/statusColor';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import QuotationDetail from './QuotationDetail';
import BiddingRecord from './BiddingRecord';
import ItemCard from '../../components/ItemCard';
import { BatchEditModal } from '../Modals/BatchEditModal';
import SupplierHeaderBaseInfoLink from './SupplierHeaderBaseInfoLink';
import { cardDataSet } from '../Stores/formDS';
import { batchQuotationModalDataSet } from '../Stores/batchQuotationModalDataSet';
import {
  Collection,
  StatusAlert,
  ItemIcons,
  StatusCheckableTab,
  Timer,
  BidPrice,
  RankTrenkRender,
  TrafficLight,
} from '../../components';
import { customizeSearchTagList } from '../../utils/constants';
import { formatDateTime } from '../../utils/';
import { renderHeanderDeferCountNumber } from '../../components/DeferCountNumber';

import Styles from '../index.less';
import CurrentStyles from './index.less';

const noResult = require('@/assets/no_result.svg');

@observer
class LineTable extends Component {
  constructor(props) {
    super(props);

    if (props?.biddingHallContentRef) {
      props.biddingHallContentRef(this);
    }

    this.statusCheckableTabRef = null;

    this.batchQuotaitonModalDS = new DataSet(batchQuotationModalDataSet());

    this.state = {
      tableHeaderOperateLoading: false,
      // bathPriceVisible: false, // 批量升降价 popover visible
    };
  }

  toggleLoading = (tableHeaderOperateLoading = false) => {
    this.setState({
      tableHeaderOperateLoading,
    });
  };

  @Throttle(1200)
  handleBatchPriceOk = async (data = {}) => {
    let result = null;
    try {
      this.toggleLoading(true);
      result = await saveBatchEdit(data);
      this.toggleLoading(false);
      return result;
    } catch (e) {
      throw e;
    }
  };

  // batch price ok 整单批量出价
  @Throttle(1200)
  batchPriceOk = async () => {
    const {
      initPage = noop,
      headerInfo,
      unitPriceListViewTableSave = noop,
      getCustomizeUnitCode = noop,
      quotationLineDS,
    } = this.props;
    const { current } = this.batchQuotaitonModalDS || {};
    if (!current) {
      return false;
    }

    const {
      rfxLineSupplierId,
      tenantId,
      biddingSupHeaderCurId,
      displayBiddingSupHeaderStatus,
      supplierStatus,
    } = headerInfo || {};

    current.status = 'update';
    const validateFlag = await this.batchQuotaitonModalDS.validate();
    if (!validateFlag || !rfxLineSupplierId) {
      return false;
    }

    const formData = current.toData();
    if (isEmpty(formData)) {
      return false;
    }

    const biddingSupLineCurDTOList = quotationLineDS?.selected?.map((item) => item.toData());

    const data = {
      ...formData,
      rfxLineSupplierId,
      biddingSupHeaderCurId,
      organizationId: tenantId,
      displayBiddingSupHeaderStatus,
      supplierStatus,
      biddingSupLineCurDTOList,
      querys: {
        customizeUnitCode: getCustomizeUnitCode(['unitPriceBatchEdit']),
      },
    };

    // save success
    const batchOkSuccess = () => {
      this.batchPriceModalClose();
      initPage();
    };

    const totalPriceSaveSuccessFlag = await unitPriceListViewTableSave({
      afterSaveApiRefreshPageFlag: 1,
      lineDataEmptySkipSaveAndReturnTrueFlag: 1,
    });
    if (!totalPriceSaveSuccessFlag) {
      return false;
    }

    let result = null;
    try {
      result = await this.handleBatchPriceOk(data);
      const { message, code } = result || {};

      if (code === 'ssrc_batch_direction_price_zero_error' && message) {
        // 处理特定错误
        const newData = Object.assign({}, data, { passFlag: 1 });

        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: message,
          onOk: throttle(async () => {
            result = await this.handleBatchPriceOk(newData);
            result = getResponse(result);
            if (!result) {
              this.batchPriceModalClose();
              return;
            }

            batchOkSuccess();
          }, 1200),
          onClose: this.batchPriceModalClose(),
        });
      } else {
        const newResult = getResponse(result);
        if (!newResult) {
          return false;
        }

        notification.success();
        batchOkSuccess();
      }
    } catch (e) {
      throw e;
    }
  };

  // unit price list table
  @Throttle(1200)
  @action
  tableSearchQuery = async (data) => {
    const { params = {} } = data || {};
    const {
      quotationLineDS,
      unitPriceWholeBatchPriceRecalculateTablePrice,
      unitWholeBatchPriceFlag,
      initPage,
    } = this.props;
    if (!quotationLineDS) {
      return;
    }

    // if (!isEmpty(params)) {
    quotationLineDS.setQueryParameter('advanced', params || {});
    // }

    if (unitWholeBatchPriceFlag) {
      initPage();
      return;
    }

    await quotationLineDS.query();

    // 整单，计算金额
    if (unitPriceWholeBatchPriceRecalculateTablePrice) {
      unitPriceWholeBatchPriceRecalculateTablePrice();
    }
  };

  // unit price detail list
  @Throttle(1200)
  unitPriceDetailViewLisSearchQuery = (params = {}) => {
    const { quotationDetailViewListDS } = this.props;
    if (!quotationDetailViewListDS) {
      return;
    }

    quotationDetailViewListDS.setQueryParameter('advanced', params || {});
    quotationDetailViewListDS.query();
  };

  @Throttle(1000)
  batchPriceModalClose = () => {
    if (!this.batchQuotaitonModalDS) {
      return;
    }

    // this.setState({
    //   bathPriceVisible: false,
    // });
    this.batchQuotaitonModalDS.loadData();
    this.batchQuotaitonModalDS.reset();
  };

  // 单价-批量进行中
  unitPriceBatchProcessFlag = () => {
    const { unitWholeBatchPriceFlag, pageReadOnlyFlag, headerInfo } = this.props;
    const { displayBiddingSupHeaderStatus } = headerInfo || {};

    const flag =
      unitWholeBatchPriceFlag && !pageReadOnlyFlag && displayBiddingSupHeaderStatus !== 'PAUSED';
    return flag;
  };

  /**
   * 单价-整单批量-下载导入模板-按钮显示
   */
  getImportTemplateDownloadVisible = () => {
    const { unitWholeBatchPriceFlag, headerInfo } = this.props;
    const { displayBiddingSupHeaderStatus, supplierStatus } = headerInfo || {};

    const showImportStatus =
      displayBiddingSupHeaderStatus !== 'FINISHED' &&
      displayBiddingSupHeaderStatus !== 'CLOSED' &&
      supplierStatus !== 'PROHIBIT_QUOTATION';

    const flag = unitWholeBatchPriceFlag && showImportStatus;
    return flag;
  };

  /**
   * 基本单价字段名
   *
   * 基本：current_quotation_price、net_price
    辅助：current_quotation_sec_price、net_secondary_price
  */
  getBaseUnitPriceFieldName = (taxFlag = false) => {
    // taxFlag 是参数通过判断取含税字段还是未税字段

    let linePriceField = 'netPrice';

    if (taxFlag) {
      linePriceField = 'currentQuotationPrice';
    }

    return linePriceField;
  };

  // 单价字段名
  getUnitPriceFieldName = (flag = false) => {
    // flag 是参数通过判断取含税字段还是未税字段

    let linePriceField = 'netSecondaryPrice';

    if (flag) {
      linePriceField = 'currentQuotationSecPrice';
    }

    return linePriceField;
  };

  // 金额字段
  getAmountFieldsName = () => {
    const { getTaxOrUntax = noop } = this.props;

    let lineAmountField = 'currentLnTotalAmount'; // 表格-当前行金额
    let currentShowTotalAmountField = 'quotationCurrentTotalAmountValue'; // 实时计算行金额-字段
    let queryQuotationCurrentTotalAmountField = 'qtnTotalAmount'; // 查询的有效当前金额

    // 未税
    if (!getTaxOrUntax()) {
      lineAmountField = 'currentLnNetAmount';
      currentShowTotalAmountField = 'quotationCurrentNetAmountValue';
      queryQuotationCurrentTotalAmountField = 'qtnNetAmount';
    }

    return {
      lineAmountField,
      currentShowTotalAmountField,
      queryQuotationCurrentTotalAmountField,
    };
  };

  // 按照基准价动态计算价格 行金额= (单价/价格批量)*数量
  dynamicChangePrice = (data) => {
    if (!data) {
      return;
    }
    const { headerInfo = {}, caclRule, getTaxOrUntax = noop } = this.props;
    const { defaultPrecision, financialPrecision } = headerInfo || {};
    const { record } = data || {};
    const isTaxPriceFlag = getTaxOrUntax();

    const price = this.getUnitPriceFieldName(isTaxPriceFlag);
    // const { lineAmountField } = this.getAmountFieldsName();

    const {
      [price]: currentPriceValue,
      priceBatchQuantity,
      currentQuotationSecQuantity,
      taxIncludedFlag,
      taxRate,
      taxRateType,
    } = record.get([
      price,
      'priceBatchQuantity',
      'currentQuotationSecQuantity',
      'taxIncludedFlag',
      'taxRate',
      'taxRateType',
    ]);

    const COMMONS = {
      hasTax: isTaxPriceFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const unitPrice = isTaxPriceFlag ? 'taxUnitPrice' : 'netUnitPrice';
    const calcPrice = isTaxPriceFlag ? 'calcNetUnitPrice' : 'calcTaxUnitPrice';
    const setPrice = this.getUnitPriceFieldName(!isTaxPriceFlag);
    // const baseUnitPriceName = this.getBaseUnitPriceFieldName(isTaxPriceFlag); // 基准价的基本单价
    // const unBaseUnitPriceName = this.getBaseUnitPriceFieldName(!isTaxPriceFlag); // 非基准价的基本单价

    // const currentQuantity = !doubleUnitFlag ? rfxQuantity : secondaryQuantity;
    const currentQuantity = currentQuotationSecQuantity; // 竞价大厅暂时没有双单位，先去辅助数量

    COMMONS.quantity = currentQuantity;
    COMMONS.taxRate = taxIncludedFlag ? taxRate ?? 0 : 0;
    COMMONS[unitPrice] = currentPriceValue;

    // 数量不存在，修改计算场景
    if (!currentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    const { [calcPrice]: currentCalcPrice, calcTaxAmount, calcNetAmount } =
      amountCalculation(COMMONS) || {};

    const priceValueObject = {
      [setPrice]: currentCalcPrice,
      // [unBaseUnitPriceName]: currentCalcPrice,
      // [baseUnitPriceName]: currentPriceValue,
      currentLnTotalAmount: calcTaxAmount,
      currentLnNetAmount: calcNetAmount,
    };
    record.set(priceValueObject);
  };

  // 单价-计算报价行数和金额
  @action
  unitPriceAfterQuotatedPriceCalc = (data) => {
    this.dynamicChangePrice(data);
    this.calcQuotationTableSummaryQuotationLine();
    this.calcQuotationTableSummaryQuotationAmount();
  };

  // unit price
  calcQuotationTableSummaryQuotationLine = () => {
    const { headerDS, quotationLineDS, getTaxOrUntax = noop } = this.props;
    const summaryFormDSRecord = headerDS.current;
    if (!summaryFormDSRecord) {
      return;
    }

    const linePriceField = this.getUnitPriceFieldName(getTaxOrUntax());

    const { currentQuotationTotalCount: originCount } = summaryFormDSRecord.get([
      'currentQuotationTotalCount',
    ]);

    let currentCount = 0;

    const calcLineCount = (data) => {
      if (!data?.length) {
        return;
      }

      data.forEach((record) => {
        if (!record) {
          return;
        }

        const originLinePrice = record.getPristineValue(linePriceField);
        const { [linePriceField]: currentLinePrice } = record.get([linePriceField]);

        const priceQuotedFlag = !isNil(currentLinePrice) && isNil(originLinePrice);
        const priceQuotedCancelFlag = !isNil(originLinePrice) && isNil(currentLinePrice);

        if (priceQuotedFlag) {
          currentCount = math.plus(currentCount, 1);
        }

        if (priceQuotedCancelFlag) {
          currentCount = math.minus(currentCount, 1);
        }
      });
    };

    calcLineCount(quotationLineDS);
    calcLineCount(quotationLineDS.cachedModified);

    currentCount = math.plus(currentCount, originCount || 0);

    if (currentCount < 0) {
      currentCount = null;
    }

    summaryFormDSRecord.set({
      currentQuotationTotalCountValue: currentCount,
    });
  };

  // 单价-行金额
  calcQuotationTableSummaryQuotationAmount = () => {
    const { headerDS, quotationLineDS } = this.props;
    const summaryFormDSRecord = headerDS.current;
    if (!summaryFormDSRecord) {
      return;
    }

    const { lineAmountField, currentShowTotalAmountField, queryQuotationCurrentTotalAmountField } =
      this.getAmountFieldsName() || {};

    const { [queryQuotationCurrentTotalAmountField]: originCount } = summaryFormDSRecord.get([
      queryQuotationCurrentTotalAmountField,
    ]);

    let originTotalAmount = 0;
    let currentTotalAmount = 0;

    const calcLineAmount = (data) => {
      if (!data?.length) {
        return;
      }

      data.forEach((record) => {
        if (!record) {
          return;
        }

        const originLineAmount = record.getPristineValue(lineAmountField);
        const currentLineAmount = record.get(lineAmountField);

        originTotalAmount = math.plus(originTotalAmount || 0, originLineAmount || 0);
        currentTotalAmount = math.plus(currentTotalAmount || 0, currentLineAmount || 0);
      });
    };

    calcLineAmount(quotationLineDS);
    calcLineAmount(quotationLineDS.cachedModified);

    let currentQuotationTotalCountValue = math.plus(
      math.minus(currentTotalAmount || 0, originTotalAmount || 0),
      originCount || 0
    );

    if (currentQuotationTotalCountValue < 0) {
      currentQuotationTotalCountValue = null;
    }

    summaryFormDSRecord.set({
      [currentShowTotalAmountField]: currentQuotationTotalCountValue,
    });
  };

  // 价格提示文字
  renderPriceWarning = ({ record }) => {
    const { headerInfo, pageReadOnlyFlag } = this.props;
    const { benchmarkPriceType, biddingQuotationMethod } = headerInfo || {};

    const {
      currentQuotationSecPrice,
      netSecondaryPrice,
      startingBiddingPrice,
      // safePrice,
    } = record.get([
      'currentQuotationSecPrice',
      'netSecondaryPrice',
      'startingBiddingPrice',
      // 'safePrice',
    ]);

    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
    let price = currentQuotationSecPrice; // 含税
    if (!taxFlag) {
      price = netSecondaryPrice;
    }

    if (pageReadOnlyFlag || isNil(price) || isNil(startingBiddingPrice)) {
      return '';
    }

    const biddingPriceValidate =
      biddingQuotationMethod === 'BIDDING' && math.gt(price, startingBiddingPrice);
    const auctionPriceValidate =
      biddingQuotationMethod === 'AUCTION' && math.lt(price, startingBiddingPrice);

    // const biddingSafePriceValidate = math.lt(price, safePrice);
    // const auctionSafePriceValidate = math.gt(price, safePrice);

    const priceCompareTextProps = {
      biddingPriceValidate,
      auctionPriceValidate,
      biddingQuotationMethod,
      // biddingSafePriceValidate,
      // auctionSafePriceValidate,
    };

    const text = priceCompareText(priceCompareTextProps);

    if (!text) {
      return '';
    }

    return (
      <div
        className={classnames(
          CurrentStyles['price-below-start-bidding-priceWrap'],
          CurrentStyles['ssrc-bidding-hall-custom-price-warning-table-inside-wrap']
        )}
      >
        <Icon type="info" style={{ marginRight: '8px', fontSize: '14px' }} />
        <Text>{text}</Text>
      </div>
    );
  };

  // 改变是否含税标识
  handleChangeTaxFlag = (val, record) => {
    if (!val) {
      record.set('taxId', null);
      record.set('taxRate', null);
      record.set({
        taxRateType: null,
      });
    }
    this.unitPriceAfterQuotatedPriceCalc({ record });
  };

  // 改变税率
  changeTax = (data, record) => {
    const { taxRate = null, taxId = null, taxRateType = null } = data || {};
    record.set('taxId', { ...(data || {}), taxId, taxRate });
    record.set({
      taxRateType,
    });
    this.unitPriceAfterQuotatedPriceCalc({ record });
  };

  // 数量
  changeQuantity = async (_, record) => {
    const { handleChangeQuotationQuantity } = this.props;
    await handleChangeQuotationQuantity({ record });
    await this.unitPriceAfterQuotatedPriceCalc({ record });
  };

  // unit price Table column
  getColumns = () => {
    const {
      headerDS,
      doubleUnitFlag = false,
      pageReadOnlyFlag = 0,
      offerPrice = noop,
      quotationStatusColor = noop,
      supplierCollection = noop,
      getCustomizeUnitCode = noop,
      headerInfo,
      getAuctionFlag = noop,
      getBiddingRemainingQuotationCount = noop,
      unitWholeBatchPriceFlag = false,
      remote,
    } = this.props;
    const {
      displayBiddingSupHeaderStatus,
      biddingPausedRealTimeStatus,
      benchmarkPriceType,
      defaultPrecision,
      supplierStatus,
      tenantId,
      isBritishBidTrafficLight,
    } = headerInfo || {};

    const { biddingRemainingCount: headerBiddingRemainingCount } =
      getBiddingRemainingQuotationCount() || {};

    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE'; // 含税标识

    // hidden quotation Field flag
    const hiddenQuotationFieldColumnFlag =
      !displayBiddingSupHeaderStatus ||
      displayBiddingSupHeaderStatus === 'NOT_START' ||
      displayBiddingSupHeaderStatus === 'SIGN_IN' ||
      biddingPausedRealTimeStatus === 'NOT_START' ||
      biddingPausedRealTimeStatus === 'SIGN_IN';

    const operateHiddenFlag =
      unitWholeBatchPriceFlag &&
      (displayBiddingSupHeaderStatus === 'IN_PROGRESS' ||
        displayBiddingSupHeaderStatus === 'PAUSED' ||
        hiddenQuotationFieldColumnFlag ||
        supplierStatus === 'PROHIBIT_QUOTATION');

    const columns = [
      {
        header: intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息'),
        name: 'itemInfoWrap',
        width: 360,
        aggregation: true,
        aggregationLimit: 4,
        lock: 'left',
        align: 'left',
        tooltip: 'none',
        children: [
          {
            name: 'itemInfos',
            width: 360,
            tooltip: 'none',
            renderer: ({ record }) => {
              const {
                itemName = '',
                displayBiddingSupLineStatus,
                displayBiddingSupLineStatusMeaning,
                collectionFlag,
                specs,
                quotationOrderType,
                lineItemSerialNumber,
              } = record.get([
                'itemName',
                'displayBiddingSupLineStatus',
                'displayBiddingSupLineStatusMeaning',
                'collectionFlag',
                'specs',
                'quotationOrderType',
                'lineItemSerialNumber',
              ]);
              const { backgroundColor, color } =
                getCommonLineStatusColor(displayBiddingSupLineStatus) || {};
              const colorStyles = {
                color,
                backgroundColor,
              };

              return (
                <div className={Styles['table-line-item-wrap']}>
                  <div className={Styles['table-line-item-icon-number']}>
                    {quotationOrderType === 'PARALLEL' ? (
                      <ItemIcons
                        quotationOrderType={quotationOrderType}
                        status={displayBiddingSupLineStatus}
                      />
                    ) : (
                      <div className={Styles['table-line-item-symbol']} style={colorStyles}>
                        {lineItemSerialNumber ?? '1'}
                      </div>
                    )}
                  </div>

                  <div style={{ width: 'calc(100% - 30px)' }}>
                    <div className={Styles['table-line-item-code-name-line-wrap']}>
                      <div className={Styles['table-line-item-code-name']}>
                        <Popover placement="bottomLeft" content={itemName}>
                          {itemName || ''}
                        </Popover>
                      </div>
                      <div className={Styles['table-line-item-status']}>
                        {!unitWholeBatchPriceFlag
                          ? quotationStatusColor({
                              status: displayBiddingSupLineStatus,
                              statusMeaning: displayBiddingSupLineStatusMeaning,
                              currentStyles: {
                                height: '18px',
                                lineHeight: '18px',
                              },
                            })
                          : ''}
                      </div>
                      <Collection
                        // visibleFlag={collectionFlag}
                        // readOnly={pageReadOnlyFlag}
                        record={record}
                        collectionFlag={collectionFlag}
                        handleCollection={supplierCollection}
                        querys={{
                          customizeUnitCode: getCustomizeUnitCode([
                            'unitPriceTable',
                            'unitPriceTableSearch',
                          ]),
                        }}
                        styles={{
                          lineHeight: 1,
                        }}
                      />
                    </div>
                    <div className={Styles['table-line-item-code-name-specs']}>
                      <Popover content={specs || '-'} placement="bottomLeft">
                        {specs || '-'}
                      </Popover>
                    </div>
                  </div>
                </div>
              );
            },
          },
        ],
      },
      {
        header: intl.get('ssrc.common.quantityAndUomCombine').d('数量-单位'),
        name: 'quantityAndName',
        width: 240,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'uomName',
            width: 240,
            renderer: ({ record }) => {
              const { rfxQuantity, secondaryQuantity, uomName, secondaryUomName } = record.get([
                'rfxQuantity',
                'secondaryQuantity',
                'uomName',
                'secondaryUomName',
              ]);

              let quantity = rfxQuantity;
              let name = uomName;
              if (doubleUnitFlag) {
                quantity = secondaryQuantity;
                name = secondaryUomName;
              }
              const formatQuantity = numberSeparatorRender(quantity);
              const currentValue =
                !isNil(quantity) && name
                  ? `${formatQuantity}-${name}`
                  : formatQuantity || name || '';

              return currentValue;
            },
          },
        ],
      },
      // {
      //   header: intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
      //   name: 'startingBiddingPriceWrap',
      //   // width: 160,
      //   align: 'left',
      //   aggregation: true,
      //   aggregationLimit: 4,
      //   children: [
      //     {
      //       name: 'startingBiddingPrice',
      //       // width: 160,
      //       renderer: ({ value }) => {
      //         return numberSeparatorRender(value);
      //       },
      //     },
      //   ],
      // },
      {
        name: 'startingBiddingPrice',
        width: 160,
        hidden: isBritishBidTrafficLight === 1,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }

          return numberSeparatorRender(value);
        },
      },
      {
        name: 'quotationRange',
        width: 160,
        renderer: ({ value, record }) => {
          if (isNil(value)) {
            return '';
          }

          const floatType = record?.get('floatType');
          if (isNil(value)) {
            return '';
          }

          let currentQuotationRangeValue = numberSeparatorRender(value);
          if (floatType === 'ratio') {
            currentQuotationRangeValue += '%';
          }

          return currentQuotationRangeValue;
        },
      },
      {
        header: intl.get('ssrc.biddingHall.model.predicate').d('预计'),
        name: 'predicateWrap',
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        hidden: unitWholeBatchPriceFlag,
        children: [
          {
            name: 'estimatedStartDate',
            width: 160,
            renderer: ({ value, record }) => {
              const { estimatedStartOrEndFlag } = record.get(['estimatedStartOrEndFlag']);
              if (isNil(value)) {
                return;
              }

              const formatted = formatDateTime({
                dateTime: value,
              });

              const suffix = estimatedStartOrEndFlag
                ? intl.get('hzero.common.text.startEvent').d('开始')
                : intl.get('hzero.common.text.endEvent').d('结束');
              const renders = formatted ? `${formatted} ${suffix}` : '';

              return <span style={{ fontSize: '12px' }}>{renders}</span>;
            },
          },
          displayBiddingSupHeaderStatus !== 'NOT_START' ||
          displayBiddingSupHeaderStatus !== 'SIGN_IN'
            ? {
                name: 'supplierDeferCount',
                width: 160,
                hidden:
                  displayBiddingSupHeaderStatus === 'NOT_START' ||
                  displayBiddingSupHeaderStatus === 'SIGN_IN',
                renderer: ({ value }) => {
                  if (!value) {
                    return '';
                  }
                  return intl
                    .get('ssrc.biddingHall.model.deferCountNumber', { deferCount: value })
                    .d('{deferCount}次延时');
                },
              }
            : false,
        ],
      },
      {
        name: 'biddingMethod',
        header: getAuctionFlag()
          ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        width: 200,
        hidden: hiddenQuotationFieldColumnFlag || isBritishBidTrafficLight === 1,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'lowestQuotationPrice',
            width: 160,
            renderer: ({ value, record }) => {
              if (isNil(value) || isBritishBidTrafficLight === 1) {
                return '';
              }

              const displayBiddingSupLineStatus = record.get('displayBiddingSupLineStatus');

              if (displayBiddingSupLineStatus === 'NOT_START') {
                return (
                  <span className={Styles['unit-price-table-line-not-start-warning']}>
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.lineNotStartPleaseWaiting`)
                      .d('尚未开始,请耐心等待')}
                  </span>
                );
              }

              return (
                <span className={Styles['table-line-price-lowest']}>
                  {numberSeparatorRender(value)}
                </span>
              );
            },
          },
          {
            name: 'lowestDisplaySupplierName',
            width: 160,
            renderer: ({ value }) => {
              if (isNil(value)) {
                return '';
              }

              return <span className={Styles['table-line-supplier-name']}>{value}</span>;
            },
          },
        ],
      },
      {
        name: 'rankWrap',
        hidden: hiddenQuotationFieldColumnFlag,
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.myQuotaitons').d('我的报价'),
        width: 160,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'biddingQuotationRank',
            width: 160,
            renderer: ({ value, record }) => {
              if (!value) {
                return '';
              }

              let rankDomProperty = {};
              rankDomProperty = remote
                ? remote?.process(
                    'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BIDDING_HALL_BIDDING_QUOTATION_RANK_DOM',
                    rankDomProperty,
                    { that: this, record }
                  )
                : rankDomProperty;
              rankDomProperty = rankDomProperty || {};

              return (
                <span {...rankDomProperty}>
                  {isBritishBidTrafficLight !== 1 ? (
                    <span>
                      {intl
                        .get('ssrc.inquiryHall.model.inquiryHall.theRankLevel', { rank: value })
                        .d('第{rank}名')}
                      <RankTrenkRender record={record} />
                    </span>
                  ) : (
                    <TrafficLight record={record} />
                  )}
                </span>
              );
            },
          },
          {
            name: 'displayQuotationPrice',
            width: 160,
            renderer: ({ value, record }) => {
              if (isNil(value)) {
                return '';
              }

              let rankDomProperty = {};
              rankDomProperty = remote
                ? remote?.process(
                    'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BIDDING_HALL_BIDDING_QUOTATION_DISPLAY_QUOTATION_PRICE_DOM',
                    rankDomProperty,
                    { that: this, record }
                  )
                : rankDomProperty;
              rankDomProperty = rankDomProperty || {};

              return (
                <span className={Styles['ssrc-bidding-hall-common-text-3']} {...rankDomProperty}>
                  {numberSeparatorRender(value)}
                </span>
              );
            },
          },
        ],
      },
      {
        name: 'currentQuotationSecPrice',
        width: 250,
        minWidth: 250,
        // resizable: false,
        lock: 'right',
        align: 'left',
        hidden:
          !unitWholeBatchPriceFlag ||
          hiddenQuotationFieldColumnFlag ||
          displayBiddingSupHeaderStatus === 'PAUSED' ||
          pageReadOnlyFlag ||
          !taxFlag,
        // editor: taxFlag,
        renderer: ({ record, value }) => {
          if (!unitWholeBatchPriceFlag || hiddenQuotationFieldColumnFlag || !taxFlag) {
            return numberSeparatorRender(value);
          }

          const PriceCommonProps = {
            record,
            pageReadOnlyFlag,
            headerInfo,
            headerDS,
            // disabledSubmitFlag: lineDisabledFlag,
            currentPrecision: defaultPrecision,
            newLine: true,
            afterQuotatedPriceCalc: this.unitPriceAfterQuotatedPriceCalc,
            allBidPriceDisabled: headerBiddingRemainingCount === 0,
            changePriceCancelCalculateFlag: 0,
            // baseCurrentPriceCalculateNewPrice: 1,
            showInputPrefixFlag: 0,
            innerTable: 1,
          };

          return (
            <div>
              <BidPrice
                name="currentQuotationSecPrice"
                validField="validQuotationSecPrice"
                {...PriceCommonProps}
              />

              {this.renderPriceWarning({ record })}
            </div>
          );
        },
      },
      {
        name: 'netSecondaryPrice',
        width: 250,
        lock: 'right',
        align: 'left',
        minWidth: 250,
        // resizable: false,
        hidden:
          !unitWholeBatchPriceFlag ||
          hiddenQuotationFieldColumnFlag ||
          displayBiddingSupHeaderStatus === 'PAUSED' ||
          pageReadOnlyFlag ||
          taxFlag,
        // editor: !taxFlag,
        renderer: ({ record, value }) => {
          if (!unitWholeBatchPriceFlag || hiddenQuotationFieldColumnFlag || taxFlag) {
            return numberSeparatorRender(value);
          }

          const PriceCommonProps = {
            record,
            pageReadOnlyFlag,
            headerInfo,
            headerDS,
            // disabledSubmitFlag: lineDisabledFlag,
            currentPrecision: defaultPrecision,
            newLine: true,
            afterQuotatedPriceCalc: this.unitPriceAfterQuotatedPriceCalc,
            allBidPriceDisabled: headerBiddingRemainingCount === 0,
            changePriceCancelCalculateFlag: 0,
            // baseCurrentPriceCalculateNewPrice: 1,
            showInputPrefixFlag: 0,
            innerTable: 1,
          };

          return (
            <div>
              <BidPrice
                name="netSecondaryPrice"
                validField="validNetSecondaryPrice"
                {...PriceCommonProps}
              />

              {this.renderPriceWarning({ record })}
            </div>
          );
        },
      },
      {
        name: 'taxIncludedFlag',
        width: 120,
        editor: (record) => {
          return <CheckBox onChange={(val) => this.handleChangeTaxFlag(val, record)} />;
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
              onChange={(val) => this.changeTax(val, record)}
            />
          );
        },
      },
      {
        name: 'currentQuotationSecQuantity',
        width: 140,
        hidden:
          !unitWholeBatchPriceFlag ||
          hiddenQuotationFieldColumnFlag ||
          displayBiddingSupHeaderStatus === 'PAUSED' ||
          pageReadOnlyFlag,
        editor: (record) => {
          if (!unitWholeBatchPriceFlag || hiddenQuotationFieldColumnFlag) {
            return false;
          }
          // todo 双单位 uomId
          return (
            <C7nPrecisionInputNumber
              record={record}
              uom="secondaryUomId"
              name="currentQuotationSecQuantity"
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
              onChange={(val) => this.changeQuantity(val, record)}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'currentExpiryDateFrom',
        width: 130,
        editor: unitWholeBatchPriceFlag && !hiddenQuotationFieldColumnFlag,
        hidden:
          !unitWholeBatchPriceFlag ||
          hiddenQuotationFieldColumnFlag ||
          displayBiddingSupHeaderStatus === 'PAUSED' ||
          pageReadOnlyFlag,
      },
      {
        name: 'currentExpiryDateTo',
        width: 130,
        editor: unitWholeBatchPriceFlag && !hiddenQuotationFieldColumnFlag,
        hidden:
          !unitWholeBatchPriceFlag ||
          hiddenQuotationFieldColumnFlag ||
          displayBiddingSupHeaderStatus === 'PAUSED' ||
          pageReadOnlyFlag,
      },
      {
        name: 'priceBatchQuantity',
        width: 130,
      },
      {
        name: 'operate',
        width: 60,
        lock: 'right',
        hidden: operateHiddenFlag,
        renderer: ({ record }) => {
          const displayBiddingSupLineStatus = record.get('displayBiddingSupLineStatus');
          if (!displayBiddingSupLineStatus || unitWholeBatchPriceFlag) {
            return '-';
          }

          const lineDisabledFlag =
            displayBiddingSupLineStatus && displayBiddingSupLineStatus !== 'IN_PROGRESS';

          const text =
            pageReadOnlyFlag || lineDisabledFlag
              ? intl.get(`ssrc.inquiryHall.view.message.button.detail`).d('详情')
              : intl.get('ssrc.biddingHall.model.quotationPrice').d('出价');

          return (
            <div className={Styles['ellipsis-word']} onClick={() => offerPrice(record)}>
              <a>{text}</a>
            </div>
          );
        },
      },
    ].filter(Boolean);

    return remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BIDDING_HALL_CONTENT_TABLE_COLUMNS',
          columns,
          { headerInfo, hiddenQuotationFieldColumnFlag }
        )
      : columns;
  };

  // 整单批量出价 导入成功后
  unitPriceWholeImportSuccess = () => {
    const { initPage } = this.props;

    if (initPage) {
      initPage({
        unitPriceListViewTableAutoCalcFlag: 0, // 导入不需要计算表格的金额总计
      });
    }
  };

  // 打开批量编辑弹框
  handleOpenBatchEdit = (Props) => {
    const { headerInfo, unitPriceLineFloatType } = this.props;

    this.batchQuotaitonModalDS.setState('headerInfo', headerInfo);

    const defaultData = { floatType: unitPriceLineFloatType };
    this.batchQuotaitonModalDS.loadData([defaultData]);
    BatchEditModal(Props);
  };

  // 单价-列表视图表格-buttons
  unitPriceTableButtons = () => {
    const {
      organizationId,
      headerInfo,
      pageReadOnlyFlag,
      pageLoading,
      pageOperationLoading,
      quotationLineDS,
      customizeForm = noop,
      getCustomizeUnitCode = noop,
      remote,
    } = this.props;
    const { tableHeaderOperateLoading } = this.state;
    const { biddingRemainingQuotationCount, biddingSupHeaderCurId } = headerInfo || {};

    const unitPriceBatchPriceProcessVisibleFlag = this.unitPriceBatchProcessFlag();
    const importTemplateDownloadVisible = this.getImportTemplateDownloadVisible();

    const contentProps = {
      headerInfo,
      customizeForm,
      ds: quotationLineDS,
      batchQuotaitonModalDS: this.batchQuotaitonModalDS,
      onClose: this.batchPriceModalClose,
      onOk: this.batchPriceOk,
      code: getCustomizeUnitCode('unitPriceBatchEdit'),
      remote,
    };

    const ImportProps = {
      businessObjectTemplateCode: 'SRM_C_SSRC_BIDDING_HALL_SUP_BIDDING_LINE_IMPORT',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
        organizationId,
        biddingSupHeaderCurId,
        templateCode: 'SRM_C_SSRC_BIDDING_HALL_SUP_BIDDING_LINE_IMPORT',
        fromExport: true,
      },
      buttonProps: {
        icon: 'archive',
        funcType: 'flat',
        color: 'primary',
        disabled: pageLoading || !biddingSupHeaderCurId || pageOperationLoading,
        loading: tableHeaderOperateLoading,
      },
      buttonText: intl.get(`ssrc.inquiryHall.view.button.import`).d('导入'),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      customeImportTemplate: {
        templateCode: 'SRM_C_SSRC_BIDDING_HALL_SUP_BIDDING_LINE_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/bidding/sup/line/cur/export?biddingSupHeaderCurId=${biddingSupHeaderCurId}`,
        queryParams: { biddingSupHeaderCurId },
        queryArea: { fillerType: 'multi-sheet', async: false },
        method: 'GET',
      },
      auto: true,
      successCallBack: this.unitPriceWholeImportSuccess,
      name: 'import',
    };

    const buttons = [
      unitPriceBatchPriceProcessVisibleFlag ? (
        // <Popover
        //   name="batch"
        //   trigger="click"
        //   // title={
        //   //   biddingQuotationMethod === 'BIDDING'
        //   //     ? intl.get('ssrc.biddingHall.view.title.batchDesPriceQuotation').d('批量降价')
        //   //     : intl.get('ssrc.biddingHall.view.title.batchInscPriceQuotation').d('批量升价')
        //   // }
        //   content={<BatchQuotationPrice {...contentProps} />}
        //   placement="right"
        //   visible={bathPriceVisible}
        //   onVisibleChange={this.batchQuotationPopoverVisible}
        //   overlayStyle={{
        //     width: '291px',
        //     // padding: '20px', // 这个边距会导致箭头的位置异常显示
        //   }}
        // >
        <Button
          name="batch"
          icon="edit_note"
          // funcType="link"
          disabled={
            biddingRemainingQuotationCount === 0 ||
            pageReadOnlyFlag ||
            pageLoading ||
            !biddingSupHeaderCurId ||
            pageOperationLoading
          }
          loading={tableHeaderOperateLoading}
          onClick={() => this.handleOpenBatchEdit(contentProps)}
        >
          {/* {biddingQuotationMethod === 'BIDDING'
              ? intl.get('ssrc.biddingHall.view.title.batchDesPriceQuotation').d('批量降价')
              : ''}
            {biddingQuotationMethod === 'AUCTION'
              ? intl.get('ssrc.biddingHall.view.title.batchInscPriceQuotation').d('批量升价')
              : ''} */}
          {quotationLineDS?.selected?.length
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')
            : intl.get('ssrc.supplierQuotation.view.button.batchMaintenance').d('批量维护')}
        </Button>
      ) : // </Popover>
      null,
      importTemplateDownloadVisible ? <CommonImportNew {...ImportProps} /> : null,
    ].filter(Boolean);

    return buttons;
  };

  renderStatusAlert = () => {
    const {
      remote,
      headerInfo,
      totalPriceFlag,
      detailViewFormDS,
      japOrDutchBiddingTotalPrice = noop,
      japanBiddingTotalPrice,
    } = this.props;
    const {
      displayBiddingSupHeaderStatus,
      displayBiddingSupHeaderStatusMeaning,
      actionProcessRemark,
      biddingTrialBiddingFlag,
      trialBiddingQueryFlag,
      supplierStatus,
      prohibitQuotationDate,
      prohibitProcessExternalRemark,
      biddingRoundSupplierStatus,
      currentBiddingRoundNumber,
      biddingEliminateRoundNumber,
    } = headerInfo || {};

    if (!displayBiddingSupHeaderStatus) {
      return '';
    }

    const { current: formCurrent } = detailViewFormDS || {};
    const {
      biddingSupplierPriceSubmitFlag, // 补充单价已提交
      biddingSupplementPriceRunningFlag,
      displayQuotationPrice,
    } = formCurrent
      ? formCurrent.get([
          'biddingSupplierPriceSubmitFlag',
          'biddingSupplementPriceRunningFlag',
          'displayQuotationPrice',
        ])
      : {};

    // 补充单价已开始，但未报价标识
    const supplierSupplementStartAndNotQuoted =
      !isNil(displayQuotationPrice) &&
      !biddingSupplierPriceSubmitFlag &&
      biddingSupplementPriceRunningFlag === 1;

    let wrapStyles = {};
    if (totalPriceFlag) {
      wrapStyles = {
        marginBottom: '16px',
      };
    }

    const alertProps = {
      remote,
      supplierStatus,
      prohibitQuotationDate,
      prohibitProcessExternalRemark,
      displayBiddingSupHeaderStatus,
      displayBiddingSupHeaderStatusMeaning,
      actionProcessRemark,
      biddingTrialBiddingFlag,
      trialBiddingQueryFlag,
      wrapStyles,
      supplierSupplementStartAndNotQuoted,
      biddingRoundSupplierStatus,
      currentBiddingRoundNumber,
      biddingEliminateRoundNumber,
      japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice,
    };

    return <StatusAlert {...alertProps} />;
  };

  // table search bar - 自定义查询状态
  tableQueryBarStatusTabSetQuerys = (data) => {
    const { offerPriceViewFlag, quotationLineDS, quotationDetailViewListDS } = this.props;
    const { status } = data || {};
    const values = {};

    if (!isEmpty(status)) {
      status.forEach((field) => {
        if (!field) {
          return;
        }

        values[field] = 1;
      });
    }

    if (!offerPriceViewFlag) {
      quotationLineDS.setQueryParameter('tagCheckedStatus', values);
    } else {
      quotationDetailViewListDS.setQueryParameter('tagCheckedStatus', values);
    }
  };

  // table search bar - 自定义查询状态 改变后触发查询
  tableQueryBarStatusTabChange = (data = {}) => {
    const {
      offerPriceViewFlag,
      quotationLineDS,
      quotationDetailViewListDS,
      unitWholeBatchPriceFlag,
      initPage,
    } = this.props;
    this.tableQueryBarStatusTabSetQuerys(data);

    if (!offerPriceViewFlag) {
      const advanced = quotationLineDS.getQueryParameter('advanced');
      if (data?.clearType === 'allClear' && advanced && !isEmpty(advanced)) {
        // 点击筛选器扫把按钮代表全部清除，只走筛选器自动查询方法
        return;
      }
      if (unitWholeBatchPriceFlag) {
        initPage();
        return;
      }
      quotationLineDS.query();
    } else {
      quotationDetailViewListDS.loadData(); // 虚拟滚动需要触发一次重绘
      quotationDetailViewListDS.query();
    }
  };

  // query bar ref
  setStatusCheckableTabRef = (node = {}) => {
    this.statusCheckableTabRef = node;
  };

  // status tag list
  getCurrentStatusList = () => {
    const { unitWholeBatchPriceFlag } = this.props;

    let statusList = customizeSearchTagList();

    if (unitWholeBatchPriceFlag) {
      if (!isEmpty(statusList)) {
        statusList = statusList.filter((item) => item?.value !== 'queryLineStatusInProgressFlag');
      }
    }

    return statusList;
  };

  // left render query
  leftRender = (ds) => {
    const { quotationLineDS, offerPriceViewFlag, remote } = this.props;

    const statusList = this.getCurrentStatusList();

    const searchProps = {
      quotationLineDS,
      ds,
      statusList,
      tableQueryBarStatusTabChange: this.tableQueryBarStatusTabChange,
      dsOnlyClearStatusQuerryParam: this.tableQueryBarStatusTabSetQuerys,
      onRef: this.setStatusCheckableTabRef,
    };

    let cuxDomAfterStatusTab = "";
    cuxDomAfterStatusTab = remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BIDDING_HALL_FILTER_LEFT_RENDER_AFTER_STATUS_TAB_CUX',
          cuxDomAfterStatusTab,
          {
            that: this,
          }
        )
      : cuxDomAfterStatusTab;

    return (
      <div className={Styles['supplier-bidding-hall-body-content-detail-search-header-wrap']}>
        {offerPriceViewFlag ? (
          <div
            className={
              Styles['supplier-bidding-hall-body-content-detail-search-header-filter-label']
            }
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.filterSupplier`).d('筛选')}
          </div>
        ) : (
          ''
        )}
        <StatusCheckableTab {...searchProps} />
        {cuxDomAfterStatusTab}
      </div>
    );
  };

  // search bar clear query
  unitPriceListTableSearchClear = () => {
    const { clearCheckTag } = this.statusCheckableTabRef || {};

    if (isFunction(clearCheckTag)) {
      clearCheckTag();
    }
  };

  // 虚拟滚动 - 每个卡片内容
  renderList = ({ key, index, style }) => {
    const {
      headerInfo,
      quotationStatusColor,
      unitPriceDetailViewListDataSelected = noop,
      biddingSupLineCurId,
      quotationDetailViewListDS,
      remote,
      customizeCommon,
      getCustomizeUnitCode,
    } = this.props;

    const record = quotationDetailViewListDS?.records?.[index];
    if (!record) return '';

    const currentCardData = record.toData() || {};

    const cardDS = new DataSet(cardDataSet());
    if (!cardDS?.current) {
      cardDS.create(currentCardData, 0);
    }

    const cardItemProps = {
      customizeCommon,
      getCustomizeUnitCode,
      cardDS,
    };

    return (
      <div key={key} style={style}>
        <ItemCard
          headerInfo={headerInfo}
          record={record}
          biddingSupLineCurId={biddingSupLineCurId}
          handleItemSelected={unitPriceDetailViewListDataSelected}
          quotationStatusColor={quotationStatusColor}
          remote={remote}
          {...cardItemProps}
        />
      </div>
    );
  };

  // 获取对应的报价剩余次数
  getCurrentStageBiddingRemainQuotationCount = (data) => {
    const { getBiddingRemainingQuotationCount } = this.props;

    let currentStageBiddingRemainQuotationCount = null;
    if (getBiddingRemainingQuotationCount) {
      const { biddingRemainingCount: count } = getBiddingRemainingQuotationCount(data);
      currentStageBiddingRemainQuotationCount = count;
    }

    return currentStageBiddingRemainQuotationCount;
  };

  // 竞价大厅详情
  renderPriceDetail = () => {
    const {
      // getCustomizeUnitCode,
      quotationDetailViewListDS,
      totalPriceFlag,
      headerInfo,
      // tooltip,
      unitPriceFlag,
      countDownTimerOver,
      countDownShowAllZeroFlag = 0,
      initPage,
      japOrDutchBiddingTotalPrice = noop,
    } = this.props;
    const { rfxLineItemCount } = headerInfo || {};
    const { length: listLength = 0 } = quotationDetailViewListDS || {};

    const japanDutchTotalPrice = japOrDutchBiddingTotalPrice();
    const BiddingRecordProps = this.props || {};
    const QuotationDetailProps = {
      ...BiddingRecordProps,
      japanDutchTotalPrice,
      renderStatusAlert: this.renderStatusAlert,
      getCurrentStageBiddingRemainQuotationCount: this.getCurrentStageBiddingRemainQuotationCount,
      unitPriceAfterQuotatedPriceCalc: this.unitPriceAfterQuotatedPriceCalc,
    };

    // 查询完毕且数据为空
    const fetchAndEmptyDataFlag = !listLength && quotationDetailViewListDS.status !== 'loading';

    // const LeftEmptyFlag = rfxLineItemCount < 2 || totalPriceFlag;
    const UnitPriceItemMoreThanOne = rfxLineItemCount > 1 && unitPriceFlag;

    let currentProgressRecord = null;
    if (listLength > 1 && unitPriceFlag) {
      currentProgressRecord = quotationDetailViewListDS.find(
        (r) => r.get('displayBiddingSupLineStatus') === 'IN_PROGRESS'
      );

      if (currentProgressRecord) {
        currentProgressRecord = currentProgressRecord?.toData?.() || null;
      }
    }

    return (
      <div
        className={classnames(Styles['supplier-bidding-hall-body-content-detail-wrap'], {
          [Styles['supplier-bidding-hall-body-content-detail-total-wrap']]: !!totalPriceFlag,
        })}
      >
        <div
          className={classnames(Styles['supplier-bidding-hall-body-content-detail-card-wrap'], {
            [Styles[
              'supplier-bidding-hall-body-content-detail-card-total-price-wrap'
            ]]: totalPriceFlag,
          })}
        >
          {UnitPriceItemMoreThanOne ? (
            <div
              className={Styles['supplier-bidding-hall-body-content-detail-left-list']}
              id="scroll-list-content"
            >
              <div
                className={classnames(
                  Styles['supplier-bidding-hall-body-content-detail-search-bar']
                )}
              >
                {this.leftRender(quotationDetailViewListDS)}
              </div>
              {listLength ? (
                <div
                  className={classnames(
                    Styles['supplier-bidding-hall-body-content-detail-item-list']
                  )}
                >
                  <div style={{ overflow: 'hidden', width: 0, height: 0 }}>
                    <Timer
                      visibleFlag={!!currentProgressRecord}
                      headerRecordData={currentProgressRecord}
                      data={currentProgressRecord}
                      headerInfo={headerInfo}
                      type="line"
                      totalPriceFlag={totalPriceFlag}
                      unitPriceFlag={unitPriceFlag}
                      // prefixRender={prefixRender}
                      totalPriceLineFlag={false}
                      wrapClass={Styles['line-date-time-wrap']}
                      labelClass={Styles['bidding-time-line-render-label']}
                      valueClass={Styles['bidding-time-line-render-value']}
                      countDownTimerOver={countDownTimerOver}
                      initPage={initPage}
                      countDownShowAllZeroFlag={countDownShowAllZeroFlag}
                    />
                  </div>
                  <AutoSizer>
                    {({ width, height }) => (
                      <VList
                        height={height}
                        rowCount={quotationDetailViewListDS?.length || 0}
                        rowHeight={110} // 高度是item-name的css高度
                        rowRenderer={(p) => this.renderList(p)}
                        width={width}
                      />
                    )}
                  </AutoSizer>
                </div>
              ) : fetchAndEmptyDataFlag ? (
                <div
                  className={
                    Styles['supplier-bidding-hall-body-content-detail-item-list-empty-wrap']
                  }
                >
                  <div
                    className={
                      Styles['supplier-bidding-hall-body-content-detail-item-list-empty-content']
                    }
                  >
                    <img src={noResult} alt="no result" />
                    <div
                      className={
                        Styles[
                          'supplier-bidding-hall-body-content-detail-item-list-empty-wrap-text'
                        ]
                      }
                    >
                      {intl.get('hzero.common.message.data.none').d('暂无数据')}
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )}
          <div
            className={classnames(Styles['supplier-bidding-hall-body-content-detail-middle-form'], {
              [Styles[
                'supplier-bidding-hall-body-content-detail-only-middle-right-flag'
              ]]: !UnitPriceItemMoreThanOne,
            })}
          >
            <QuotationDetail {...QuotationDetailProps} />
          </div>
          <div className={Styles['supplier-bidding-hall-body-content-detail-right-table']}>
            <BiddingRecord {...BiddingRecordProps} />
          </div>
        </div>
      </div>
    );
  };

  // 单价报价列表
  renderPriceTable = () => {
    const {
      custLoading,
      getCustomizeUnitCode = noop,
      customizeTable,
      quotationLineDS,
      headerInfo,
      unitPriceListViewTableOnPagination = noop,
      // offerPriceViewFlag = 0,
      unitWholeBatchPriceFlag = 0,
      remote,
      setUnitPriceWholeTableSearchBarRef = noop,
    } = this.props;

    if (isEmpty(headerInfo)) {
      return '';
    }

    let maxHeightCurrent = 'calc(100vh - 260px)';
    if (unitWholeBatchPriceFlag) {
      maxHeightCurrent = 'calc(100vh - 260px - 56px)';
    }

    let searchBarTableProps = {
      searchBarConfig: {
        autoQuery: false,
        checkDataSetStatus: false,
        // closeFilterSelector: true, // 不能切换筛选 和新建筛选了
        // defaultExpand: false,
        onQuery: (param) => this.tableSearchQuery(param),
        left: {
          render: (_, ds) => this.leftRender(ds),
        },
        defaultExpand: false,
        onClear: this.unitPriceListTableSearchClear,
      },
      searchBarRef: setUnitPriceWholeTableSearchBarRef,
    };
    searchBarTableProps = remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BIDDING_HALL_CONTENT_TABLE_SEARCH_BAR_CONFIG',
          searchBarTableProps,
          { that: this }
        )
      : searchBarTableProps;
    searchBarTableProps = searchBarTableProps || {};

    return (
      <div className={classnames(Styles['ssrc-bidding-hall-content-card-wrap'])}>
        {customizeTable(
          {
            code: getCustomizeUnitCode('unitPriceTable'),
            buttonCode: getCustomizeUnitCode('unitPriceTableBtns'),
          },
          <SearchBarTable
            clearButton
            searchCode={getCustomizeUnitCode('unitPriceTableSearch')}
            // onQuery={this.tableSearchQuery}
            fieldProps={{}}
            showLoading={false}
            queryBar="none"
            // searchBarConfig={{
            //   autoQuery: false,
            //   checkDataSetStatus: false,
            //   // closeFilterSelector: true, // 不能切换筛选 和新建筛选了
            //   // defaultExpand: false,
            //   onQuery: (param) => this.tableSearchQuery(param),
            //   left: {
            //     render: (_, ds) => this.leftRender(ds),
            //   },
            //   defaultExpand: false,
            //   onClear: this.unitPriceListTableSearchClear,
            // }}
            bordered={false}
            aggregation
            custLoading={custLoading}
            dataSet={quotationLineDS}
            rowKey="biddingSupLineCurId"
            style={{ maxHeight: maxHeightCurrent }}
            rowHeight={36}
            columns={this.getColumns()}
            buttons={this.unitPriceTableButtons()}
            pagination={{
              onChange: unitPriceListViewTableOnPagination,
            }}
            {...searchBarTableProps}
          />
        )}
      </div>
    );
  };

  // 返回 - page content
  @Throttle(1200)
  backToUnitPriceList = () => {
    const { closeOfferPriceDetail, quotationDetailViewListDS } = this.props;
    quotationDetailViewListDS.setQueryParameter('tagCheckedStatus', null);

    if (closeOfferPriceDetail) {
      closeOfferPriceDetail();
    }
  };

  renderHeaderBaseInfo = (data = {}) => {
    const {
      getCustomizeUnitCode,
      customizeForm,
      afterSaveBaseInfoFetchHeader,
      headerInfo,
      getHeaderBasicInfoModalReadOnlyFlag = noop,
      customizeBtnGroup,
      getBasicInfoCustomizeCode = noop,
      headerBasicInfoDS,
      headerBasicInfoDetailDS,
      fetchBasicInfoHeader = noop,
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
      getHeaderBasicInfoModalReadOnlyFlag,
      headerInfo,
      customizeBtnGroup,
      headerBasicInfoDS,
      headerBasicInfoDetailDS,
      fetchBasicInfoHeader,
      getBasicInfoCustomizeCode,
      beforeOpenHeaderBaseInfoModal,
      afterCloseHeaderBaseInfoModal,
      remote,
    };

    return (
      <span>
        <SupplierHeaderBaseInfoLink {...currentProps} />
      </span>
    );
  };

  renderUnitPriceHeaderTitle = () => {
    const { offerPriceViewFlag = 0, headerInfo, unitWholeBatchPriceFlag } = this.props;
    const { rfxLineItemCount, displayBiddingSupHeaderStatus } = headerInfo || {};

    let listViewContentTitle = intl
      .get('ssrc.biddingHall.view.title.biddingHallCategory')
      .d('竞价目录');
    let priceViewTitle = intl.get('ssrc.biddingHall.view.title.biddingSite').d('竞价现场');
    let biddingSceneFlag = 1; // offerPriceViewFlag ? 1 : 0 单价竞价-目录目前显示基本信息

    if (unitWholeBatchPriceFlag) {
      priceViewTitle = intl.get('ssrc.biddingHall.view.title.biddingHallCategory').d('竞价目录');

      const unitWholeSiteStatusFlag =
        displayBiddingSupHeaderStatus === 'NOT_START' ||
        displayBiddingSupHeaderStatus === 'SIGN_IN' ||
        displayBiddingSupHeaderStatus === 'IN_PROGRESS' ||
        displayBiddingSupHeaderStatus === 'PAUSED';
      if (!offerPriceViewFlag && unitWholeSiteStatusFlag) {
        listViewContentTitle = intl.get('ssrc.biddingHall.view.title.biddingSite').d('竞价现场');
        biddingSceneFlag = 1;
      }

      if (!unitWholeSiteStatusFlag) {
        priceViewTitle = intl.get('ssrc.biddingHall.view.title.biddingSite').d('竞价现场');
        biddingSceneFlag = 1;
      }
    }

    return (
      <div className={Styles['supplier-bidding-hall-body-content-title']}>
        {!offerPriceViewFlag ? (
          <span>
            <Popover content={listViewContentTitle}>{listViewContentTitle}</Popover>
            {this.renderHeaderBaseInfo({
              biddingSceneFlag,
            })}
            <span>
              {renderHeanderDeferCountNumber({
                data: headerInfo,
                wrapperClassName: Styles['ssrc-bidding-content-header-quoted-count-wrapper'],
              })}
            </span>
          </span>
        ) : (
          <>
            {rfxLineItemCount < 2 ? (
              ''
            ) : (
              <span className={Styles['supplier-bidding-hall-body-content-title-back-icon']}>
                <Icon
                  type="arrow_back"
                  style={{ marginBottom: '3px' }}
                  onClick={this.backToUnitPriceList}
                />
              </span>
            )}
            <span>
              <Popover content={priceViewTitle}>{priceViewTitle}</Popover>
              {this.renderHeaderBaseInfo({
                biddingSceneFlag,
              })}
            </span>
          </>
        )}
      </div>
    );
  };

  render() {
    const { offerPriceViewFlag = 0, totalPriceFlag } = this.props;

    return totalPriceFlag ? (
      <>{this.renderPriceDetail()}</>
    ) : (
      <>
        <div className={Styles['supplier-bidding-hall-body-content-title-wrap']}>
          {this.renderUnitPriceHeaderTitle()}

          <div className={Styles['supplier-bidding-hall-body-content-alert-content-wrap']}>
            {this.renderStatusAlert()}
          </div>
        </div>
        {offerPriceViewFlag ? this.renderPriceDetail() : this.renderPriceTable()}
      </>
    );
  }
}

export default LineTable;
