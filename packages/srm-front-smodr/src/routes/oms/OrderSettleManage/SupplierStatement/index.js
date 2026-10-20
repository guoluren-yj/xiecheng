import React, { useMemo, useEffect, useRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';

import TextFieldPro from '@/routes/components/TextFieldPro';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';

import { stateDs } from '../tableDs';
// import openRecords from './TimeRecord';
import { renderColorStatement } from '../renderTag';

function SupplierStatement(props) {
  const tableDS = useMemo(() => new DataSet(stateDs()), []);

  // function handleOpenRecord(record) {
  //   openRecords(record.get('id'));
  // }
  const queryRef = useRef(undefined);

  useEffect(() => {
    props.onRef(tableDS);
  }, []);

  const columns = [
    {
      name: 'statementsStatusMeaning',
      renderer: ({ record, text }) => (
        <Tag style={renderColorStatement(record.get('statementsStatus'))}>{text}</Tag>
      ),
    },
    // {
    //   name: 'operation',
    //   width: 80,
    //   renderer: ({ record }) => (
    //     <span className="action-link">
    //       <Button funcType="link" color="primary" onClick={() => handleOpenRecord(record)}>
    //         {intl.get('smodr.settle.model.operationRecord').d('操作记录')}
    //       </Button>
    //     </span>
    //   ),
    // },
    {
      name: 'statementsCode',
      width: 160,
      renderer: ({ text, record }) => (
        <a
          onClick={() =>
            props.history.push(
              `/s2-mall/oms/order-settle-manage/statement-detail?statementsId=${record.get(
                'statementsId'
              )}`
            )
          }
        >
          {text}
        </a>
      ),
    },
    { name: 'ecStatementsCode', width: 160 },
    { name: 'srmStatementsCode', width: 160 },
    { name: 'sourceFromMeaning' },
    { name: 'statementsTypeMeaning' },
    { name: 'statementsNetAmountMeaning' },
    { name: 'statementsTaxAmountMeaning' },
    { name: 'statementsAmountMeaning' },
    // { name: '1', hidden: true },
    { name: 'purchaseCompanyName' },
    { name: 'supplierCompanyName' },
    { name: 'statementsTime' },
  ];
  const { customizeTable } = props;

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: 'SMODR.ORDER.SETTLEMENT.STATEMENT.TABLE' },
        <SearchBarTable
          style={{ maxHeight: `calc(100% - 22px)` }}
          columns={columns}
          dataSet={tableDS}
          customizedCode="SMODR.SETTLE.MANAGE.SUPPLIER.STATEMENT.SELECT"
          searchCode="SMODR.ORDER.SETTLEMENT.DATA.POOL"
          searchBarConfig={{
            left: {
              render: () => (
                <TextFieldPro
                  ds={tableDS}
                  placeholder={intl.get('smodr.settle.model.mallStatementCode').d('商城对账单编码')}
                  name="mergeQuery"
                  onRef={(ref) => {
                    queryRef.current = ref;
                  }}
                />
              ),
            },
            onReset: () => {
              if (queryRef.current) {
                queryRef.current.handleClear();
              }
            },
            onClear: () => {
              if (queryRef.current) {
                queryRef.current.handleClear();
              }
            },
          }}
        />
      )}
    </div>
  );
}

export default withRouter(SupplierStatement);
