import React, { useContext, useMemo, memo } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { ActiveKey, GridCustCodeMap, FilterCustCodeMap } from '../../utils/type';

const activeKey = ActiveKey.DetailPayment;

const PaymentTable = memo(() => {
  const { dsMap, customizeTable, handleToDetail } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'payStatus', width: 150, renderer: statusTagRender },
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
      { name: 'creationDate', width: 150 },
      { name: 'approveBatchNum', width: 150 },
      { name: 'lineNum', width: 150 },
      { name: 'payNum', width: 150 },
      { name: 'documentSystemMeaning', width: 150 },
      { name: 'documentTypeMeaning', width: 150 },
      { name: 'documentNum', width: 200 },
      { name: 'documentLineNum', width: 150 },
      { name: 'itemCode', width: 150 },
      { name: 'itemName', width: 150 },
      { name: 'payAmount', width: 150 },
      { name: 'remark', width: 150 },
      { name: 'srmPoNum', width: 150 },
      { name: 'srmPoLineNum', width: 150 },
      { name: 'pcNum', width: 150 },
      { name: 'pcSubjectLineNum', width: 150 },
      { name: 'purchaseAgentName', width: 150 },
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

export default PaymentTable;
