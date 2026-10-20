import React, { useContext, useMemo, memo } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { ActiveKey, GridCustCodeMap, SearchCustCodeMap } from '../../utils/type';

interface ListTableProps {
  activeKey: ActiveKey,
};

const ListTable = memo((props: ListTableProps) => {
  const { activeKey } = props;

  const { dsMap, customizeTable, handleToDetail } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      (activeKey !== ActiveKey.Error && {
        name: 'payStatus',
        width: 120,
        renderer: statusTagRender,
      }) as ColumnProps,
      {
        name: activeKey === ActiveKey.Error ? 'payErrorNum' : 'payNum',
        width: 200,
        renderer: ({ value, record }) => (
          <a onClick={() => handleToDetail(record?.key, activeKey === ActiveKey.Error)}>
            {value}
          </a>
        ),
      },
      { name: 'documentAndLineNum', width: 200 },
      { name: 'companyName', width: 250 },
      { name: 'displaySupplierName', width: 250 },
      { name: 'currencyCode', width: 100 },
      { name: 'itemCode', width: 120 },
      { name: 'itemName', width: 120 },
      (activeKey !== ActiveKey.Error && { name: 'payAmount', width: 120 }) as ColumnProps,
      ...(activeKey === ActiveKey.Pending ? [
        { name: 'payOccupyAmount', width: 150 },
        { name: 'enablePayAmount', width: 150 },
      ] : []),
      ...(activeKey !== ActiveKey.Error ? [
        { name: 'paidAmount', width: 180 },
        { name: 'payingAmount', width: 200 },
      ] : []),
      { name: 'payTypeName', width: 150 },
      { name: 'exPaymentDate', width: 150 },
      ...(activeKey === ActiveKey.Error ? [
        { name: 'errorTypeMeaning', width: 150 },
        { name: 'errorMsg', width: 200 },
      ] : []),
    ];
  }, [
    activeKey,
    handleToDetail,
  ]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCodeMap[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={currentListDs}
          columns={columns}
          searchCode={SearchCustCodeMap[activeKey]}
          style={{ maxHeight: 'calc(100% - 20px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name={activeKey === ActiveKey.Error ? 'payErrorNums' : "payNums"}
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.paymentPool.view.placeholder.enterPayTransactionNumToQuery')
                    .d('请输入支付事务编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
});

export default ListTable;
