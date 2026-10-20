import React, { useContext, useMemo, useEffect } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { ActiveKey, GridCustCode, SearchCustCode } from '../utils/type';

const key = ActiveKey.Contract;

const QuoteContract = ({ onInit }) => {

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
        name: 'originalTaxIncludeAmount',
        width: 160,
      },
      {
        name: 'originalAmount',
        width: 160,
      },
      {
        name: 'pcName',
        width: 200,
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
        name: 'pcTypeName',
        width: 180,
      },
      {
        name: 'startDateActive',
        width: 150,
      },
      {
        name: 'endDateActive',
        width: 150,
      },
      {
        name: 'realName',
        width: 180,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'confirmedDate',
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

export default QuoteContract;
