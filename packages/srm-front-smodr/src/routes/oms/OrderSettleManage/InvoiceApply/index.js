import React, { useMemo, useEffect, useRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { Tag } from 'choerodon-ui';

import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import TextFieldPro from '@/routes/components/TextFieldPro';

import { applyDs } from '../tableDs';
// import openRecords from './TimeRecord';
import { renderColorRequest } from '../renderTag';

function InvoiceApply(props) {
  const tableDS = useMemo(() => new DataSet(applyDs()), []);

  // function handleOpenRecord(record) {
  //   openRecords(record.get('id'));
  // }
  const queryRef = useRef(undefined);

  useEffect(() => {
    props.onRef(tableDS);
  }, []);

  const columns = [
    {
      name: 'requestStatusMeaning',
      renderer: ({ record, text }) => (
        <Tag style={renderColorRequest(record.get('requestStatus'))}>{text}</Tag>
      ),
    },
    // {
    //   name: 'operation',
    //   width: 80,
    //   renderer: ({ record }) => (
    //     <span className="action-link">
    //       <Button funcType='link' color='primary'>
    //         {intl.get('smodr.settle.model.invoiceDownload').d('发票下载')}
    //       </Button>
    //       <Button funcType="link" color="primary" onClick={() => handleOpenRecord(record)}>
    //         {intl.get('smodr.settle.model.operationRecord').d('操作记录')}
    //       </Button>
    //     </span>
    //   ),
    // },
    {
      name: 'applicationNo',
      width: 180,
      renderer: ({ text, record }) => (
        <a
          onClick={() =>
            props.history.push(
              `/s2-mall/oms/order-settle-manage/apply-detail?requestId=${record.get('requestId')}`
            )
          }
        >
          {text}
        </a>
      ),
    },
    { name: 'srmApplicationNo', width: 160 },
    { name: 'sourceFromMeaning' },
    { name: 'invoiceTypeMeaning' },
    { name: 'invoiceStateMeaning' },
    { name: 'requestAmountMeaning' },
    { name: 'creationByName' },
    { name: 'purchaseCompanyName' },
    { name: 'supplierCompanyName' },
    { name: 'creationDate' },
  ];
  const { customizeTable } = props;

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: 'SMODR.ORDER.SETTLEMENT.INVOICE.REQUEST.TABLE' },
        <SearchBarTable
          style={{ maxHeight: `calc(100% - 22px)` }}
          columns={columns}
          dataSet={tableDS}
          customizedCode="SMODR.SETTLE.MANAGE.INVOICE.APPLY.SELECT"
          searchCode="SMODR.ORDER.SETTLEMENT.INVOICE.REQUEST"
          searchBarConfig={{
            left: {
              render: () => (
                <TextFieldPro
                  ds={tableDS}
                  placeholder={intl.get('smodr.settle.model.applyMerge').d('开票申请编码')}
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

export default withRouter(InvoiceApply);
