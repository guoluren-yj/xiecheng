import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

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
    doubleUnitFlag = false,
    getCustomizeUnitCode = () => {},
    quotationRemote,
    bidFlag = false,
    pageType = '',
  } = props;

  const { tenantId, rfxStatus, sourceCategory } = basicFormDS?.current
    ? basicFormDS.current?.get(['tenantId', 'rfxStatus', 'sourceCategory'])
    : {};

  const RFAFlag = useMemo(() => sourceCategory === 'RFA', [sourceCategory]);

  // buttons
  const getButtons = () => {
    let buttons = [];

    buttons = quotationRemote
      ? quotationRemote.process('SSRC_RFSUPPLIER_QUOTATION_APPLY_PROCESS_TABLE_BUTTONS', buttons, {
          basicFormDS,
          quotationLineDS,
          pageType,
          pageProps: props,
        })
      : buttons;
    buttons = (buttons || []).filter(Boolean);

    return buttons;
  };

  const preColumns = useMemo(
    () => [
      {
        name: 'rfxLineItemNum',
        width: 80,
        // lock: 'left',
      },
      {
        name: 'itemName',
        // lock: 'left',
      },
      doubleUnitFlag
        ? {
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
          }
        : null,
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
      {
        width: 140,
        name: 'demandDate',
      },
      {
        width: 140,
        name: 'specs',
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
        width: 120,
        name: 'ladderInquiry',
        renderer: ({ record }) => {
          const ladderInquiryFlag = record.get('ladderInquiryFlag');

          return ladderInquiryFlag === 1 ? (
            <LadderPrice
              readOnly
              record={record}
              organizationId={organizationId}
              pageName="applyQuotation"
              doubleUnitFlag={doubleUnitFlag}
            />
          ) : (
            '-'
          );
        },
      },
      {
        width: 120,
        name: 'priceDetail',
        renderer: ({ record }) => {
          return (
            <QuotationDetail
              uiType="c7n-pro"
              rowData={record}
              tenantId={tenantId}
              sourceFrom="RFX"
              detailFrom="SUP_QUOTATION" // 针对一些子模块的情况
              allowSupplierViewFlag
              rfxStatus={rfxStatus}
              unParticapateFlag={1} // 未参与标识
              bidFlag={bidFlag}
            />
          );
        },
      },
      {
        name: 'batchPrice',
        width: 120,
        align: 'right',
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
        width: 140,
        name: 'validExpiryDateFrom',
      },
      {
        width: 140,
        name: 'validExpiryDateTo',
      },
      {
        width: 120,
        name: 'attachmentUuid',
        // editor: ({ record }) => (
        //   <Attachment
        //     readOnly
        //     tenantId={organizationId}
        //     value={record.get('attachmentUuid')}
        //     viewMode="popup"
        //   />
        // ),
      },
    ],
    [basicFormDS, quotationLineDS, RFAFlag, custLoading, doubleUnitFlag]
  );

  const columns = quotationRemote
    ? quotationRemote.process('SSRC_RFSUPPLIER_QUOTATION_APPLY_PROCESS_TABLE_COLUMNS', preColumns, {
        basicFormDS,
        pageType,
      })
    : preColumns;

  return (
    <div>
      {customizeTable(
        { code: getCustomizeUnitCode('table') },
        <Table
          bordered
          custLoading={custLoading}
          dataSet={quotationLineDS}
          rowKey="rfxLineItemId"
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
