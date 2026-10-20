import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender, roundEliminate } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailCurrent/Detail';
import QuotationHistory from '@/routes/ssrc/RFSupplierQuotation/Quotation/Modals/QuotationHistory';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';

import LadderPrice from '@/routes/ssrc/components/LadderPrice';

const PaginationOptions = {
  pageSizeOptions: ['10', '20', '50', '100', '200'],
};

const QuotationLineTable = (props) => {
  const {
    quotationLineDS,
    customizeTable = noop,
    custLoading,
    organizationId,
    basicFormDS,
    getCustomizeUnitCode = () => {},
    quotationName = '',
    doubleUnitFlag = false,
    pageType = '',
    quotationRemote,
    bidFlag = 0,
    historyDestroyAllFlag,
    externalHiddenField = false,
    externalModulesFlag = 0,
  } = props;

  const { tenantId, rfxStatus, priceTypeCode, sourceCategory } = basicFormDS?.current
    ? basicFormDS?.current?.get(['tenantId', 'rfxStatus', 'priceTypeCode', 'sourceCategory'])
    : {};

  const RFAFlag = sourceCategory === 'RFA';

  // line status
  // const quotationLineStatusTableColor = useCallback(
  //   ({ record }) => {
  //     const { displayQuotationLineStatus, displayQuotationLineStatusMeaning } = record.get([
  //       'displayQuotationLineStatus',
  //       'displayQuotationLineStatusMeaning',
  //     ]);
  //     if (!displayQuotationLineStatus) {
  //       return;
  //     }

  //     let color = '';
  //     let backGround = '';
  //     switch (displayQuotationLineStatus) {
  //       case 'NEW':
  //       case 'ROUND_QUOTATION':
  //         color = '#F88D10';
  //         backGround = 'rgba(252,160,0,0.10)';
  //         break;
  //       case 'SUBMITTED':
  //         color = '#47B881';
  //         backGround = 'rgba(71,184,129,0.10)';
  //         break;
  //       case 'ABANDONED':
  //         color = 'rgba(0,0,0,0.65)';
  //         backGround = 'rgba(0,0,0,0.06)';
  //         break;
  //       default:
  //         color = '#0687FF';
  //         backGround = '#DAEDFE';
  //         break;
  //     }

  //     return (
  //       <Tag
  //         style={{
  //           textAlign: 'center',
  //           backgroundColor: backGround,
  //           color,
  //           border: 0,
  //         }}
  //       >
  //         {displayQuotationLineStatusMeaning}
  //       </Tag>
  //     );
  //   },
  //   [basicFormDS]
  // );

  // buttons
  const getButtons = () => {
    let buttons = [];

    buttons = quotationRemote
      ? quotationRemote.process('SSRC_SUPPLIER_QUOTATION_NEW_QUERY_TABLE_BUTTONS', buttons, {
          basicFormDS,
          quotationLineDS,
          pageType,
          pageProps: props,
        })
      : buttons;
    buttons = (buttons || []).filter(Boolean);

    return buttons;
  };

  const columns = useMemo(() => {
    const columnsArr = [
      // {
      //   name: 'rfxLineItemNum',
      //   width: 80,
      // },
      {
        name: 'displayQuotationLineStatusMeaning',
        // renderer: quotationLineStatusTableColor,
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
      {
        name: 'itemName',
        width: 220,
        renderer: ({ value, record }) => {
          return roundEliminate(value, record, { uiType: 'c7n-pro' });
        },
      },
      {
        name: 'secondaryQuantityAndUomCombine',
        width: 120,
        hidden: !doubleUnitFlag,
        renderer: ({ record }) => {
          const { secondaryUomName, secondaryQuantity } = record.get([
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
          const { uomName, rfxQuantity } = record.get(['uomName', 'rfxQuantity']);

          return rfxQuantity && uomName
            ? `${numberSeparatorRender(rfxQuantity)}-${uomName}`
            : rfxQuantity || uomName;
        },
      },
      {
        width: 140,
        name: 'demandDate',
      },
      {
        name: 'rfxAttachmentUuid',
        width: 100,
      },
      {
        width: 140,
        name: 'specs',
      },
      {
        name: 'allottedQuantity',
        width: 100,
        hidden: rfxStatus !== 'FINISHED',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        title:
          priceTypeCode === 'NET_PRICE'
            ? intl
                .get(`ssrc.queryQuotation.model.queryQuotation.successfulBidAmountNet`)
                .d('中标金额(不含税)')
            : intl
                .get(`ssrc.queryQuotation.model.queryQuotation.successfulBidAmountTaxIn`)
                .d('中标金额(含税)'),
        name: 'bidPrice',
        width: 120,
        hidden: rfxStatus !== 'FINISHED',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'abandonedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'quotationSecondaryPrice',
        width: 100,
        align: 'right',
        hidden: !doubleUnitFlag || externalHiddenField,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validNetSecondaryPrice',
        width: 100,
        align: 'right',
        hidden: !doubleUnitFlag || externalHiddenField,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotationPrice',
        width: 120,
        align: 'right',
        hidden: externalHiddenField,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validNetPrice',
        width: 120,
        align: 'right',
        hidden: externalHiddenField,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        width: 120,
        name: 'ladderInquiry',
        hidden: externalHiddenField,
        renderer: ({ record }) => {
          const { ladderInquiryFlag, abandonedFlag, eliminateFlag } = record.get([
            'ladderInquiryFlag',
            'abandonedFlag',
            'eliminateFlag',
          ]);

          const ladderVisibleFlag = ladderInquiryFlag === 1 && !abandonedFlag && !eliminateFlag;

          return ladderVisibleFlag ? (
            <LadderPrice
              readOnly
              uiType="c7n-pro"
              pageName="quotationHistory"
              headerDS={basicFormDS}
              record={record}
              doubleUnitFlag={doubleUnitFlag}
              organizationId={organizationId}
              quotationRemote={quotationRemote}
              remotePrefixCode="SSRC_SUPPLIER_QUOTATION_NEW_QUERY"
            />
          ) : null;
        },
      },
      {
        width: 120,
        name: 'priceDetail',
        hidden: externalHiddenField,
        renderer: ({ record }) => {
          const { quotationDetailFlag, abandonedFlag, eliminateFlag } = record.get([
            'quotationDetailFlag',
            'abandonedFlag',
            'eliminateFlag',
          ]);

          const quotationDetailVisibleFlag =
            quotationDetailFlag && !abandonedFlag && !eliminateFlag && !externalHiddenField;
          if (!quotationDetailVisibleFlag) {
            return;
          }

          return (
            <QuotationDetail
              bidFlag={bidFlag}
              uiType="c7n-pro"
              rowData={record}
              tenantId={tenantId}
              sourceFrom="RFX"
              detailFrom="SUP_QUOTATION" // 针对一些子模块的情况
              allowBuyerViewFlag
              rfxStatus={rfxStatus}
              quotationHistoryFlag={pageType === 'HISTORY_VERSION' || externalModulesFlag} // 报价查询和历史版本需要掉用不同的接口
            />
          );
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'totalAmount',
        width: 100,
        align: 'right',
        hidden: externalHiddenField,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netAmount',
        width: 100,
        align: 'right',
        hidden: externalHiddenField,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        width: 120,
        name: 'taxIncludedFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        width: 120,
        name: 'taxRate',
        align: 'right',
      },
      {
        name: 'quotationSecondaryQuantity',
        width: 120,
        hidden: !doubleUnitFlag,
        align: 'right',
      },
      {
        name: 'quotationQuantity',
        width: 120,
        align: 'right',
      },
      {
        name: 'deliveryCycle',
        width: 120,
        align: 'right',
      },
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
        name: 'quotationExpiryDateFrom',
        width: 140,
      },
      {
        name: 'quotationExpiryDateTo',
        width: 140,
      },
      {
        name: 'freightIncludedFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freightAmount',
        width: 120,
      },
      {
        width: 120,
        name: 'attachmentUuid',
        // renderer: ({ record }) => (
        //   <Attachment
        //     readOnly
        //     tenantId={organizationId}
        //     value={record.get('attachmentUuid')}
        //     viewMode="popup"
        //   />
        // ),
      },
      {
        name: 'quotationHistory',
        width: 120,
        hidden: externalHiddenField,
        renderer: ({ record }) => {
          const { abandonedFlag } = record.get(['abandonedFlag']);

          const quotationHistoryVisibleFlag = !abandonedFlag || externalHiddenField;
          if (!quotationHistoryVisibleFlag) {
            return '-';
          }

          const historyProps = {
            record,
            organizationId,
            customizeUnitCode: getCustomizeUnitCode('history'),
            quotationName,
            customizeTable,
            doubleUnitFlag,
            headerDS: basicFormDS,
            historyDestroyAllFlag,
          };

          return <QuotationHistory {...historyProps} />;
        },
      },
    ];

    const cuxColumnsProps = {
      bidFlag,
      basicFormDS,
      quotationLineDS,
    };

    const currentColumns = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_TABLE_COLUMNS',
          columnsArr,
          cuxColumnsProps
        )
      : columnsArr;

    return (currentColumns || []).filter(Boolean);
  }, [
    basicFormDS,
    getCustomizeUnitCode,
    rfxStatus,
    doubleUnitFlag,
    pageType,
    bidFlag,
    externalHiddenField,
    externalModulesFlag,
  ]);

  return (
    <div>
      {customizeTable(
        { code: getCustomizeUnitCode('table') },
        <Table
          bordered
          custLoading={custLoading}
          dataSet={quotationLineDS}
          rowKey="quotationLineId"
          virtual
          virtualCell
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          columns={columns}
          buttons={getButtons()}
          pagination={PaginationOptions}
        />
      )}
    </div>
  );
};

const hocComponent = (Com) => {
  return observer(Com);
};

export default hocComponent(QuotationLineTable);
