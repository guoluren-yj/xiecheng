import React, { useMemo } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { yesOrNoRender } from 'utils/renderer';
 
export default function BankInfo({ dataSet }: { dataSet: DataSet }) {
  // 供货能力
  const columns: ColumnProps[] = useMemo(
    () => [
      {
        name: 'bankCountryIdMeaning',
      },
      {
        name: 'bankCode',
      },
      {
        name: 'bankName',
      },
      {
        name: 'bankFirm',
      },
      {
        name: 'bankBranchName',
      },
      {
        name: 'bankAccountName',
      },
      {
        name: 'bankAccountNum',
      },
      {
        name: 'accountNatureMeaning',
      },
      {
        name: 'accountPurposeMeaning',
      },
      {
        name: 'currencyIdMeaning',
      },
      {
        name: "bankIdentifyCodeTypeMeaning",
        width: 120,
      },
      {
        name: "bankIdentifyCode",
        width: 200,
      },
      {
        name: 'paymentTypeIdMeaning',
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'masterFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'remark',
      },
    ],
    []
  );
  return <Table dataSet={dataSet} columns={columns} rowHeight={32} />;
}
