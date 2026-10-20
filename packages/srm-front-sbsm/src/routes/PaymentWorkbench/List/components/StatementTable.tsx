import React, { useContext, useMemo, memo } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { ActiveKey, GridCustCodeMap, FilterCustCodeMap } from '../../utils/type';

const activeKey = ActiveKey.DetailStatement;

const SettlementTable = memo(() => {
  const { dsMap, customizeTable, handleToDetail } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap]);


  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'payHeaderStatus', width: 150, renderer: statusTagRender },
      {
        name: 'payHeaderNum',
        width: 200,
        renderer: ({ value, record }) => (
          <a onClick={() => handleToDetail(record?.get('payHeaderId'))}>
            {value}
          </a>
        ),
      },
      { name: 'companyNum', width: 150 },
      { name: 'companyName', width: 200 },
      { name: 'ouName', width: 200 },
      { name: 'displaySupplierNum', width: 150 },
      { name: 'displaySupplierName', width: 200 },
      { name: 'supplierSiteName', width: 150 },
      { name: 'currencyCode', width: 100 },
      { name: 'payTypeName', width: 150 },
      { name: 'payFormMeaning', width: 150 },
      { name: 'createdByName', width: 150 },
      { name: 'payHeaderCreationDate', width: 150 },
      { name: 'approveBatchNum', width: 150 },
      { name: 'lineNum', width: 150 },
      { name: 'payBankName', width: 150 },
      { name: 'payBankBranchName', width: 180 },
      { name: 'payBankFirm', width: 150 },
      { name: 'payBankAccountNum', width: 150 },
      { name: 'payBankAccountName', width: 150 },
      { name: 'bankName', width: 150 },
      { name: 'bankBranchName', width: 180 },
      { name: 'bankFirm', width: 150 },
      { name: 'bankAccountNum', width: 150 },
      { name: 'bankAccountName', width: 150 },
      { name: 'payAmount', width: 150 },
      { name: 'payStatus', width: 150, renderer: statusTagRender },
      { name: 'payCommandNum', width: 200 },
      { name: 'paperNum', width: 150 },
      { name: 'dataSourceMeaning', width: 150 },
      { name: 'paperTypeMeaning', width: 150 },
      { name: 'paperStatus', width: 150 },
      { name: 'receiveBankName', width: 150 },
      { name: 'drawer', width: 150 },
      { name: 'acceptor', width: 150 },
      { name: 'payer', width: 150 },
      { name: 'invoiceDate', width: 150 },
      { name: 'issueDate', width: 150 },
      { name: 'draftsDeadLine', width: 150 },
    ];
  }, [handleToDetail]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCodeMap[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={currentListDs}
          columns={columns}
          searchCode={FilterCustCodeMap[activeKey]}
          style={{ maxHeight: 'calc(100% - 20px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="payNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.paymentWorkbench.view.placeholder.enterPayDocNumToQuery')
                    .d('请输入支付单编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
});

export default SettlementTable;
