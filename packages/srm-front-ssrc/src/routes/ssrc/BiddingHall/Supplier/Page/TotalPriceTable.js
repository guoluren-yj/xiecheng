import React, { Component } from 'react';
import { DataSet, Button, Modal, NumberField, Lov, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, isEmpty, throttle, isNil } from 'lodash';
import { Throttle } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import notification from 'utils/notification';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { saveBatchEdit } from '@/services/biddingHallService';
import { numberSeparatorRender } from '@/utils/renderer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { BatchEditModal } from '../Modals/BatchEditModal';
// import BatchQuotationPrice from '../Modals/BatchQuotationPrice';

import { batchQuotationModalDataSet } from '../Stores/batchQuotationModalDataSet';

import Styles from './index.less';

@observer
class TotalPriceLineTable extends Component {
  constructor(props) {
    super(props);

    this.batchQuotaitonModalDS = new DataSet(batchQuotationModalDataSet());

    this.state = {
      totalPriceLoading: false,
      // bathPriceVisible: false, // 批量升降价 popover visible
    };
  }

  toggleLoading = (totalPriceLoading = false) => {
    this.setState({
      totalPriceLoading,
    });
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
    // this.batchModal = null;
  };

  // calc price and amount
  getCommonPropsForAmountCalc = (record) => {
    const { headerInfo, caclRule } = this.props;
    const { benchmarkPriceType, financialPrecision, defaultPrecision } = headerInfo || {};

    if (!record) {
      return;
    }

    const {
      taxRate,
      taxIncludedFlag,
      taxChangeFlag,
      currentQuotationSecQuantity,
      priceBatchQuantity,
      currentQuotationSecPrice,
      netSecondaryPrice,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        'taxChangeFlag',
        'taxRate',
        'currentQuotationSecQuantity',
        'priceBatchQuantity',
        'currentQuotationSecPrice',
        'netSecondaryPrice',
        'taxRateType',
      ]) || {};

    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    const COMMONS = {
      hasTax: taxFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision,
      caclRule,
      each: priceBatchQuantity,
      // netUnitPrice: netSecondaryPrice,
      // taxUnitPrice: currentQuotationSecPrice,
      taxRateType,
    };

    if (taxFlag) {
      COMMONS.taxUnitPrice = currentQuotationSecPrice;
    }
    if (!taxFlag) {
      COMMONS.netUnitPrice = netSecondaryPrice;
    }

    const taxRateNew = taxChangeFlag ? (taxIncludedFlag ? taxRate : 0) : taxRate || 0;

    // const CurrentQuantity = !doubleUnitFlag
    //   ? currentQuotationQuantity
    //   : currentQuotationSecQuantity;
    const CurrentQuantity = currentQuotationSecQuantity; // 竞价大厅暂时没有双单位，先去辅助数量
    COMMONS.quantity = CurrentQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    // COMMONS.taxUnitPrice = currentQuotationSecPrice;
    // 数量不存在，修改计算场景
    if (!CurrentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    return COMMONS;
  };

  // 改变含税后，计算价格
  handleChangeQuotationPrice = (record) => {
    const { autoCalcTotalPriceAllLineAmount } = this.props;
    if (!record) {
      return;
    }

    const COMMONS = this.getCommonPropsForAmountCalc(record) || {};
    // const { taxUnitPrice } = COMMONS || {};
    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      // currentQuotationPrice: taxUnitPrice,
      // netPirce: calcNetUnitPrice,
      netSecondaryPrice: calcNetUnitPrice,
      currentLnTotalAmount: calcTaxAmount,
      currentLnNetAmount: calcNetAmount,
    };

    record.set(priceValueObject);

    if (autoCalcTotalPriceAllLineAmount) {
      autoCalcTotalPriceAllLineAmount(); // 价格变动后，金额需要实时计算
    }
  };

  // net price change
  handleChangeNetPrice = (record) => {
    const { autoCalcTotalPriceAllLineAmount } = this.props;
    if (!record) {
      return;
    }

    const COMMONS = this.getCommonPropsForAmountCalc(record) || {};
    const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      // netPrice: COMMONS.netUnitPrice,
      // currentQuotationPrice: calcTaxUnitPrice,
      currentQuotationSecPrice: calcTaxUnitPrice,
      currentLnTotalAmount: calcTaxAmount,
      currentLnNetAmount: calcNetAmount,
    };

    record.set(priceValueObject);

    if (autoCalcTotalPriceAllLineAmount) {
      autoCalcTotalPriceAllLineAmount();
    }
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

  // batch price ok
  @Throttle(1200)
  batchPriceOk = async () => {
    const {
      detailViewFormDS,
      saveTotalPriceTable = noop,
      refreshContent,
      headerInfo,
      getCustomizeUnitCode = noop,
      totalPriceTableDS,
    } = this.props;
    const { current } = this.batchQuotaitonModalDS || {};
    const { current: detailFormCurrent } = detailViewFormDS || {};
    if (!current || !detailFormCurrent) {
      return false;
    }

    const {
      biddingSupplementPriceRunningFlag,
      biddingSupplierPriceSubmitFlag,
      displayBiddingSupHeaderStatus,
      supplierStatus,
      biddingTotalPricePrinciple,
    } = headerInfo || {};
    const { biddingSupHeaderCurId, tenantId } = detailFormCurrent.get([
      'biddingSupHeaderCurId',
      'tenantId',
    ]);
    current.status = 'update';
    const validateFlag = await this.batchQuotaitonModalDS.validate();
    if (!validateFlag || !biddingSupHeaderCurId) {
      return false;
    }

    const formData = current?.toData();
    if (isEmpty(formData)) {
      return false;
    }

    const biddingSupLineCurDTOList = totalPriceTableDS?.selected?.map((item) => item.toData());

    const data = {
      ...formData,
      biddingSupHeaderCurId,
      biddingSupplementPriceRunningFlag,
      biddingSupplierPriceSubmitFlag,
      organizationId: tenantId,
      displayBiddingSupHeaderStatus,
      supplierStatus,
      biddingSupLineCurDTOList,
      biddingTotalPricePrinciple,
      querys: {
        customizeUnitCode: getCustomizeUnitCode(['totalPriceBatchEdit']),
      },
    };

    // save success
    const batchOkSuccess = () => {
      refreshContent();
      this.batchPriceModalClose();
    };

    const totalPriceSaveSuccessFlag = await saveTotalPriceTable({
      omitSuccessFlag: 1,
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

  // 打开批量编辑弹框
  handleOpenBatchEdit = (Props) => {
    const { headerInfo } = this.props;
    const { floatType } = headerInfo || {};

    this.batchQuotaitonModalDS.setState('headerInfo', headerInfo);
    const defaultData = { floatType };
    this.batchQuotaitonModalDS.loadData([defaultData]);
    BatchEditModal(Props);
  };

  getButtons = () => {
    const {
      pageReadOnlyFlag = false,
      headerInfo,
      detailViewFormDS,
      // saveTotalPriceTable = noop,
      totalPriceTableDS,
      customizeForm = noop,
      getCustomizeUnitCode = noop,
      getCurrentStageBiddingRemainQuotationCount = noop,
    } = this.props;
    const { totalPriceLoading } = this.state;
    const {
      biddingTotalPricePrinciple,
      displayBiddingSupHeaderStatus,
      // biddingPausedRealTimeStatus,
      supplierStatus,
    } = headerInfo || {};
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
    const currentStageBiddingRemainQuotationCount = getCurrentStageBiddingRemainQuotationCount({
      record: formCurrent,
    });

    const contentProps = {
      headerInfo,
      customizeForm,
      totalPriceLoading,
      ds: totalPriceTableDS,
      batchQuotaitonModalDS: this.batchQuotaitonModalDS,
      onClose: this.batchPriceModalClose,
      onOk: this.batchPriceOk,
      code: getCustomizeUnitCode('totalPriceBatchEdit'),
    };

    const allowSaveFlag =
      displayBiddingSupHeaderStatus === 'IN_PROGRESS' && totalPriceTableDS?.length;

    if (pageReadOnlyFlag) {
      return [];
    }

    const BatchChangePriceVisibleFlag =
      allowSaveFlag &&
      (biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
        (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' &&
          !biddingSupplierPriceSubmitFlag &&
          biddingSupplementPriceRunningFlag &&
          !isNil(displayQuotationPrice)));

    const buttons = [
      BatchChangePriceVisibleFlag ? (
        // <Popover
        //   name="batch"
        //   trigger="click"
        //   // title={
        //   //   biddingQuotationMethod === 'BIDDING'
        //   //     ? intl.get('ssrc.biddingHall.view.title.batchDesPriceQuotation').d('批量降价')
        //   //     : intl.get('ssrc.biddingHall.view.title.batchInscPriceQuotation').d('批量升价')
        //   // }
        //   content={<BatchQuotationPrice {...contentProps} />}
        //   placement="topLeft"
        //   visible={bathPriceVisible}
        //   onVisibleChange={this.batchQuotationPopoverVisible}
        //   overlayStyle={{
        //     width: '291px',
        //     padding: '20px',
        //   }}
        // >
        <Button
          name="batch"
          icon="edit_note"
          funcType="link"
          disabled={
            (currentStageBiddingRemainQuotationCount === 0 && !biddingSupplementPriceRunningFlag) ||
            displayBiddingSupHeaderStatus === 'PAUSED' ||
            supplierStatus === 'PROHIBIT_QUOTATION'
          }
          style={{ marginBottom: '4px', marginTop: '8px' }}
          onClick={() => this.handleOpenBatchEdit(contentProps)}
        >
          {/* {biddingQuotationMethod === 'BIDDING'
              ? intl.get('ssrc.biddingHall.view.title.batchDesPriceQuotation').d('批量降价')
              : ''}
            {biddingQuotationMethod === 'AUCTION'
              ? intl.get('ssrc.biddingHall.view.title.batchInscPriceQuotation').d('批量升价')
              : ''} */}
          {totalPriceTableDS?.selected?.length
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')
            : intl.get('ssrc.supplierQuotation.view.button.batchMaintenance').d('批量维护')}
        </Button>
      ) : null,
    ].filter(Boolean);

    return buttons;
  };

  // 通用计算方法
  commonCalcPriceAmount = (record) => {
    const { headerInfo = {} } = this.props;
    const { benchmarkPriceType } = headerInfo || {};
    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';
    if (taxFlag) {
      this.handleChangeQuotationPrice(record);
    } else {
      this.handleChangeNetPrice(record);
    }
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
    this.commonCalcPriceAmount(record);
  };

  // 改变税率
  changeTax = (data, record) => {
    const { taxRate = null, taxId = null, taxRateType } = data || {};
    record.set('taxId', { ...(data || {}), taxId, taxRate });
    record.set({
      taxRateType,
    });
    this.commonCalcPriceAmount(record);
  };

  // 数量
  changeQuantity = async (_, record) => {
    const { handleChangeQuotationQuantity } = this.props;
    await handleChangeQuotationQuantity({ record });
    await this.commonCalcPriceAmount(record);
  };

  getColumns = () => {
    const {
      headerInfo = {},
      doubleUnitFlag,
      pageReadOnlyFlag = false,
      detailViewFormDS,
    } = this.props;

    const {
      benchmarkPriceType,
      biddingTotalPricePrinciple,
      displayBiddingSupHeaderStatus,
      biddingPausedRealTimeStatus,
      supplierStatus,
      tenantId,
    } = headerInfo || {};
    const { current: formCurrent } = detailViewFormDS || {};
    const { biddingSupplementPriceRunningFlag, displayQuotationPrice } = formCurrent
      ? formCurrent?.get(['biddingSupplementPriceRunningFlag', 'displayQuotationPrice'])
      : {};

    // 单价必输
    const unitPriceRequiredFlag = biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED';

    // 出价和金额显示前提
    const priceFlag =
      unitPriceRequiredFlag || (biddingSupplementPriceRunningFlag && !isNil(displayQuotationPrice));

    // 有效值
    // const validPriceVisibleFlag = unitPriceRequiredFlag || biddingSupplementPriceRunningFlag || biddingSupplierPriceSubmitFlag;

    // 当前值显示状态
    const currentPriceFlag =
      ((displayBiddingSupHeaderStatus === 'PAUSED' &&
        biddingPausedRealTimeStatus === 'IN_PROGRESS') ||
        displayBiddingSupHeaderStatus === 'IN_PROGRESS') &&
      supplierStatus !== 'PROHIBIT_QUOTATION';

    // 有效值显示状态
    const validPriceFlag =
      (displayBiddingSupHeaderStatus === 'IN_PROGRESS' &&
        isNil(displayQuotationPrice) &&
        biddingSupplementPriceRunningFlag) ||
      displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'FINISHED' ||
      displayBiddingSupHeaderStatus === 'BIDDING_END' ||
      supplierStatus === 'PROHIBIT_QUOTATION';

    // 当前单价 / 金额
    const currentPriceAmountVisibleFlag = priceFlag && currentPriceFlag;
    // 有效单价 / 金额
    const validPriceAmountVisibleFlag = validPriceFlag;
    // 基准价
    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    const columns = [
      {
        name: 'itemName',
        // width: 360,
        lock: 'left',
      },
      {
        name: 'specs',
        width: 240,
      },
      {
        name: 'quantityAndName',
        width: 220,
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
          quantity = numberSeparatorRender(quantity);

          return quantity && name ? `${quantity}-(${name})` : quantity || name || '';
        },
      },
      currentPriceAmountVisibleFlag
        ? taxFlag
          ? {
              name: 'currentQuotationSecPrice',
              width: 180,
              // hidden: true,
              editor: (record) => {
                if (pageReadOnlyFlag) {
                  return false;
                }

                return (
                  <NumberField
                    name="currentQuotationSecPrice"
                    // record={record}
                    // headerRecord={headerInfo}
                    // currency="currencyCode"
                    // dataSet={totalPriceTableDS}
                    onChange={() => this.handleChangeQuotationPrice(record)}
                  />
                );
              },
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'netSecondaryPrice',
              width: 180,
              editor: (record) => {
                if (pageReadOnlyFlag) {
                  return false;
                }

                return (
                  <NumberField
                    name="netSecondaryPrice"
                    onChange={() => this.handleChangeNetPrice(record)}
                  />
                );
              },
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : null,
      validPriceAmountVisibleFlag
        ? taxFlag
          ? {
              name: 'validQuotationSecPrice',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'validNetSecondaryPrice',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : null,
      currentPriceAmountVisibleFlag
        ? taxFlag
          ? {
              name: 'currentLnTotalAmount',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'currentLnNetAmount',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : null,
      validPriceAmountVisibleFlag
        ? taxFlag
          ? {
              name: 'totalAmount',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'netAmount',
              width: 140,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : null,
      currentPriceAmountVisibleFlag
        ? {
            name: 'taxIncludedFlag',
            width: 120,
            editor: (record) => {
              return <CheckBox onChange={(val) => this.handleChangeTaxFlag(val, record)} />;
            },
          }
        : null,
      currentPriceAmountVisibleFlag
        ? {
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
          }
        : null,
      currentPriceAmountVisibleFlag
        ? {
            name: 'currentQuotationSecQuantity',
            width: 130,
            editor: (record) => {
              if (pageReadOnlyFlag) {
                return false;
              }

              // todo 双单位 uomId
              return (
                <C7nPrecisionInputNumber
                  record={record}
                  uom="secondaryUomId"
                  name="currentQuotationSecQuantity"
                  onChange={(val) => this.changeQuantity(val, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      currentPriceAmountVisibleFlag
        ? {
            name: 'priceBatchQuantity',
            width: 130,
          }
        : null,
      currentPriceAmountVisibleFlag
        ? {
            name: 'currentExpiryDateFrom',
            width: 130,
            editor: !pageReadOnlyFlag,
          }
        : null,
      currentPriceAmountVisibleFlag
        ? {
            name: 'currentExpiryDateTo',
            width: 130,
            editor: !pageReadOnlyFlag,
          }
        : null,
    ].filter(Boolean);

    return columns;
  };

  render() {
    const {
      custLoading,
      getCustomizeUnitCode = noop,
      saveTotalPriceTable = noop,
      customizeTable,
      totalPriceTableDS,
    } = this.props;

    return (
      <div
        className={classnames(Styles['ssrc-bidding-hall-content-left-content-total-price-wrap'])}
      >
        <div className={Styles['table-wrap-title']}>
          <div className={Styles['table-wrap-line']} />
          <div>{intl.get('ssrc.biddingHall.view.title.biddingHallCategory').d('竞价目录')}</div>
        </div>

        {customizeTable(
          {
            code: getCustomizeUnitCode('totalPriceTable'),
            buttonCode: getCustomizeUnitCode('totalPriceTableBtnGroup'),
          },
          <SearchBarTable
            clearButton
            searchCode={getCustomizeUnitCode('totalPriceTableSearch')}
            // onQuery={this.tableSearchQuery}
            showLoading={false}
            queryBar="none"
            searchBarConfig={{
              autoQuery: false,
              closeFilterSelector: true, // 不能切换筛选 和新建筛选了
              // onQuery: this.tableSearchQuery,
              expandable: true,
              defaultExpand: false,
            }}
            bordered={false}
            custLoading={custLoading}
            dataSet={totalPriceTableDS}
            rowKey="rfxLineItemId"
            style={{ minHeight: '80px', maxHeight: '400px' }}
            columns={this.getColumns()}
            buttons={this.getButtons()}
            pagination={{
              onChange: saveTotalPriceTable,
            }}
          />
        )}
      </div>
    );
  }
}

export default TotalPriceLineTable;
