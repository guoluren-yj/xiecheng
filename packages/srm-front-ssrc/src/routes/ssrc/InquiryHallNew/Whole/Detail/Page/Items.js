import React, { useCallback, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import intl from 'utils/intl';
// import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';

import Styles from '../../Update/index.less';

const Items = (props = {}) => {
  const {
    // history,
    // basicFormDS,
    linktoPrNumDetail = noop,
    doubleUnitFlag,
    // rfxHeaderId,
    customizeUnitCode,
    itemLineDS,
    customizeTable = noop,
    custLoading,
    purchaseTurnFlag = false,
    viewItemLineApplicationOrgModal = noop,
  } = props;

  useEffect(() => {
    if (!itemLineDS) {
      return;
    }

    itemLineDS.query();
  }, []);

  const getItemColumns = useCallback(() => {
    return [
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
      },
      {
        name: 'itemCategoryName',
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 100,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'taxIncludedFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        width: 150,
        name: 'taxRate',
        align: 'right',
      },
      {
        name: 'uomName',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 120,
          }
        : null,
      {
        width: 150,
        name: 'demandDate',
      },
      {
        name: 'batchPrice',
        width: 150,
      },
      // {
      //   name: 'controlProtocolFlag',
      //   width: 150,
      //   renderer: ({ value }) => yesOrNoRender(value),
      // },
      // {
      //   name: 'costPrice',
      //   width: 120,
      //   renderer: ({ value }) => numberSeparatorRender(value),
      // },
      // {
      //   name: 'resultExecutionStrategy',
      //   width: 120,
      // },
      // {
      //   name: 'model',
      //   width: 150,
      // },
      // {
      //   width: 120,
      //   name: 'ladderInquiryFlag',
      //   align: 'left',
      //   renderer: ({ value }) => yesOrNoRender(value),
      // },
      // {
      //   name: 'ladderOffer',
      //   width: 100,
      //   renderer: ({ record }) => {
      //     return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
      //       <a onClick={() => viewLadderLevelPrepare(record)}>
      //         {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
      //       </a>
      //     ) : null;
      //   },
      // },

      // {
      //   name: 'quotationDetailFlag',
      //   width: 100,
      //   renderer: ({ record }) =>
      //     record.get('rfxLineItemId') && record.get('creationDate') ? (
      //       <QuotationDetail rowData={record} uiType="c7n" sourceFrom="RFX" />
      //     ) : null,
      // },
      purchaseTurnFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => {
              const { prData, prHeaderId } = record.get(['prData', 'prHeaderId']);

              if (prHeaderId) {
                if (prData) {
                  return JSON.parse(prData).map((prItem) => {
                    return (
                      <a onClick={() => linktoPrNumDetail(record, prItem?.prHeaderId)}>
                        {`${prItem?.displayPrNum}|${prItem?.displayLineNum}`}{' '}
                      </a>
                    );
                  });
                } else {
                  return <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>;
                }
              } else {
                return value;
              }
            },
          }
        : null,
      purchaseTurnFlag
        ? {
            name: 'prDisplayLineNum',
            width: 150,
          }
        : null,
      {
        name: 'specs',
        width: 150,
      },
      // {
      //   name: 'freightIncludedFlag',
      //   width: 150,
      //   renderer: ({ value }) => yesOrNoRender(value),
      // },
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
        name: 'attachmentUuid',
        width: 150,
      },
    ].filter(Boolean);
  }, [doubleUnitFlag, linktoPrNumDetail]);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ marginBottom: '16px', }}>
        <div className={Styles['ssrc-border-left-line']} />
        {intl.get('ssrc.inquiryHall.view.title.itemMaterials').d('物料')}
      </h3>

      {customizeTable(
        { code: customizeUnitCode },
        <Table
          bordered
          custLoading={custLoading}
          dataSet={itemLineDS}
          rowKey="rfxLineItemId"
          columns={getItemColumns()}
          style={{ maxHeight: '40vh' }}
        />
      )}
    </div>
  );
};

export default observer(Items);
