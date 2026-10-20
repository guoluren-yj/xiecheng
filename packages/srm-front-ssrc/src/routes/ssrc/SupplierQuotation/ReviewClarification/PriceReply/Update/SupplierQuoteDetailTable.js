import React, { Component } from 'react';
import { Table, DataSet, Modal, CheckBox, Lov, Tooltip } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, noop } from 'lodash';
// import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';

import Attachment from '@/routes/ssrc/components/Attachment/';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';
import { PRIVATE_BUCKET } from '_utils/config';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

// import { valueIncorrect } from '@/routes/components/Widget/dataVerification';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender, getQuotationTooltipTitle } from '@/utils/renderer';
import { INQUIRY, BID } from '@/utils/globalVariable';
import LadderLevel from '../LadderLevel';
import { SupplierQuotationTableDS, LadderLevelModalDS } from '../TableDS';

import styles from '../index.less';

export default class SupplierQuoteDetailTable extends Component {
  constructor(props) {
    super(props);
    const { onTableRef = null, quotationName, headerInfoDS, replyRemote } = props;
    if (typeof onTableRef === 'function') {
      onTableRef(this);
    }
    this.ladderModalCount = 0; // 阶梯报价弹框数量
    this.state = {};

    this.LadderLevelModalDS = new DataSet(
      LadderLevelModalDS({
        editTable: false,
      })
    );
    this.SupplierQuotationTableDS = new DataSet(
      replyRemote
        ? replyRemote.process(
            'SSRC_PRICE_REPLY_PROCESS_SUPPLIER_TABLE_DS',
            SupplierQuotationTableDS({
              sourceKey: props.sourceKey || INQUIRY,
              quotationName,
              headerInfoDS,
            }),
            {
              headerInfoDS,
            }
          )
        : SupplierQuotationTableDS({
            sourceKey: props.sourceKey || INQUIRY,
            quotationName,
            headerInfoDS,
          })
    );
  }

  componentDidMount() {
    this.fetchSupplierLine();
  }

  componentDidUpdate() {
    if (this.props.doubleUnitFlag) {
      this.SupplierQuotationTableDS.setState('doubleUnitFlag', true);
    } else {
      this.SupplierQuotationTableDS.setState('doubleUnitFlag', false);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  // fetch supplier line
  async fetchSupplierLine() {
    const { clarifyNotifyId, organizationId, supplierCompanyId, supplierTenantId } = this.props;

    this.SupplierQuotationTableDS.setQueryParameter('commonProps', {
      organizationId,
      clarifyNotifyId,
      supplierCompanyId,
      supplierTenantId,
    });

    const quotationLines = await this.SupplierQuotationTableDS.query();
    this.timer = setTimeout(() => {
      this.updateHeaderStatus(quotationLines);
    }, 800);
  }

  // 更新头表单状态
  updateHeaderStatus(lines = {}) {
    const { headerInfoDS = {} } = this.props;

    if (isEmpty(lines) || !headerInfoDS.current) {
      return;
    }

    // const benchmarkPriceType = headerInfoDS.current?.get('benchmarkPriceType');
    const { priceClarifyIssueLineStatusMeaning = null } = lines[0] || {};
    headerInfoDS.current.set('clarifyNotifyStatusMeaning', priceClarifyIssueLineStatusMeaning);
    // this.SupplierQuotationTableDS.setQueryParameter('headerInfo', { benchmarkPriceType });
  }

  // 查看阶梯报价
  @Bind()
  @Debounce(1200)
  async viewLadderLevelPrepare(record = {}) {
    const {
      sourceHeaderId,
      organizationId,
      doubleUnitFlag,
      handleAllSave = noop,
      headerInfoDS,
      sourceKey,
      customizeTable,
    } = this.props;
    if (this.ladderModalCount >= 1) {
      return;
    } else {
      this.ladderModalCount++;
    }
    // 调用外层大保存方法 防止数据被清空
    await handleAllSave();

    const { current } = headerInfoDS || {};
    const { tenantId } = current ? current.get(['tenantId']) : {};
    const recordData = record.toData() || {};
    const {
      benchmarkPriceType,
      diyLadderQuotationFlag,
      sourceQuotationLineId = null,
      priceClarifyIssueLineId,
    } = recordData || {};
    const LadderCode = `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_LADDER_LEVEL_EDIT`;

    this.LadderLevelModalDS = new DataSet(
      LadderLevelModalDS({
        diyLadderQuotationFlag,
        editTable: false,
        readOnly: false,
      })
    );
    this.LadderLevelModalDS.setQueryParameter('commonProps', {
      organizationId,
      sourceHeaderId,
      sourceQuotationLineId,
      benchmarkPriceType,
      priceClarifyIssueLineId,
      customizeUnitCode: LadderCode,
    });
    this.LadderLevelModalDS.setState('doubleUnitFlag', doubleUnitFlag);
    const modalKey = Modal.key();
    this.LadderLevelModalDS.query();
    const Props = {
      recordData,
      readOnly: false,
      ladderLevelModalDS: this.LadderLevelModalDS,
      doubleUnitFlag,
      tenantId,
      customizeTable,
      LadderCode,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      style: {
        width: '750px',
      },
      title: intl.get(`ssrc.inquiryHall.view.message.title.ladderLevelQuot`).d('阶梯报价'),
      children: <LadderLevel {...Props} />,
      footer: null,
      onCancel: () => {
        this.ladderModalCount = 0;
        this.SupplierQuotationTableDS.query(this.SupplierQuotationTableDS?.currentPage || 1);
      },
    });
  }

  @Bind()
  viewFile(e, item = {}) {
    e.stopPropagation();

    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      businessUuid: item.businessAttachmentUuid,
      techUuid: item.techAttachmentUuid,
    };

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.quotationAttachment`).d('报价附件'),
      children: <Attachment {...AttachmentsProps} />,
      style: { width: '80%' },
    });
  }

  // 改变含税后，计算价格
  handleChangeQuotationPrice = (record) => {
    if (!record) {
      return;
    }

    const {
      headerInfoDS = {},
      doubleUnitFlag,
      currencyPrecision,
      financialPrecision,
      caclRule,
      replyRemote,
      bidFlag,
    } = this.props;

    const {
      benchmarkPriceType,
      sourceTempalteSystemVersion, // 为2走新模板配置
    } = headerInfoDS.current?.get(['benchmarkPriceType', 'sourceTempalteSystemVersion']) || {};
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';

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
    let newQuotationPrice = record.get('newQuotationPrice');
    if (doubleUnitFlag) {
      newQuotationPrice = record.get('newQuotationSecPrice');
    }

    const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      caclRule,
      taxRateType,
    };

    // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
    const taxRateNew =
      Number(sourceTempalteSystemVersion) === 2 || taxChangeFlag
        ? taxIncludedFlag
          ? taxRate
          : 0
        : pristineTaxRate || 0;

    const CurrentQuotationQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    COMMONS.quantity = CurrentQuotationQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    COMMONS.taxUnitPrice = newQuotationPrice;
    COMMONS.each = priceBatchQuantity;
    if (!CurrentQuotationQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    const CalcCommons = replyRemote
      ? replyRemote.process('SSRC_PRICE_REPLY_PROCESS_TAX_PRICE_CHANGE_CALCULATE_PROPS', COMMONS, {
          bidFlag,
          headerInfoDS,
        })
      : COMMONS;

    const { calcNetUnitPrice } = amountCalculation(CalcCommons) || {};

    const priceValueObject = {
      netPrice: calcNetUnitPrice,
    };

    if (doubleUnitFlag) {
      priceValueObject.newNetSecPrice = calcNetUnitPrice;
    }

    record.set(priceValueObject);
  };

  // 改变未税含税后，计算价格
  handleChangeNetPrice = (record) => {
    if (!record) {
      return;
    }

    const {
      headerInfoDS = {},
      doubleUnitFlag,
      currencyPrecision,
      financialPrecision,
      caclRule,
    } = this.props;

    const { benchmarkPriceType, sourceTempalteSystemVersion } =
      headerInfoDS.current?.get(['benchmarkPriceType', 'sourceTempalteSystemVersion']) || {};
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';

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
      netPrice = record.get('newNetSecPrice');
    }

    const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      caclRule,
      taxRateType,
    };

    // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
    const taxRateNew =
      Number(sourceTempalteSystemVersion) === 2 || taxChangeFlag
        ? taxIncludedFlag
          ? taxRate
          : 0
        : pristineTaxRate || 0;

    const CurrentQuotationQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    COMMONS.quantity = CurrentQuotationQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    COMMONS.netUnitPrice = netPrice;
    COMMONS.each = priceBatchQuantity;
    if (!CurrentQuotationQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }
    const { calcTaxUnitPrice } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      newQuotationPrice: calcTaxUnitPrice,
    };

    if (doubleUnitFlag) {
      priceValueObject.newQuotationSecPrice = calcTaxUnitPrice;
    }

    record.set(priceValueObject);
  };

  // 是否含税改变
  handleTaxIncludedFlag = (checked = false, record) => {
    // const newQuotationPrice = record?.get('newQuotationPrice');
    if (!checked) {
      record.set('taxIdLov', null);
      record.set('taxId', null);
      record.set('taxRate', null);
      record.set({
        taxRateType: null,
      });
    }

    this.dynamicChangePrice(record);
  };

  // change tax rate
  changeTaxRate = (data = {}, record) => {
    // const { headerInfoDS = {} } = this.props;
    const { taxRate, taxId, taxRateType = null } = data || {};
    // const benchmarkPriceType = headerInfoDS.current?.get('benchmarkPriceType');
    // const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';
    const { taxIncludedFlag = 0 } = record.get([
      'taxIncludedFlag',
      // 'netPrice',
      // 'newQuotationPrice',
    ]);

    if (!taxIncludedFlag) {
      return;
    }

    // if (isUnTaxPriceFlag) {
    //   const isNetPriceExist = !valueIncorrect(netPrice);
    //   const newQuotationPriceCalculate = taxIncludedFlag
    //     ? math.toFixed(math.multipliedBy(netPrice, math.plus(1, math.div(taxRate, 100))), 10)
    //     : netPrice;
    //   record.set('newQuotationPrice', isNetPriceExist ? newQuotationPriceCalculate : null);
    // } else {
    //   const isExist = !valueIncorrect(newQuotationPrice);
    //   const netPriceCalculate = taxIncludedFlag
    //     ? math.toFixed(math.div(newQuotationPrice, math.plus(1, math.div(taxRate, 100))), 10)
    //     : newQuotationPrice;
    //   record.set('netPrice', isExist ? netPriceCalculate : null);
    // }

    record.set('taxRate', taxRate);
    record.set('taxId', taxId);
    record.set('taxIdLov', data);
    record.set('taxRateType', taxRateType);

    this.dynamicChangePrice(record);
  };

  // 按照基准价动态计算价格
  dynamicChangePrice = (record = {}) => {
    const { headerInfoDS = {} } = this.props;
    const benchmarkPriceType = headerInfoDS.current?.get('benchmarkPriceType');
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';

    if (!isUnTaxPriceFlag) {
      this.handleChangeQuotationPrice(record);
    } else {
      this.handleChangeNetPrice(record);
    }
  };

  getTableColumns = () => {
    const {
      doubleUnitFlag,
      handleAllSave = noop,
      headerInfoDS,
      replyRemote,
      sourceKey = INQUIRY,
    } = this.props;
    const { current } = headerInfoDS || {};
    const {
      tenantId,
      benchmarkPriceType,
      sourceTempalteSystemVersion,
      secondarySourceCategory,
      currencyCode,
    } = current
      ? current.get([
          'tenantId',
          'benchmarkPriceType',
          'sourceTempalteSystemVersion',
          'secondarySourceCategory',
          'currencyCode',
        ])
      : {};
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';

    const Columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'priceClarifyIssueLineStatusMeaning',
        width: 80,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'newQuotationSecPrice',
            width: 100,
            renderer: ({ value, dataSet, record }) => (
              <Tooltip
                placement="topLeft"
                title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
              >
                <div>{numberSeparatorRender(value, dataSet.getState('precision'))}</div>
              </Tooltip>
            ),
            // align: 'left',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="newQuotationSecPrice"
                  type="c7n-pro"
                  record={record}
                  dataSet={this.SupplierQuotationTableDS}
                  currency="currencyCode"
                  onChange={() => this.handleChangeQuotationPrice(record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'newNetSecPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value, dataSet, record }) => (
              <Tooltip
                placement="topLeft"
                title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
              >
                {/** 加div是为了自动填满单元格，让提示信息有正常的显示效果 */}
                <div>{numberSeparatorRender(value, dataSet.getState('precision'))}</div>
              </Tooltip>
            ),
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="newNetSecPrice"
                  type="c7n-pro"
                  record={record}
                  dataSet={this.SupplierQuotationTableDS}
                  currency="currencyCode"
                  onChange={() => this.handleChangeNetPrice(record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
          }
        : null,
      {
        name: 'newQuotationPrice',
        width: 100,
        renderer: ({ value, dataSet, record }) => (
          <Tooltip
            placement="topLeft"
            title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
          >
            <div>{numberSeparatorRender(value, dataSet.getState('precision'))}</div>
          </Tooltip>
        ),
        // align: 'left',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="newQuotationPrice"
              type="c7n-pro"
              record={record}
              dataSet={this.SupplierQuotationTableDS}
              currency="currencyCode"
              onChange={() => this.handleChangeQuotationPrice(record)}
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
          );
        },
      },
      {
        name: 'netPrice',
        width: 100,
        // align: 'left',
        renderer: ({ value, dataSet, record }) => (
          <Tooltip
            placement="topLeft"
            title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
          >
            {/** 加div是为了自动填满单元格，让提示信息有正常的显示效果 */}
            <div>{numberSeparatorRender(value, dataSet.getState('precision'))}</div>
          </Tooltip>
        ),
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="netPrice"
              type="c7n-pro"
              record={record}
              dataSet={this.SupplierQuotationTableDS}
              currency="currencyCode"
              onChange={() => this.handleChangeNetPrice(record)}
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
          );
        },
      },
      {
        name: 'quotationDetail',
        width: 100,
        align: 'left',
        renderer: ({ record }) => {
          const { priceClarifyIssueLineId = null } = record.get(['priceClarifyIssueLineId']);
          return (
            <QuotationDetailModal
              rowData={record}
              sourceFrom="RFX"
              detailFrom="SUP_QUOTATION"
              disabled={record.get('abandonedFlag')}
              uiType="c7n-pro"
              extendInterfaceParams={{
                priceClarifyFlag: 1, // 接口传给后端 价格澄清回复需要特殊处理
                priceClarifyIssueLineId,
                synCurrentFlag: 1,
              }}
              pageFrom="priceReply"
              bidFlag={sourceKey === BID}
              onBeforeOpen={handleAllSave}
              onCancel={() =>
                this.SupplierQuotationTableDS.query(this.SupplierQuotationTableDS?.currentPage || 1)
              }
              onOk={() =>
                this.SupplierQuotationTableDS.query(this.SupplierQuotationTableDS?.currentPage || 1)
              }
            />
          );
        },
      },
      doubleUnitFlag
        ? !isUnTaxPriceFlag
          ? {
              name: 'lastQuotationSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'lastNetSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : !isUnTaxPriceFlag
        ? {
            name: 'lastQuotationPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'lastNetPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'currentQuotationQuantity',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        editor: (record) => {
          return (
            <CheckBox
              name="taxIncludedFlag"
              onChange={(e) => this.handleTaxIncludedFlag(e, record)}
            />
          );
        },
      },
      {
        name: 'taxIdLov',
        width: 120,
        editor: (record) => {
          return <Lov name="taxIdLov" onChange={(data) => this.changeTaxRate(data, record)} />;
        },
      },
      {
        name: 'secondaryQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'secondaryUomName',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'rfxQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'uomName',
            width: 100,
          }
        : null,
      {
        name: 'origin',
        editor: true,
      },
      {
        name: 'quotationExpiryDateFrom',
        width: 150,
        editor: (record) => {
          if (Number(sourceTempalteSystemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
            return true;
          }
          return record.validDateInputType !== 'READONLY';
        },
      },
      {
        name: 'quotationExpiryDateTo',
        width: 150,
        editor: (record) => {
          if (Number(sourceTempalteSystemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
            return true;
          }
          return record.validDateInputType !== 'READONLY';
        },
      },
      {
        name: 'promisedDate',
        width: 150,
        editor: (record) => {
          return !record.get('eliminateRoundNumber');
        },
      },
      {
        name: 'deliveryCycle',
        width: 120,
        editor: (record) => {
          return !record.get('eliminateRoundNumber');
        },
        toolTip: 'overflow',
      },
      {
        name: 'quotationRemark',
        width: 180,
        editor: (record) => {
          return !record.get('eliminateRoundNumber');
        },
      },
      {
        name: 'minPurchaseQuantity',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
        editor: (record) => {
          return !record.get('eliminateRoundNumber');
        },
      },
      {
        name: 'minPackageQuantity',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
        editor: (record) => {
          return !record.get('eliminateRoundNumber');
        },
      },
      {
        name: 'freightIncludedFlag',
        editor: true,
      },
      {
        name: 'freightAmount',
        renderer: ({ value }) => numberSeparatorRender(value),
        editor: (record) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = replyRemote
            ? replyRemote.process(
                'SSRC_PRICE_REPLY_PROCESS_QUOTATION_FORM_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return (
            <C7nPrecisionInputNumber
              name="freightAmount"
              type="c7n-pro"
              record={record}
              dataSet={this.SupplierQuotationTableDS}
              financial="currencyCode"
              disabled={record.get('eliminateRoundNumber') || record.get('freightIncludedFlag')}
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
              {...cuxFreightAmountProps}
            />
          );
        },
      },
      {
        name: 'attachmentUuid',
        editor: true,
      },
      {
        name: 'model',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') ? (
            <>
              <a onClick={() => this.viewLadderLevelPrepare(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {record.get('ladderInquiryRequire') === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null;
        },
      },
    ].filter(Boolean);

    return replyRemote
      ? replyRemote.process('SSRC_PRICE_REPLY_PROCESS_SUPPLIER_TABLE_COLUMNS', Columns, {
          currencyCode,
          secondarySourceCategory,
          getQuotationTooltipTitle,
          current,
        })
      : Columns;
  };

  render() {
    const { customizeTable, custLoading, sourceKey = INQUIRY } = this.props;
    return (
      <div className={styles['ssrc-supplier-quote-table']}>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT`,
            dataSet: this.SupplierQuotationTableDS,
          },
          <Table
            rowKey="quotationLineId"
            dataSet={this.SupplierQuotationTableDS}
            columns={this.getTableColumns()}
            custLoading={custLoading}
          />
        )}
      </div>
    );
  }
}
