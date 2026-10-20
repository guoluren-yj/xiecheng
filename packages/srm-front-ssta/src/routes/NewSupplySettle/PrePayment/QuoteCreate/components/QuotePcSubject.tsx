import React, { useContext, useMemo, useEffect } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { ActiveKey, GridCustCode, SearchCustCode } from '../utils/type';

const key = ActiveKey.PcSubject;

const QuotePcSubject = ({ onInit }) => {

  const { listDsMap, customizeTable } = useContext<StoreValueType>(Store);
  const listDs = listDsMap[key];

  useEffect(() => {
    if (onInit) onInit(key);
  }, [onInit]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'associateNum',
        width: 200,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 160,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 160,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 160,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 160,
      },
      {
        name: 'pcName',
        width: 200,
      },
      {
        name: 'associateLineNum',
        width: 160,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 180,
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
        width: 200,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'lineAmount',
        width: 120,
      },
      {
        name: 'taxAmount',
        width: 160,
      },
      {
        name: 'pcTypeName',
        width: 180,
      },
      {
        name: 'pcStatusCodeMeaning',
        width: 180,
      },
      {
        name: 'createByRealName',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'pendingFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'purchaseAgentId',
        width: 120,
      },
      {
        name: 'purchaseOrgId',
        width: 120,
      },
    ];
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
    />
  );
};

export default QuotePcSubject;
