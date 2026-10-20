import React, { useMemo, useState, useCallback } from 'react';

import { DataSet, TextField, Icon } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import { remainDetailDs } from './listDs';

export default function RemainDetailModal(props) {
    const { recordData } = props || {};
  const [value, setValue] = useState(null);
  const tableDS = useMemo(()=>new DataSet(remainDetailDs(recordData)), []);
    const handleChange = useCallback((val)=>{
        tableDS.setQueryParameter('orderId', val);
        tableDS.query();
    }, [tableDS]);
    const handleClear = useCallback(()=>{
        setValue(null);
        tableDS.setQueryParameter('orderId', null);
    }, [tableDS]);
    const columns = [
    {
        name: 'pin',
      },
      {
        name: 'orderId',
      },
      {
        name: 'tradeTypeName',
      },
      {
        name: 'tradeNo',
      },
      {
        name: 'amount',
        style: {textAlign: 'right' },
        headerStyle: {textAlign: 'right' },
      },
      {
        name: 'createdDate',
      },
      {
        name: 'notePub',
      }];
  return (
    <>
      <SearchBarTable
        searchCode="SMAL.EC_CLIENT.REMAIN_DETAIL"
        dataSet={tableDS}
        columns={columns}
        customizedCode="SMALL.EC_CLIENT.REMAIN_DETAIL.MODAL"
        style={{ maxHeight: 'calc(100% - 4px)' }}
        searchBarConfig={{
             expandable: false,
            left: {
              render: () => (
                <TextField
                  value={value}
                  valueChangeAction="blur"
                  style={{ width: '300px' }}
                  prefix={<Icon type="search" />}
                  placeholder={intl.get('small.ecClient.view.message.searchOrderId').d('请输入电商父/子订单号查询')}
                  onChange={handleChange}
                  clearButton
                />
              ),
            },
            onReset: () => {
                handleClear();
            },
            onClear: () => {
                handleClear();
            },
          }}
      />
    </>
  );
}