import React, { useEffect, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import querystring from 'querystring';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import { usePriceRender, useAmountRender } from '@/routes/OrderWorkspace/hooks';
import { openModal } from '@/routes/components/AgreementLadderPrice';

const PurchaseAgreement = (props) => {
  const { dataSet, history, customizeTable } = props;
  useEffect(() => {
    dataSet.query();
  }, []);

  const rendererLadderPrice = ({ record }) => {
    const { pcSubjectId, ladderQuotationFlag } = record.get(['pcSubjectId', 'ladderQuotationFlag']);
    const title = intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格');
    return (
      ladderQuotationFlag === 1 &&
      pcSubjectId && <a onClick={() => openModal({ pcSubjectId }, { title })}>{title}</a>
    );
  };

  const columns = useMemo(
    () => [
      {
        name: 'pcNum',
        width: 180,
        renderer: ({ value, record }) => {
          const pcHeaderId = record.get('pcHeaderId');
          return (
            <a
              onClick={() => {
                history.push({
                  pathname: `/sodr/purchase-order-maintain/purchase/detail`,
                  search: pcHeaderId
                    ? querystring.stringify({ pcHeaderId, purchase: 'purchase' })
                    : querystring.stringify({ purchase: 'purchase' }),
                });
              }}
            >
              {value}
            </a>
          );
        },
      },
      {
        name: 'lineNum',
        width: 120,
      },
      {
        name: 'pcName',
        width: 120,
      },
      {
        name: 'supplierCompanyNum',
        width: 120,
        renderer: ({ record }) => record.get('supplierCompanyNum') || record.get('supplierNum'),
      },
      {
        name: 'supplierCompanyName',
        width: 120,
        renderer: ({ record }) => record.get('supplierCompanyName') || record.get('supplierName'),
      },
      {
        name: 'createdByName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 120,
        renderer: ({ value }) => (value ? dateRender(value) : null),
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
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'receiptsOrderQuantity',
        width: 120,
        editor: (record) => record.isSelected,
      },
      {
        name: 'chanageOrderQuantity',
        width: 120,
      },
      {
        name: 'residueOrderQuantity',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'ladderPrice',
        width: 120,
        renderer: rendererLadderPrice,
      },
      {
        name: 'unitPrice',
        width: 120,
        renderer: usePriceRender(),
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: useAmountRender(),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 120,
        renderer: usePriceRender(),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: useAmountRender(),
      },
      {
        name: 'unitPriceBatch',
        width: 100,
      },
      {
        name: 'deliverDate',
        width: 120,
        renderer: ({ value }) => (value ? dateRender(value) : null),
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'ouName',
        width: 120,
      },
      {
        name: 'purchaseOrgName',
        width: 120,
      },
      {
        name: 'agentName',
        width: 120,
      },
      {
        name: 'mainPcNum',
        width: 120,
      },
      {
        name: 'remark',
        width: 120,
      },
    ],
    []
  );
  const tableProps = { dataSet, columns, virtual: true };
  return customizeTable(
    {
      code: 'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE',
      filterCode: 'SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER',
    },
    <Table {...tableProps} />
  );
};

export default PurchaseAgreement;
