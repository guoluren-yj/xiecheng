import React, { useMemo, useEffect, useContext, useRef } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';

import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import Store from '@/routes/components/ModalProvider/Store';
import TextFieldPro from '@/routes/components/TextFieldPro';

import { initDs } from '../tableDs';
import ExecuteModal from './ExecuteModal';
// import openRecords from './TimeRecord';
import { renderColorInvoice, renderColorStatement } from '../renderTag';

function SettleData(props) {
  const context = useContext(Store);
  const { openModal, setModalValue } = context;
  const tableDS = useMemo(() => new DataSet(initDs()), []);
  const queryRef = useRef(undefined);

  useEffect(() => {
    props.onRef(tableDS);
  }, []);

  useEffect(() => {
    tableDS.query();
  }, []);

  function handleOpenExecute(record) {
    const recordData = record.toData();
    const modal = openModal({
      key: '1',
      distroyOnClose: true,
      drawer: true,
      closable: true,
      closeOnLocationChange: false,
      resizable: true,
      customizable: true,
      mask: false,
      style: {
        minWidth: '50vw',
      },
      customizedCode: 'SETTLE_DATA_EXECUTE_MODAL',
      title: intl.get('smodr.settle.model.execute').d('执行情况'),
      footer: () => (
        <Button onClick={() => modal?.close()} color="primary">
          {intl.get('smodr.settle.model.guanbi').d('关闭')}
        </Button>
      ),
      onClose: () => {
        setModalValue('');
      },
      children: <ExecuteModal recordData={recordData} />,
    });
  }

  // function handleOpenRecord(record) {
  //   openRecords(record.get('id'));
  // }

  const columns = [
    {
      name: 'settlementCodeLine',
      width: 200,
      renderer: ({ text, record }) => (
        <a
          onClick={() =>
            props.history.push(
              `/s2-mall/oms/order-settle-manage/settle-detail?settlementId=${record.get(
                'settlementId'
              )}`
            )
          }
        >
          {text}
        </a>
      ),
    },
    {
      name: 'operation',
      width: 200,
      renderer: ({ record }) => (
        <span className="action-link">
          <Button funcType="link" color="primary" onClick={() => handleOpenExecute(record)}>
            {intl.get('smodr.settle.model.execute').d('执行情况')}
          </Button>
          {/* <Button funcType='link' color='primary'>
            {intl.get('smodr.settle.model.invoiceDownload').d('发票下载')}
          </Button> */}
          {/* <Button funcType="link" color="primary" onClick={() => handleOpenRecord(record)}>
            {intl.get('smodr.settle.model.operationRecord').d('操作记录')}
          </Button> */}
        </span>
      ),
    },
    { name: 'sourceFromMeaning' },
    { name: 'sourceDocumentCode' },
    { name: 'sourceDocumentTypeMeaning' },
    { name: 'orderCode' },
    { name: 'ecConsignmentCode' },
    { name: 'skuCode', hidden: true },
    { name: 'skuName', hidden: true },
    { name: 'quantityMeaning', hidden: true },
    { name: 'uomName', hidden: true },
    { name: 'taxRate', hidden: true },
    { name: 'currencyName', hidden: true },
    { name: 'unitPriceMeaning', hidden: true },
    { name: 'entryAmountMeaning', hidden: true },
    {
      name: 'statementsStatusMeaning',
      renderer: ({ record, text }) => (
        <Tag style={renderColorStatement(record.get('statementsStatus'))}>{text}</Tag>
      ),
    },
    {
      name: 'invoiceStatusMeaning',
      renderer: ({ record, text }) => (
        <Tag style={renderColorInvoice(record.get('invoiceStatus'))}>{text}</Tag>
      ),
    },
    { name: 'purchaseCompanyName' },
    { name: 'supplierCompanyName' },
    { name: 'settlementTime' },
  ];
  const { customizeTable } = props;
  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: 'SMODR.ORDER.SETTLEMENT.POOL.TABLE' },
        <SearchBarTable
          style={{ maxHeight: `calc(100% -22px)` }}
          customizedCode="SMODR.SETTLE.MANAGE.SETTLE.DATA.SELECT"
          columns={columns}
          dataSet={tableDS}
          searchCode="SMODR.ORDER.SETTLEMENT.DATA.POOL_V"
          searchBarConfig={{
            left: {
              render: () => (
                <TextFieldPro
                  ds={tableDS}
                  placeholder={intl
                    .get('smodr.settle.model.settleMerge')
                    .d('事务编码｜行号、商城订单编码、商品编码')}
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

export default withRouter(SettleData);
