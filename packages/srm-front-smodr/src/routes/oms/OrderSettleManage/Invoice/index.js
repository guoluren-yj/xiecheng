import React, { useMemo, useEffect, useContext, useRef } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';

import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import Store from '@/routes/components/ModalProvider/Store';
import TextFieldPro from '@/routes/components/TextFieldPro';

import { invoiceDs } from '../tableDs';
// import openRecords from './TimeRecord';
import LogisticsModal from './LogisticsModal/index';
import { renderColorValidity } from '../renderTag';

function Invoice(props) {
  const tableDS = useMemo(() => new DataSet(invoiceDs()), []);
  const context = useContext(Store);
  const { openModal, setModalValue } = context;
  useEffect(() => {
    props.onRef(tableDS);
  }, []);

  const queryRef = useRef(undefined);

  // function handleOpenRecord(record) {
  //   openRecords(record.get('id'));
  // }
  function handleToLogis(record) {
    const consignmentCode = record.get('consignmentCode');
    const modal = openModal({
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
      title: intl.get('smodr.settle.model.checkLogistics').d('查看物流'),
      footer: () => (
        <Button onClick={() => modal.close()} color="primary">
          {intl.get('smodr.settle.model.guanbi').d('关闭')}
        </Button>
      ),
      onClose: () => {
        setModalValue('');
      },
      children: <LogisticsModal consignmentCode={consignmentCode} />,
    });
  }
  const columns = [
    {
      name: 'validityStatusMeaning',
      renderer: ({ record, text }) => (
        <Tag style={renderColorValidity(record.get('validityStatus'))}>{text}</Tag>
      ),
    },
    {
      name: 'operation',
      width: 200,
      renderer: ({ record }) => (
        <span className="action-link">
          <Button
            onClick={() => window.open(record.get('fileUrl'))}
            funcType="link"
            color="primary"
          >
            {intl.get('smodr.settle.model.download').d('下载')}
          </Button>
          {/* <a funcType="link" color="primary" onClick={() => handleOpenRecord(record)}>
            {intl.get('smodr.settle.model.operationRecord').d('操作记录')}
          </a> */}
          <Button funcType="link" color="primary" onClick={() => handleToLogis(record)}>
            {intl.get('smodr.settle.model.checkLogistics').d('查看物流')}
          </Button>
        </span>
      ),
    },
    {
      name: 'invoiceBatch',
      renderer: ({ text, record }) => (
        <a
          onClick={() =>
            props.history.push(
              `/s2-mall/oms/order-settle-manage/invoice-detail?invoiceId=${record.get('invoiceId')}`
            )
          }
        >
          {text}
        </a>
      ),
    },
    { name: 'invoiceCode' },
    { name: 'applicationNo' },
    { name: 'invoiceTitle' },
    { name: 'invoiceTime' },
    { name: 'invoiceOrderNetAmountMeaning' },
    { name: 'invoiceTaxAmountMeaning' },
    { name: 'invoiceAmountMeaning' },
    { name: 'invoiceTypeMeaning' },
    { name: 'invoiceContentCode', hidden: true },
    { name: 'invoiceFormatMeaning', hidden: true },
    { name: 'invoiceStateMeaning', hidden: true },
    { name: 'purchaseCompanyName' },
    { name: 'supplierCompanyName' },
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
          customizedCode="SMODR.SETTLE.MANAGE.INVOICE.SELECT"
          searchCode="SMODR.ORDER.SETTLEMENT.INVOICE"
          searchBarConfig={{
            left: {
              render: () => (
                <TextFieldPro
                  ds={tableDS}
                  placeholder={intl.get('smodr.settle.model.invoiceMerge').d('发票号码、发票代码')}
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

export default withRouter(Invoice);
