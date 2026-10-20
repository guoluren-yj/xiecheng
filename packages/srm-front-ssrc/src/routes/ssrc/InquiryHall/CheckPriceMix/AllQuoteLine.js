import React, { useMemo, Fragment, useImperativeHandle, useRef, useCallback } from 'react';
import { Table, Attachment, DataSet, Form, Select, Button, Output, Modal } from 'choerodon-ui/pro';
import { compose, noop } from 'lodash';
import { observer } from 'mobx-react';

import { yesOrNoRender, dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender, roundEliminateC7N } from '@/utils/renderer';
import { batchChangeChooseStrategy } from '@/services/inquiryHallService';
import { PRIVATE_BUCKET } from '_utils/config';

import { strategyDS, ladderQuotationTableDS } from './AllQuoteLineDS';
import { INQUIRY } from '@/utils/globalVariable';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import styles from './index.less';

const AllQuoteLine = (props) => {
  const {
    organizationId,
    quoteLineDs,
    rfxHeaderId,
    checkWay,
    customizeTable,
    rankRule,
    priceTypeCode,
    multiCurrencyFlag,
    fetchQueryPriceInfoLoading,
    fetchItemLine,
    fetchSupplierLine,
    allQuoteLineRef,
    sourceKey = INQUIRY,
    renderValidQuotationQuantity = noop,
    auctionDirection,
  } = props;

  const applicationScopeRef = useRef();
  const strategyDs = useMemo(() => new DataSet(strategyDS()), []);
  const ladderQuotationTableDs = useMemo(() => new DataSet(ladderQuotationTableDS()), []);

  useImperativeHandle(allQuoteLineRef, () => {
    // 需要被暴露出去的方法或变量
    return {
      strategyDs,
    };
  });

  // 改变选择策略
  const changeStrategy = (value) => {
    const tableData = quoteLineDs.toData();
    const rfxQuotationLineList = tableData.filter((item) => item.suggestedFlag);
    if (value) {
      // 给全部报价明细ds设置selectStrategy
      quoteLineDs.setState('selectStrategy', value);
      batchChangeChooseStrategy({
        rfxHeaderId,
        selectStrategy: value,
        rfxQuotationLineList,
      }).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          quoteLineDs.query();
          notification.success();
          fetchItemLine();
          fetchSupplierLine();
        }
      });
    }
  };

  // 适用范围
  const viewItemLineApplicationOrgModal = (record) => {
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal({
      sourceLineItemId: rfxLineItemId,
      applicationScopeFlag,
    });
  };

  // 查看适用范围
  const viewApplicationOrgModal = (params = {}) => {
    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        ...params,
      },
      onRef: applicationScopeRef,
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
    });
  };

  const showLadderQuotation = (record) => {
    ladderQuotationTableDs.setQueryParameter('commonProps', {
      quotationLineId: record.get('quotationLineId'),
      customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`,
    });
    ladderQuotationTableDs.query();

    const columns = [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 120,
      },
      {
        name: 'ladderTo',
        width: 120,
      },
      {
        name: 'validLadderPrice',
        width: 100,
      },
      {
        name: 'validNetLadderPrice',
        width: 100,
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'validBargainPrice',
        width: 130,
      },
      {
        name: 'remark',
        width: 100,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      footer: null,
      closable: true,
      className: styles['rfx-ladder-quotation-modal-wrapper'],
      children: (
        <React.Fragment>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          <Form
            labelLayout="vertical"
            columns={3}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
              value={record.get('companyName')}
            />
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
              value={record.get('itemCode')}
            />
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
              value={record.get('itemName')}
            />
          </Form>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          {customizeTable(
            { code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE` },
            <Table dataSet={ladderQuotationTableDs} columns={columns} />
          )}
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
    });
  };

  /**
   * 渲染单价样式
   * 竞价方向为正向时，行号相同的物料，单价最高的标红
   * 否则，单价最小的标红
   */
  // const renderValidQuotationPrice = (val, record, flag) => {
  //   if (val === null) {
  //     return null;
  //   }

  //   const { itemLineFloorPrice, itemLineHighestPrice } = record.get([
  //     'itemLineFloorPrice',
  //     'itemLineHighestPrice',
  //   ]);

  // let rfxLineItemNumList = [];
  // if (flag) {
  //   rfxLineItemNumList =
  //     dataSource &&
  //     dataSource
  //       .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
  //       .map((r) => r.baseQuotationPrice);
  // } else {
  //   rfxLineItemNumList =
  //     dataSource &&
  //     dataSource
  //       .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
  //       .map((r) => r.validQuotationPrice);
  // }
  // const validQuotationPriceMax = Math.max(...rfxLineItemNumList);
  // const validQuotationPriceMin = Math.min(...rfxLineItemNumList);
  //   let min = null;
  //   let max = null;
  //   if (flag) {
  //     min = itemLineFloorPrice;
  //     max = itemLineHighestPrice;
  //   }
  //   let mean = '';
  //   const formatValue = numberSeparatorRender(val);
  //   if (auctionDirection === 'FORWARD') {
  //     mean = max === val ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
  //   } else {
  //     mean = min === val ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
  //   }
  //   return mean;
  // };

  /**
   * 根据报价方向, 过滤选择策略
   */
  const handleOptionsFilter = useCallback(
    (record) => {
      if (auctionDirection === 'FORWARD') {
        // 报价方向为英式（越来越高）时, `FORWARD`
        return record.get('value') !== 'MINIMUM';
      } else if (auctionDirection === 'REVERSE') {
        // 报价方向为荷兰式（越来越低）时 `REVERSE`
        return record.get('value') !== 'MAXIMUM';
      } else {
        // 无要求 `NONE`
        return true;
      }
    },
    [auctionDirection]
  );

  const columns = useMemo(
    () => [
      {
        name: 'suggestedFlag',
        width: 60,
        editor: true,
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
        name: 'applicationScopeFlag',
        width: 100,
        renderer: ({ record }) => {
          const { rfxLineItemId = null, applicationScopeFlag = 0 } = record?.get([
            'rfxLineItemId',
            'applicationScopeFlag',
          ]);

          return (
            <a
              disabled={!applicationScopeFlag || !rfxLineItemId}
              onClick={() => viewItemLineApplicationOrgModal(record)}
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 250,
        renderer: ({ value, record }) => roundEliminateC7N(value, record),
      },
      {
        name: 'candidateSuggestion',
        width: 100,
      },
      {
        name: 'stageDescription',
        width: 120,
      },
      multiCurrencyFlag
        ? {
            name: 'quotationCurrencyCode',
            width: 100,
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'exchangeRate',
            width: 100,
          }
        : '',
      {
        name: 'validQuotationPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validQuotationPrice') {
            return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'priceCoefficient',
            width: 100,
          }
        : '',
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'weightPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : '',
      {
        name: 'validNetPrice',
        width: 100,
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validNetPrice') {
            return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
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
        renderer: ({ record }) => {
          if (
            (priceTypeCode === 'NET_PRICE'
              ? record.get('validNetPrice')
              : record.get('validQuotationPrice')) !== null &&
            (record.get('referencePrice') || record.get('referencePrice') === 0)
          ) {
            return (
              (priceTypeCode === 'NET_PRICE'
                ? record.get('validNetPrice')
                : record.get('validQuotationPrice')) - record.get('referencePrice')
            );
          }
        },
      },
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            width: 100,
            align: 'right',
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'baseQuotationPrice') {
                return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
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
                return <span style={{ color: 'red' }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : '',
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => (
          <QuotationDetail rowData={record} sourceFrom="RFX" uiType="c7n" allowBuyerViewFlag />
        ),
      },
      {
        name: 'priceBatchQuantity',
        width: 110,
        align: 'right',
        editor: true,
      },
      checkWay === 'quantity'
        ? {
            name: 'allottedQuantity',
            width: 100,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber name="allottedQuantity" record={record} uom="uomId" />
              );
            },
          }
        : {
            name: 'allottedRatio',
            width: 120,
            editor: true,
          },
      {
        name: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'suggestedRemark',
        width: 100,
        editor: true,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => showLadderQuotation(record)}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'preQuotationPrice',
        width: 100,
      },
      {
        name: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        name: 'initialFluctuation',
        width: 130,
      },
      {
        name: 'priceCompareToFirst',
        width: 130,
        renderer: ({ value }) => {
          if (value * 1 > 0) {
            return `↑ ${value}`;
          } else if (value * 1 < 0) {
            return `↓ ${value}`;
          } else {
            return value;
          }
        },
      },
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validQuotationQuantity',
        width: 100,
        renderer: ({ value, record }) => renderValidQuotationQuantity(value, record, 'all'),
      },
      {
        name: 'totalPrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netAmount',
        width: 140,
        renderer: ({ value }) => numberSeparatorRender(value),
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
          }
        : {
            name: 'netEstimatedAmount',
            width: 100,
          },
      {
        name: 'validQuotationRemark',
        width: 120,
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
        name: 'attachmentUuid',
        width: 120,
        renderer: ({ value }) => (
          <Attachment
            readOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationline"
            value={value}
            viewMode="popup"
          />
        ),
      },
      {
        name: 'origin',
        width: 120,
      },
      {
        name: 'validExpiryDateFrom',
        width: 150,
        renderer: ({ value }) => dateRender(value),
        editor: true,
      },
      {
        name: 'validExpiryDateTo',
        width: 150,
        renderer: ({ value }) => dateRender(value),
        editor: true,
      },
      {
        name: 'validPromisedDate',
        width: 120,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
        editor: true,
      },
      {
        name: 'minPurchaseQuantity',
        width: 120,
        editor: true,
      },
      {
        name: 'minPackageQuantity',
        width: 100,
      },
      {
        name: 'freightIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freightAmount',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'rfxLineItemNum',
        width: 60,
      },
      {
        name: 'changePercent',
        width: 100,
      },
      {
        name: 'newPrice',
        width: 100,
        renderer: ({ value }) => (value === 0 ? '' : numberSeparatorRender(value)),
      },
      {
        name: 'minPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
    ],
    [checkWay, multiCurrencyFlag, rankRule, priceTypeCode]
  );

  return (
    <Fragment>
      <div>
        <Form dataSet={strategyDs} columns={5} labelWidth={80}>
          {fetchQueryPriceInfoLoading ? (
            <span colSpan={4} style={{ textAlign: 'right' }}>
              <Button icon="sync" loading={fetchQueryPriceInfoLoading}>
                {intl.get(`ssrc.inquiryHall.view.message.button.updating`).d('更新中')}
              </Button>
            </span>
          ) : (
            <span colSpan={4} />
          )}
          <Select
            name="selectedPolicyValue"
            onChange={changeStrategy}
            labelWidth={80}
            optionsFilter={handleOptionsFilter}
          />
        </Form>
      </div>
      {customizeTable(
        { code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL` },
        <Table columns={columns} dataSet={quoteLineDs} style={{ height: 400 }} />
      )}
    </Fragment>
  );
};

export { AllQuoteLine };

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`, // 基础信息
      `SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`, // 阶梯报价-表格信息
    ],
  }),
  observer
)(AllQuoteLine);
