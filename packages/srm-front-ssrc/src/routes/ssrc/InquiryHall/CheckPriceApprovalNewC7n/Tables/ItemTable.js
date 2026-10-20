import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import { INQUIRY } from '@/utils/globalVariable';
import styles from './index.less';

const ItemTable = observer((props = {}) => {
  const {
    customizeTable = () => {},
    sourceKey = INQUIRY,
    headerInfo = {},
    doubleUnitFlag = false,
    supplierTableDs,
    itemTableDs,
    viewType = 'supplier',
    linktoPrNumDetail,
  } = props || {};

  const [tableDs, setTableDs] = useState(supplierTableDs);
  const [tableColumns, setTableColumns] = useState([]);

  // 单据来源为采购申请转立项转寻源
  const purchaseRequestFlag = tableDs?.some((item) => item && item?.get('prLineId'));

  useEffect(() => {
    setTableDs(viewType === 'supplier' ? supplierTableDs : itemTableDs);
    setTableColumns(viewType === 'supplier' ? supplierColumns : itemColumns);
  }, [supplierTableDs, itemTableDs, viewType, purchaseRequestFlag]);

  const itemColumns = useMemo(() => {
    return [
      {
        name: 'supplierCompanyName',
      },
      {
        name:
          headerInfo?.priceTypeCode === 'NET_PRICE' ? 'localLnNetPrice' : 'localLnQuotationPrice',
        align: 'right',
      },
      doubleUnitFlag && {
        name: headerInfo?.priceTypeCode === 'NET_PRICE' ? 'baseNetPrice' : 'baseQuotationPrice',
        align: 'right',
      },
      doubleUnitFlag && {
        name: 'secondaryQuantity',
        align: 'right',
      },
      {
        name: 'rfxQuantity',
        align: 'right',
      },
      doubleUnitFlag && {
        name: 'allottedSecondaryQuantity',
        align: 'right',
      },
      {
        name: 'allottedQuantity',
        align: 'right',
      },
      {
        name:
          headerInfo?.priceTypeCode === 'NET_PRICE'
            ? 'localSuggestedLnNetAmount'
            : 'localSuggestedLnTotalAmount',
        align: 'right',
      },
      {
        name: 'suggestedFlag',
        renderer: ({ value = 0 }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'suggestedRemark',
      },
      {
        name: 'attachmentUuid',
        tooltip: 'none',
        renderer: ({ record }) => {
          return !headerInfo?.newQuotationFlag ? (
            <Attachment
              name="attachmentUuid"
              record={record}
              readOnly
              funcType="link"
              viewMode="popup"
              previewTarget="_blank"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);
  }, [headerInfo, doubleUnitFlag]);

  const supplierColumns = useMemo(() => {
    return [
      {
        name: 'rfxLineItemNum',
      },
      {
        name: 'itemName',
      },
      {
        name:
          headerInfo?.priceTypeCode === 'NET_PRICE' ? 'localLnNetPrice' : 'localLnQuotationPrice',
        align: 'right',
      },
      doubleUnitFlag && {
        name: headerInfo?.priceTypeCode === 'NET_PRICE' ? 'baseNetPrice' : 'baseQuotationPrice',
        align: 'right',
      },
      {
        name: 'lastBiddedPrice',
        align: 'right',
      },
      {
        name: 'savingRatio',
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      doubleUnitFlag && {
        name: 'secondaryQuantity',
        align: 'right',
      },
      {
        name: 'rfxQuantity',
        align: 'right',
      },
      doubleUnitFlag && {
        name: 'allottedSecondaryQuantity',
        align: 'right',
      },
      {
        name: 'allottedQuantity',
        align: 'right',
      },
      {
        name: 'suggestedRemark',
      },
      purchaseRequestFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record }) => {
              const { prData, prHeaderId, prDisplayNum = '' } = record.get([
                'prData',
                'prHeaderId',
                'prDisplayNum',
              ]);
              if (prHeaderId) {
                if (prData) {
                  return JSON.parse(prData).map((prItem) => {
                    return (
                      <a onClick={() => linktoPrNumDetail(record)}>
                        {`${prItem.displayPrNum}|${prItem.displayLineNum}`}{' '}
                      </a>
                    );
                  });
                } else {
                  return <a onClick={() => linktoPrNumDetail(record)}>{prDisplayNum || ''}</a>;
                }
              } else {
                return prDisplayNum || '';
              }
            },
          }
        : null,
    ].filter(Boolean);
  }, [headerInfo, doubleUnitFlag, purchaseRequestFlag, tableDs]);

  const renderRow = useCallback(({ record }) => {
    const suggestedFlag = record?.get('suggestedFlag') || 0;
    if (suggestedFlag !== 1) {
      return {
        className: styles.tableDisabled,
      };
    }
  }, []);

  const tableProps = {
    columns: tableColumns,
    dataSet: tableDs,
    style: { maxHeight: 520 },
    onRow: renderRow,
  };

  return customizeTable(
    {
      code:
        viewType === 'supplier'
          ? `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.SUPPLIER_TABLES`
          : `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ITEM_TABLES`,
      dataSet: tableDs,
    },
    <Table {...tableProps} />
  );
});

export default ItemTable;
