import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Row, Select, TextField, Lov, CheckBox, Tooltip } from 'choerodon-ui/pro';
import { Badge, Alert } from 'choerodon-ui';
// import { math } from 'choerodon-ui/dataset';
import { Form } from 'hzero-ui';
import { isFunction, isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';
import styles from '@/routes/ssrc/InquiryHall/Update/index.less';
// import { FIlESIZE } from '@/utils/SsrcRegx';
import { calculateBasicQty } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
// import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import { INQUIRY, BID } from '@/utils/globalVariable';
import warnIcon from '@/assets/warn-icon.svg';
import commonStyle from '@/routes/ssrc/common.less';
import LadderLevelModal from './LadderLevelModal';

import Styles from './index.less';

const promptCode = 'ssrc.offlineResultEntry';

class AllQuoteLineTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (isFunction(onRef)) {
      onRef(this);
    }

    this.state = {};
  }

  componentDidMount() {
    this.initPage();
  }

  initPage = () => {};

  // 改变含税后，计算价格
  handleCurrentQuotationPrice = (record) => {
    if (!record) {
      return;
    }

    const {
      doubleUnitFlag = false,
      configTaxIncludeFlag,
      caclRule,
      offlineResultRemote,
      bidFlag,
    } = this.props;

    const currencyPrecision = record.get('quotationCurrencyDefaultPrecision');
    const financialPrecision = record.get('financialPrecision');

    const {
      taxRate,
      taxIncludedFlag,
      // taxChangeFlag,
      currentQuotationQuantity,
      currentQuotationSecQuantity,
      priceBatchQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        // 'taxChangeFlag',
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

    // const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: configTaxIncludeFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const taxRateNew = taxIncludedFlag ? taxRate : 0;

    const currentQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    COMMONS.quantity = currentQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    COMMONS.taxUnitPrice = currentQuotationPrice;
    // 数量不存在，修改计算场景
    if (!currentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    const CalcCommons = offlineResultRemote
      ? offlineResultRemote.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_TAX_PRICE_CHANGE_CALCULATE_PROPS',
          COMMONS,
          {
            record,
            bidFlag,
          }
        )
      : COMMONS;

    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(CalcCommons) || {};

    const priceValueObject = {
      netPrice: calcNetUnitPrice,
      netAmount: calcNetAmount,
      totalAmount: calcTaxAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.netSecondaryPrice = calcNetUnitPrice;
    }

    record.set(priceValueObject);
  };

  // 改变未税含税后，计算价格
  changeNetPrice = (record) => {
    if (!record) {
      return;
    }

    const { doubleUnitFlag, configTaxIncludeFlag, caclRule } = this.props;

    const currencyPrecision =
      record.get('quotationCurrencyDefaultPrecision') ?? record.get('defaultPrecision');
    const financialPrecision = record.get('financialPrecision');

    const {
      taxRate,
      taxIncludedFlag,
      // taxChangeFlag,
      currentQuotationQuantity,
      currentQuotationSecQuantity,
      priceBatchQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        // 'taxChangeFlag',
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

    // const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: configTaxIncludeFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const taxRateNew = taxIncludedFlag ? taxRate : 0;

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
      netAmount: calcNetAmount,
      totalAmount: calcTaxAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.currentQuotationSecPrice = calcTaxUnitPrice;
    }

    record.set(priceValueObject);
  };

  // 按照基准价动态计算价格
  dynamicChangePrice = (record = {}) => {
    const { configTaxIncludeFlag } = this.props;

    if (configTaxIncludeFlag) {
      this.handleCurrentQuotationPrice(record);
    } else {
      this.changeNetPrice(record);
    }
  };

  @Bind()
  linktoPrNumDetail(record) {
    const { history } = this.props;
    const prSourcePlatform = record.get('prSourcePlatform');
    const prHeaderId = record.get('prHeaderId');
    history.push({
      pathname:
        prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp'
          ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`,
    });
  }

  // supplier lov props
  getSupplierLovProps = (options = {}) => {
    const { header = {}, fetchSourceSupplierRelativeConfigData = noop } = this.props;
    const { companyId } = header || {};

    const queryData = {
      companyId,
    };
    const supplierLovProps = {
      clearButton: false,
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
        onOk: () => this.newBulkAddSupplier(),
      },
      beforeQuery: fetchSourceSupplierRelativeConfigData,
      onChange: () => this.newBulkAddSupplier(),
    };

    return {
      // queryParams: {}, // 初始化查询参数 url
      queryData, // 初始化查询参数 body payload
      ...supplierLovProps,
      ...options,
    };
  };

  // 判断显示lov or supplier lov
  judgeSupplierLovVisibleConfig = () => {
    const { supplierConfigOldFlag = true } = this.props;
    return supplierConfigOldFlag;
  };

  // table line supplier Lov onOk
  newBulkAddSupplier = () => {
    const { allQuotationDS = {}, offlineResultRemote, sourceKey = INQUIRY, header } = this.props;
    const CurrentRecord = allQuotationDS.current;
    const data = CurrentRecord?.toData();
    const { supplierCompanyNumLov = [] } = data || {};

    if (isEmpty(supplierCompanyNumLov)) {
      return false;
    }

    const {
      supplierId = null,
      supplierNum = null,
      supplierName = null,
      supplierCompanyId = null,
      supplierCompanyName = null,
      supplierCompanyNum = null,
      name = null,
      mobilephone = null,
      mail = null,
      internationalTelCode = null,
    } = supplierCompanyNumLov || {};

    if (!supplierCompanyId && !supplierId && !supplierCompanyNum && supplierCompanyName) {
      return false;
    }

    if (!supplierCompanyId && !supplierId) {
      notification.warning({
        message: intl.get('hzero.common.notification.warn').d('操作异常'),
      });
      return false;
    }

    const supplierTypeText = supplierId && !supplierCompanyId ? 'external' : 'internal';

    CurrentRecord.set('supplierId', supplierId);
    CurrentRecord.set('supplierName', supplierName);
    CurrentRecord.set('supplierNum', supplierNum);
    CurrentRecord.set('supplierCompanyName', supplierCompanyName || supplierName);
    CurrentRecord.set('supplierCompanyNum', supplierCompanyNum || supplierNum);
    CurrentRecord.set('supplierCompanyId', supplierCompanyId);
    CurrentRecord.set('contactName', name);
    CurrentRecord.set('contactMobilephone', mobilephone);
    CurrentRecord.set('supplierType', supplierTypeText);
    CurrentRecord.set('contactMail', mail);
    CurrentRecord.set('internationalTelCode', internationalTelCode);
    // 二开埋点方法
    if (offlineResultRemote && offlineResultRemote.event) {
      offlineResultRemote.event.fireEvent('handleRemoteNewBulkAddSupplier', {
        header,
        record: CurrentRecord,
        supplierCompanyNumLov,
        bidFlag: sourceKey === BID,
      });
    }
  };

  // new supplier lov query changed
  newSupplierLovChanged = (record = null) => {
    const { allQuotationDS } = this.props;
    const QueryDS = allQuotationDS?.queryDataSet;
    const { current } = QueryDS || {};
    if (!current) {
      return;
    }

    if (isEmpty(record)) {
      current.set('supplierName', null);
      current.set('supplierCompanyName', null);
    }
  };

  // table query field new supplier lov ok
  newQuerySupplierLovOnOk = () => {
    const { allQuotationDS } = this.props;
    const QueryDS = allQuotationDS?.queryDataSet;
    const data = QueryDS?.toData();
    const { supplierLov = [] } = data?.[0] || {};

    if (isEmpty(supplierLov) || !QueryDS) {
      return false;
    }

    const { supplierName = null, supplierCompanyName = null } = supplierLov || {};

    QueryDS.current.set('supplierName', supplierName || supplierCompanyName);
    QueryDS.current.set('supplierCompanyName', supplierCompanyName || supplierName);
  };

  // currency code
  handleQuotationCurrencyCodeLov = (value, record) => {
    // const { doubleUnitFlag } = this.props;
    const {
      defaultPrecision,
      financialPrecision,
      currencyCode,
      quotationCurrencyDefaultPrecision,
    } = value || {};
    record.set({
      defaultPrecision,
      financialPrecision,
      quotationCurrencyDefaultPrecision: quotationCurrencyDefaultPrecision ?? defaultPrecision,
      quotationCurrencyCode: currencyCode,
    });
    this.dynamicChangePrice(record);

    // if (value) {
    //   const taxIncludedFlag = record.get('taxIncludedFlag');
    //   let taxRate = record.get('taxRate') || null;
    //   taxRate = Number(taxRate);

    //   if (taxIncludedFlag && taxRate && taxRate !== 0) {
    //     taxRate = taxRate / 100 + 1;
    //   } else {
    //     record
    //       .getField(doubleUnitFlag ? 'currentQuotationSecPrice' : 'currentQuotationPrice')
    //       .set('precision', value.defaultPrecision);
    //     record
    //       .getField(doubleUnitFlag ? 'netSecondaryPrice' : 'netPrice')
    //       .set('precision', value.defaultPrecision);
    //   }
    //   record.set('quotationCurrencyDefaultPrecision', value.defaultPrecision);
    // }
  };

  // 可供数量
  changeQty = async (val, record) => {
    const { doubleUnitFlag } = this.props;
    if (record.get('itemId') && doubleUnitFlag) {
      if (record.get('secondaryUomId')) {
        const res = await calculateBasicQty({
          secondaryQuantity: record.get('currentQuotationSecQuantity'),
          itemId: record.get('itemId'),
          businessKey: record.get('rfxLineItemId') || record.id,
          doublePrimaryUomId: record.get('uomId'),
          secondaryUomId: record.get('secondaryUomId'),
        });
        record.set('currentQuotationQuantity', res ?? '');
      }
    } else {
      record.set('currentQuotationQuantity', val);
    }

    this.dynamicChangePrice(record);
  };

  // change tax
  changeTax = (val, record) => {
    const { taxRate, taxId, taxRateType = null } = val || {};
    record.set('taxRate', taxRate);
    record.set('taxId', taxId);
    record.set('taxLov', {
      ...(val || {}),
      taxId,
      taxRate,
    });
    record.set('taxRateType', taxRateType);

    this.dynamicChangePrice(record);
  };

  // change tax include flag
  changeTaxInclude = (e, record) => {
    if (!e) {
      record.set('taxRate', null);
      record.set('taxId', null);
      record.set('taxRateType', null);
    }
    this.dynamicChangePrice(record);
  };

  // currentQuotationQuantity
  changeCurrentQuotationQuantity = (val, record) => {
    record.set('currentQuotationQuantity', val);
    this.dynamicChangePrice(record);
  };

  getColumns() {
    const {
      header = {},
      // organizationId,
      viewLadderLevel,
      allQuotationDS,
      handleSearch,
      doubleUnitFlag = false,
      offlineResultRemote,
      allowOnlyNameSupplier,
      sourceKey = INQUIRY,
    } = this.props;
    const supplierLovUnvisible = this.judgeSupplierLovVisibleConfig();
    const { ...resetProps } = this.getSupplierLovProps();

    const columns = [
      {
        name: 'rfxLineItemNumLov',
        width: 150,
        editor: true,
      },
      {
        name: 'itemCode',
        width: 150,
        editor: true,
      },
      {
        name: 'itemCategoryName',
        width: 150,
        editor: true,
      },
      {
        name: 'itemName',
        width: 230,
        editor: (record) => {
          return record.get('eliminateRoundNumber') ? (
            <Row>
              <TextField
                record={record}
                name="itemName"
                style={{ width: '65%', marginLeft: '-0.02rem' }}
              />
              <span
                style={{
                  backgroundColor: '#E9E9E9',
                  fontSize: '120x',
                  color: '#000000',
                  width: '35%',
                  height: '18px',
                  marginLeft: '8px',
                }}
              >
                {record.get('eliminateRoundNumber') === 1 ||
                record.get('eliminateRoundNumber') === '1'
                  ? intl.get('ssrc.inquiryHall.model.inquiryHall.firstEliminate').d('首轮淘汰')
                  : `${intl.get('ssrc.inquiryHall.model.inquiryHall.theThird').d('第')}${record.get(
                      'eliminateRoundNumber'
                    )}${intl.get('ssrc.inquiryHall.model.inquiryHall.roundEliminate').d('轮淘汰')}`}
              </span>
            </Row>
          ) : (
            <Row>
              <TextField
                record={record}
                name="itemName"
                style={{ width: '100%', marginLeft: '-0.02rem' }}
              />
            </Row>
          );
        },
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 150,
            editor: true,
          }
        : null,
      {
        name: 'uomName',
        width: 150,
        editor: true,
      },
      {
        name: 'ouName',
        width: 150,
        editor: true,
      },
      {
        name: 'invOrganizationName',
        width: 150,
        editor: true,
      },
      {
        name: 'supplierCompanyNumLov',
        width: 150,
        editor: () => {
          // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
          return supplierLovUnvisible ? (
            true
          ) : (
            <SupplierLov {...resetProps} dataSet={allQuotationDS}>
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                .d('批量添加供应商')}
            </SupplierLov>
          );
        },
      },
      {
        name: 'supplierCompanyName',
        width: 250,
        editor: (record) => {
          // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
          return record.get('supplierCompanyNum')
            ? false
            : allowOnlyNameSupplier &&
                (supplierLovUnvisible ? (
                  <Lov
                    name="supplierCompanyName"
                    record={record}
                    combo
                    noCache
                    valueChangeAction="input"
                    restrict="\S"
                  />
                ) : (
                  <SupplierLov
                    {...resetProps}
                    dataSet={allQuotationDS}
                    combo
                    noCache
                    valueChangeAction="input"
                    restrict="\S"
                  >
                    {intl
                      .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                      .d('批量添加供应商')}
                  </SupplierLov>
                ));
        },
        renderer: ({ text, record }) =>
          text ? (
            <Fragment>
              {record.get('qualificationExpiredFlag') === 1 && (
                <Tooltip
                  title={intl
                    .get(`ssrc.inquiryHall.view.tooltip.qualificationExpirationWarning`)
                    .d('资质到期')}
                >
                  <img src={warnIcon} alt="" style={{ marginRight: 8 }} />
                </Tooltip>
              )}
              {text}
            </Fragment>
          ) : null,
      },
      {
        name: 'contactName',
        width: 150,
        editor: true,
      },
      {
        name: 'contactMobilephoneContainer',
        width: 300,
        className: 'ssrc-mobile-wrapper-container',
        renderer: ({ record }) => {
          return (
            <div>
              <Select
                clearButton={false}
                name="internationalTelCode"
                record={record}
                style={{ width: '50%', height: '0.28rem', lineHeight: '0.26rem', paddingTop: 0 }}
              />
              <TextField
                record={record}
                name="contactMobilephone"
                style={{
                  width: '50%',
                  marginLeft: '-0.02rem',
                  height: '0.28rem',
                  lineHeight: '0.26rem',
                  paddingTop: 0,
                }}
              />
            </div>
          );
        },
      },
      {
        name: 'contactMail',
        width: 150,
        editor: true,
      },
      {
        name: 'quotationLineStatusMeaning',
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'currentQuotationSecPrice',
            width: 150,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  // precision={record.get('quotationCurrencyDefaultPrecision')}
                  name="currentQuotationSecPrice"
                  record={record}
                  currency="quotationCurrencyCode"
                  omitZeroFlag
                  onChange={() => this.handleCurrentQuotationPrice(record)}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision'), {
                omitZeroFlag: true, // 不补零标识
              }),
          }
        : null,
      {
        name: 'currentQuotationPrice',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="currentQuotationPrice"
              record={record}
              currency="quotationCurrencyCode"
              omitZeroFlag
              onChange={() => this.handleCurrentQuotationPrice(record)}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      header && header.multiCurrencyFlag
        ? {
            name: 'quotationCurrencyCodeLov',
            width: 150,
            editor: (record) => {
              return (
                <Lov
                  name="quotationCurrencyCodeLov"
                  record={record}
                  onChange={(value) => this.handleQuotationCurrencyCodeLov(value, record)}
                />
              );
            },
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'netSecondaryPrice',
            width: 150,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netSecondaryPrice"
                  record={record}
                  currency="quotationCurrencyCode"
                  omitZeroFlag
                  // precision={record.get('quotationCurrencyDefaultPrecision')}
                  onChange={() => this.changeNetPrice(record)}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision'), {
                omitZeroFlag: true,
              }),
          }
        : null,
      {
        name: 'netPrice',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="netPrice"
              record={record}
              currency="quotationCurrencyCode"
              omitZeroFlag
              onChange={() => this.changeNetPrice(record)}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'specs',
        width: 150,
        editor: true,
      },
      {
        name: 'priceBatchQuantity',
        width: 150,
      },
      {
        name: 'priceDetail',
        width: 150,
        renderer: ({ record }) =>
          record.get('quotationLineId') ? (
            <>
              <QuotationDetailModal
                rowData={record}
                uiType="c7n"
                sourceFrom="RFX"
                detailFrom="SUP_QUOTATION"
                afterClose={handleSearch}
                quotationStatus={header.quotationStatus}
                continuousQuotationFlag={header.continuousQuotationFlag}
                disabled={record.get('abandonedFlag')}
                postAndDeleteParams={{
                  synCurrentFlag: 1,
                }}
                bidFlag={sourceKey === BID}
              />
              {record.get('quotationDetailRequire') === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null,
      },
      {
        name: 'ladderInquiryFlag',
        width: 150,
        editor: (record) => {
          // 报价
          if (header.sourceCategory === 'RFQ') {
            return !(header.diyLadderQuotationFlag === 0 || record.get('eliminateRoundNumber'));
          } else if (header.sourceCategory === 'RFA') {
            // 竞价
            return !(header.diyLadderQuotationFlag === 0 || record.get('abandonedFlag') === 1);
          }
        },
      },
      {
        name: 'ladderOffer',
        width: 150,
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') && record.get('quotationLineId') ? (
            <>
              <a onClick={() => viewLadderLevel(record)}>
                {intl.get(`${promptCode}.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {record.get('ladderInquiryRequire') === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null,
      },
      {
        name: 'taxIncludedFlag',
        width: 150,
        editor: (record) => {
          return (
            <CheckBox
              name="taxIncludedFlag"
              record={record}
              onChange={(e) => this.changeTaxInclude(e, record)}
            />
          );
        },
      },
      {
        name: 'taxLov',
        width: 150,
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="taxLov"
              paramMatcher={({ text }) => {
                const unNumberFlag = /\D/.test(text); // 校验出非数字
                return !unNumberFlag ? { taxRate: text } : { taxCode: text };
              }}
              onChange={(val) => this.changeTax(val, record)}
            />
          );
        },
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryQuantity"
                  type="c7n-pro"
                  record={record}
                  uom="secondaryUomId"
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'currentQuotationSecQuantity',
            width: 150,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationSecQuantity"
                  type="c7n-pro"
                  record={record}
                  uom="secondaryUomId"
                  onChange={(val) => this.changeQty(val, record)}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 100,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="rfxQuantity"
              type="c7n-pro"
              record={record}
              uom="uomId"
            />
          );
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'currentQuotationQuantity',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="currentQuotationQuantity"
              type="c7n-pro"
              record={record}
              uom="uomId"
              onChange={(val) => this.changeCurrentQuotationQuantity(val, record)}
            />
          );
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'quotedDate',
        width: 150,
        editor: true,
      },
      {
        name: 'currentQuotationRemark',
        width: 150,
        editor: true,
      },
      {
        name: 'paymentTypeLov',
        width: 150,
        // systemVersion代表此单子走的新模板 新模板取消paymentTermFlag控制
        editor: Number(header.systemVersion) === 2 ? true : Boolean(header.paymentTermFlag),
      },
      {
        name: 'paymentTermLov',
        width: 150,
        editor: Number(header.systemVersion) === 2 ? true : Boolean(header.paymentTermFlag),
      },
      {
        name: 'currentPromisedDate',
        width: 150,
        editor: true,
      },
      {
        name: 'currentDeliveryCycle',
        width: 150,
        align: 'left',
        editor: true,
      },
      {
        name: 'origin',
        width: 150,
        editor: true,
      },
      {
        name: 'currentExpiryDateFrom',
        width: 150,
        editor: true,
      },
      {
        name: 'currentExpiryDateTo',
        width: 150,
        editor: true,
      },
      {
        name: 'minPurchaseQuantity',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="minPurchaseQuantity"
              type="c7n-pro"
              record={record}
              uom="uomId"
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'minPackageQuantity',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="minPackageQuantity"
              type="c7n-pro"
              record={record}
              uom="uomId"
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'freightIncludedFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'prNum',
        width: 150,
        // editor: true,
        renderer: ({ value, record }) => {
          if (record.get('prHeaderId')) {
            return <a onClick={() => this.linktoPrNumDetail(record)}> {value}</a>;
          } else {
            return value;
          }
        },
      },
      {
        name: 'prLineNum',
        width: 150,
        editor: true,
      },
      {
        name: 'currentAttachmentUuid',
        width: 200,
        editor: true,
        // renderer: ({ record }) => (
        //   <Upload
        //     filePreview
        //     fileSize={FIlESIZE}
        //     bucketName={PRIVATE_BUCKET}
        //     bucketDirectory="ssrc-rfx-quotationline"
        //     attachmentUUID={record.get('currentAttachmentUuid')}
        //     tenantId={organizationId}
        //     afterOpenUploadModal={(uuid) => {
        //       record.set('currentAttachmentUuid', uuid);
        //     }}
        //   />
        // ),
      },
    ].filter(Boolean);
    // 二开埋点
    if (!offlineResultRemote) {
      return columns;
    }
    const { columns: newColumns = [] } = offlineResultRemote.process(
      'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_ALL_QUOTE_LINE_TABLE',
      { columns },
      {
        allQuotationDS,
        handleSearch,
        header,
      }
    );
    return newColumns;
  }

  // table query fields
  getQueryFields = () => {
    const supplierLovUnvisible = this.judgeSupplierLovVisibleConfig();
    const { ...supplierLovResetProps } = this.getSupplierLovProps();

    return {
      supplierCompanyLov: <Lov name="supplierCompanyLov" hidden={!supplierLovUnvisible} />,
      supplierLov: (
        <SupplierLov
          {...supplierLovResetProps}
          hidden={supplierLovUnvisible}
          onChange={this.newSupplierLovChanged}
          modalProps={{
            onOk: this.newQuerySupplierLovOnOk,
          }}
        />
      ),
    };
  };

  cuxButtons() {
    return false;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      visible,
      hideModal,
      saveData,
      onlySaveData,
      ladderLevelData,
      LadderLevelHeaderData = {},
      openModal,
      ladderLoading,
      custTable = () => {},
      allQuotationDS = {},
      onDeleteLine = () => {},
      custLoading,
      configTaxIncludeFlag,
      onChangePagination,
      startBatchMaintainItemLine,
      header,
      deleteData,
      addData,
      selectRowKeys,
      selectRows,
      doubleUnitFlag = false,
      sourceKey = INQUIRY,
      handleRowSelectChange,
      quotationHeader,
      qualificationWarnInfo,
      offlineResultRemote,
      rfxHeaderId,
    } = this.props;

    // 阶梯报价
    const ladderRecordProps = {
      biddingQuotationLine: LadderLevelHeaderData,
      visible,
      hideModal,
      ladderLevelData,
      saveData,
      onlySaveData,
      ladderLoading,
      configTaxIncludeFlag,
      header,
      deleteData,
      addData,
      doubleUnitFlag,
      selectRowKeys,
      selectRows,
      handleRowSelectChange,
      quotationHeader,
      remote: offlineResultRemote,
      remoteCode: 'SSRC_OFFLINE_RESULT_ENTRY_DETAIL',
    };

    const showHiddenButtonFlag = offlineResultRemote
      ? offlineResultRemote.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_TABLE_BUTTONS_VISIBLE',
          true,
          {
            that: this,
            allQuotationDS,
            header,
          }
        )
      : true;

    const { supplierCompanyName, expiredCount } = qualificationWarnInfo || {};
    return (
      <React.Fragment>
        {!!supplierCompanyName && (
          <Alert
            showIcon
            message={intl
              .get(`ssrc.inquiryHall.view.message.offLineQualificationWarnInfo`, {
                supplierCompanyName,
                expiredCount,
              })
              .d(
                '{supplierCompanyName}等{expiredCount}家供应商在供应商360资质认证已到期，请确认是否要填写报价！'
              )}
            type="error"
            className={commonStyle['ssrc-alert-error']}
            style={{ margin: '20px 0 20px 0' }}
          />
        )}
        {showHiddenButtonFlag ? (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span />
            <div className={styles['item-list-search']}>
              <Button style={{ marginRight: 8 }} onClick={openModal} color="primary">
                {intl.get(`${promptCode}.view.message.button.bulkAddSupLine`).d('批量添加报价行')}
              </Button>
              {offlineResultRemote
                ? offlineResultRemote.render(
                    'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_RENDER_ALL_TABLE_BUTTON',
                    null,
                    {
                      rfxHeaderId,
                      allQuotationDS,
                      bidFlag: sourceKey === BID,
                    }
                  )
                : null}
              <Button style={{ marginRight: 8 }} onClick={onDeleteLine}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button
                style={{ marginRight: 8 }}
                onClick={startBatchMaintainItemLine}
                disabled={!allQuotationDS?.length && !allQuotationDS?.cachedRecords?.length}
              >
                {isEmpty(allQuotationDS.selected)
                  ? intl.get(`${promptCode}.view.button.batchMaintenance`).d('批量维护')
                  : intl.get(`${promptCode}.view.button.batchEditorSelected`).d('勾选批量编辑')}
              </Button>
              {this.cuxButtons()}
            </div>
          </div>
        ) : (
          ''
        )}
        {custTable(
          { code: `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.LINE` },
          <Table
            queryFields={this.getQueryFields()}
            custLoading={custLoading}
            queryFieldsLimit={3}
            className={Styles['ssrc-offline-result-entry-table-wrapper']}
            dataSet={allQuotationDS}
            rowKey="quotationLineId"
            columns={this.getColumns()}
            pagination={{
              onChange: onChangePagination,
            }}
            style={{ maxHeight: '75vh' }}
          />
        )}
        {visible && <LadderLevelModal {...ladderRecordProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return Form.create({ fieldNameProp: null })(observer(Comp));
};

export { HOCComponent, AllQuoteLineTable };
export default HOCComponent(AllQuoteLineTable);
