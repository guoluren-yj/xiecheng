import React, { useContext, useMemo, useEffect } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { ActiveKey, GridCustCode, SearchCustCode } from '../utils/type';

const key = ActiveKey.PoLine;
const tenantId = getCurrentOrganizationId();

const QuotePoLine = ({ onInit }) => {

  const { listDsMap, customizeTable } = useContext<StoreValueType>(Store);
  const listDs = listDsMap[key];

  useEffect(() => {
    if (onInit) onInit(key);
  }, [onInit]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'displayNum',
        width: 200,
        renderer: ({ record }) => `${record?.get('displayNum')}-${record?.get('displayLineNum')}`,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 150,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 150,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 150,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 150,
      },
      {
        name: 'lineAmount',
        width: 150,
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'ouName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
      },
      {
        name: 'orderTypeName',
        width: 150,
      },
      {
        name: 'organizationName',
        width: 180,
      },
      {
        name: 'purchaseAgentName',
        width: 180,
      },
      {
        name: 'itemName',
        width: 180,
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'taxIncludedAmount',
        width: 150,
      },
      {
        name: 'amount',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'poCreateName',
        width: 150,
      },
      {
        name: 'pendingFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'releasedDate',
        width: 150,
      },
      {
        name: 'agentId',
        width: 120,
      },
      {
        name: 'purchaseOrgId',
        width: 120,
      },
    ];
  }, []);

  const searchBarConfig = useMemo(() => {
    return {
      fieldProps: {
        supplierSiteId: {
          dynamicProps: {
            disabled: ({ record }) => !record.get('supplierLovKey')?.supplierId,
            lovPara: ({ record }) => ({
              supplierId: record.get('supplierLovKey')?.supplierId,
              tenantId,
            }),
          },
        },
      },
    };
  }, []);

  return customizeTable(
    {
      code: GridCustCode[key],
    },
    <SearchBarTable
      columns={columns}
      dataSet={listDs}
      searchCode={SearchCustCode[key]}
      style={{ maxHeight: `calc(100vh - 230px)` }}
      searchBarConfig={searchBarConfig}
    />
  );
};

export default QuotePoLine;
