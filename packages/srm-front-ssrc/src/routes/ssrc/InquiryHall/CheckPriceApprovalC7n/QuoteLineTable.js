import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Attachment, Modal, Table } from 'choerodon-ui/pro';
import { isFunction, compose, isNil } from 'lodash';
import { connect } from 'dva';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { INQUIRY } from '@/utils/globalVariable';
import { numberSeparatorRender } from '@/utils/renderer';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import NoQuotedItemView from '@/routes/ssrc/InquiryHall/CheckPrice/components/NoQuotedItemView';
import {
  renderRoundEliminate,
  renderDiffPrice,
  renderFlagDisplay,
  renderNumberFormatter,
} from './utils/renderer';
import LadderLevel from '../../components/LadderLevelDoubleUnit';

// const { Option } = Select;

@observer
class QuoteLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 查看适用范围
  viewApplicationOrgModal = (record = {}) => {
    const { organizationId } = this.props;
    const { rfxHeaderId = null, applicationScopeFlag = null, rfxLineItemId = null } =
      record.get(['rfxHeaderId', 'applicationScopeFlag', 'rfxLineItemId']) || {};
    if (applicationScopeFlag === 0) {
      return;
    }

    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        applicationScopeFlag,
        sourceLineItemId: rfxLineItemId,
      },
      sourceHeaderId: rfxHeaderId,
      organizationId,
    };

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      bodyStyle: {
        padding: 0,
      },
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScopeDetail {...Props} />,
      style: { width: '1000px' },
      footer: null,
    });
  };

  /**
   * 渲染单价样式
   * 竞价方向为正向时，行号相同的物料，单价最高的标红
   * 否则，单价最小的标红
   */
  renderValidQuotationPrice(val, record, name = '') {
    const { headerInfoDs = {} } = this.props;
    // const rfxLineItemNumList =
    //   dataSource &&
    //   dataSource
    //     .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
    //     .map((r) => r.validQuotationPrice);
    // const validQuotationPriceMax = Math.max(...rfxLineItemNumList);
    // const validQuotationPriceMin = Math.min(...rfxLineItemNumList);
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    const { itemLineFloorPrice, itemLineHighestPrice, redField } =
      record.get(['itemLineFloorPrice', 'itemLineHighestPrice', 'redField']) || {};

    const { current } = headerInfoDs || {};
    const auctionDirection = current?.get('auctionDirection');
    if (auctionDirection === 'FORWARD') {
      mean =
        itemLineHighestPrice === val || redField === name ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    } else {
      mean =
        itemLineFloorPrice === val || redField === name ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    }
    return mean;
  }

  /**
   * 渲染行金额样式
   * 竞价方向为正向时，行号相同的物料，行金额最高的标红
   * 否则，行金额最小的标红
   */
  renderTotalPrice(val, record) {
    // const { headerInfoDs = {} } = this.props;
    // const totalPriceList =
    //   dataSource &&
    //   dataSource
    //     .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
    //     .map((r) => r.totalPrice);
    // const totalPriceMax = Math.max(...totalPriceList);
    // const totalPriceMin = Math.min(...totalPriceList);
    // let mean = '';
    const formatValue = (
      <PrecisionInputNumber
        financial={record.get('currencyCode')}
        value={val}
        type="c7n"
        readOnly
      />
    );
    // const { itemLineFloorPrice, itemLineHighestPrice } =
    //   record.get(['itemLineFloorPrice', 'itemLineHighestPrice']) || {};

    // const { current } = headerInfoDs || {};
    // const auctionDirection = current?.get('auctionDirection');
    // if (auctionDirection === 'FORWARD') {
    //   mean =
    //     itemLineHighestPrice === val ? (
    //       <span style={{ color: 'red' }}>{formatValue}</span>
    //     ) : (
    //       formatValue
    //     );
    // } else {
    //   mean =
    //     itemLineFloorPrice === val ? (
    //       <span style={{ color: 'red' }}>{formatValue}</span>
    //     ) : (
    //       formatValue
    //     );
    // }
    return formatValue;
  }

  renderForm() {
    // const { form } = this.props;
    // return (
    //   <Form>
    //     <Form.Item
    //       label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quickSelection`).d('快速选用')}
    //       labelCol={{ span: 2 }}
    //       wrapperCol={{ span: 4 }}
    //       style={{
    //         marginBottom: '10px',
    //         marginTop: '10px',
    //         display: 'inline-flex',
    //         justifyContent: 'flex-end',
    //         width: '100%',
    //       }}
    //     >
    //       {form.getFieldDecorator(
    //         'selectedPolicyValue',
    //         {}
    //       )(
    //         <Select disabled allowClear style={{ width: '100%' }}>
    //           <Option value="lowest">
    //             {intl.get(`ssrc.inquiryHall.model.inquiryHall.lowest`).d('最低价策略')}
    //           </Option>
    //           <Option value="complete">
    //             {intl.get(`ssrc.inquiryHall.model.inquiryHall.complete`).d('全部选用')}
    //           </Option>
    //         </Select>
    //       )}
    //     </Form.Item>
    //   </Form>
    // );
  }

  render() {
    const {
      headerInfoDs,
      hideModal,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      customizeTable,
      allQuoteLineDs,
      sourceKey = INQUIRY,
      doubleUnitFlag = false,
      onComparePriceHistory = () => {},
      remote,
      getAllTabTableCommonColumns,
    } = this.props;
    const ladderLevelModalProps = {
      doubleUnitFlag,
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };
    const { current } = headerInfoDs || {};
    const { priceTypeCode, newQuotationFlag } = current
      ? current?.get(['priceTypeCode', 'newQuotationFlag'])
      : {};
    const multiCurrencyFlag = current?.get('multiCurrencyFlag');
    const colorRemote = remote
      ? remote?.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ALL_TABLE_COLUMNS_COLOR', 'red')
      : 'red';
    const commonColumns = getAllTabTableCommonColumns ? getAllTabTableCommonColumns() : [];

    const preColumns = [
      {
        name: 'selectionStrategyMeaning',
        width: 130,
      },
      {
        name: 'suggestedFlag',
        width: 60,
        renderer: renderFlagDisplay,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 380,
        renderer: renderRoundEliminate,
      },
      {
        name: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        name: 'candidateSuggestion',
        width: 100,
      },
      {
        name: 'stageDescription',
        width: 120,
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: renderFlagDisplay,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      // 此列二开，禁止修改字段名
      {
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validQuotationPrice') {
            return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      // 此列二开，禁止修改字段名
      {
        name: 'validNetPrice',
        width: 120,
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validNetPrice') {
            return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'validQuotationSecPrice') {
                return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 100,
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'validNetSecondaryPrice') {
                return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : null,
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            width: 100,
            align: 'right',
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'baseQuotationPrice') {
                return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            align: 'right',
            width: 100,
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'baseNetPrice') {
                return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : '',
      {
        name: 'perNetPrice',
        width: 120,
      },
      {
        name: 'perTaxIncludedPrice',
        width: 120,
      },
      {
        name: 'referencePrice',
        width: 120,
      },
      {
        name: 'differentPrice',
        width: 100,
        renderer: ({ record }) => renderDiffPrice(record, { headerInfoDs, doubleUnitFlag }),
      },
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const currentQuotationDetailProps = {
            rowData: record,
          };

          const quotationDetailProps = remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_TABLE_COLUMNS_QUOTATIONDETAILCOMMONPROPS',
                currentQuotationDetailProps,
                {
                  bidFlag: sourceKey === 'BID',
                }
              )
            : currentQuotationDetailProps;

          return (
            <React.Fragment>
              <QuotationDetail
                sourceFrom="RFX"
                allowBuyerViewFlag
                uiType="c7n"
                pageFrom="checkPriceApprove"
                bidFlag={sourceKey === 'BID'}
                {...quotationDetailProps}
              />
            </React.Fragment>
          );
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'allottedQuantity',
        width: 120,
        renderer: renderNumberFormatter,
      },
      doubleUnitFlag
        ? {
            name: 'allottedSecondaryQuantity',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      {
        name: 'allottedRatio',
        width: 120,
      },
      {
        name: 'suggestedRemark',
        width: 100,
      },
      {
        name: 'newPrice',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'preQuotationPrice',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        name: 'rfxQuantity',
        width: 120,
        renderer: renderNumberFormatter,
      },
      {
        name: 'validQuotationQuantity',
        width: 120,
        renderer: renderNumberFormatter,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      {
        name: 'totalPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => value && this.renderTotalPrice(value, record),
      },
      {
        name: 'netAmount',
        width: 140,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            financial={record.get('currencyCode')}
            value={value}
            type="c7n"
            readOnly
          />
        ),
      },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 100,
          }
        : {
            name: 'netEstimatedPrice',
            width: 100,
          },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 100,
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                financial={record.get('currencyCode')}
                value={value}
                type="c7n"
                readOnly
              />
            ),
          }
        : {
            name: 'netEstimatedAmount',
            width: 100,
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                financial={record.get('currencyCode')}
                value={value}
                type="c7n"
                readOnly
              />
            ),
          },
      {
        name: 'validQuotationRemark',
        width: 120,
      },
      {
        name: 'origin',
        width: 100,
      },
      {
        name: 'paymentTypeName',
        width: 120,
      },
      {
        name: 'paymentTermName',
        width: 120,
      },
      {
        name: 'validExpiryDateFrom',
        width: 150,
      },
      {
        name: 'validExpiryDateTo',
        width: 150,
      },
      {
        name: 'validPromisedDate',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPurchaseQuantity',
        width: 120,
        renderer: renderNumberFormatter,
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPackageQuantity',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'freightIncludedFlag',
        width: 100,
        renderer: renderFlagDisplay,
      },
      {
        name: 'freightAmount',
        width: 100,
        renderer: ({ record, value }) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ALL_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return (
            <PrecisionInputNumber
              value={value}
              financial={record.get('quotationCurrencyCode')}
              readOnly
              {...cuxFreightAmountProps}
            />
          );
        },
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'changePercent',
        width: 100,
      },
      {
        name: 'supplierSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'supplierSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'itemSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemMinMaxSuggestedFlag',
        width: 130,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'quotationLineSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'quotationLineSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemSignPostPrice',
      },
      {
        name: 'attachmentUuid',
        width: 120,
        renderer: ({ value, record }) => {
          return !newQuotationFlag ? (
            <Attachment
              name="attachmentUuid"
              record={record}
              readOnly
              viewMode="popup"
              funcType="link"
            />
          ) : (
            <FileGroup
              name="attachmentUuid"
              record={record}
              uiType="c7n-pro"
              fileType="LINE"
              fileProps={{
                // bucketName: PRIVATE_BUCKET,
                bucketDirectory: 'ssrc-rfx-quotationline',
                lineUuid: value,
              }}
            />
          );
        },
      },
      {
        name: 'applicationScopeFlag',
        width: 100,
        renderer: ({ record }) => {
          const { rfxLineItemId = null, applicationScopeFlag = 0 } =
            record.get(['rfxLineItemId', 'applicationScopeFlag']) || {};

          return (
            <a
              disabled={!applicationScopeFlag || !rfxLineItemId}
              onClick={() => this.viewApplicationOrgModal(record)}
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      {
        name: 'comparePriceHistory',
        width: 120,
        renderer: ({ record }) =>
          record.quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
      ...commonColumns,
    ];

    const columns = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ALL_TABLE_COLUMNS', preColumns, {
          bidFlag: sourceKey === 'BID',
          that: this,
          headerInfoDs,
        })
      : preColumns;

    const preTableProps = {
      dataSet: allQuoteLineDs,
      columns,
      style: { maxHeight: 'calc(70vh - 100px)' },
    };
    const tableProps = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ALL_TABLE_PROPS', preTableProps, {
          C7nPrecisionInputNumber,
          numberSeparatorRender,
          that: this,
        })
      : preTableProps;
    return (
      <React.Fragment>
        <NoQuotedItemView headerDs={headerInfoDs} />
        {this.renderForm()}
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`,
            readOnly: remote
              ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ALL_TABLE_READONLY', true, {
                  bidFlag: sourceKey === 'BID',
                  that: this,
                })
              : true,
          },
          <Table {...tableProps} />
        )}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}
const hocFunc = (com) =>
  compose(
    connect(({ inquiryHall }) => ({
      inquiryHall,
    })),
    Form.create({ fieldNameProp: null })
  )(com);

export { hocFunc, QuoteLineTable };
export default hocFunc(QuoteLineTable);
