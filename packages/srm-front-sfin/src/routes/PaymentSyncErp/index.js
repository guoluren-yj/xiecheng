import React, { useCallback } from 'react';
import { DataSet, Table, Modal, ModalContainer, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import { observer } from 'mobx-react-lite';
// import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { throttle, compose } from 'lodash';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { paymentSyncErp } from '@/services/paymentSyncErpServices';
import { thousandBitSeparator } from '@/routes/utils';
import { tableDS as tableDs } from '../../stores/PaymentSyncErpDS';
import ActionHistory from './../PaymentApprove/Compontent/ActionHistory';

const PaymentSyncErp = (props) => {
  const tableDS = React.useMemo(() => new DataSet(tableDs()), []);
  const { customizeTable } = props;

  const [visible, setVisible] = React.useState(false);

  const [data, setData] = React.useState({});

  /**
   * 头columns
   */
  const columns = React.useMemo(() => {
    return [
      {
        width: 120,
        name: 'erpImportCodeMeaning',
      },
      {
        width: 120,
        name: 'errorMessage',
        renderer: ({ record }) => {
          const errorMessage = record.get('erpImportMessage');
          return errorMessage ? (
            <a onClick={() => handleError(errorMessage)}>
              {intl.get('sfin.paymentSyncErp.view.message.title.errorMessage').d('错误信息')}
            </a>
          ) : null;
        },
      },
      {
        width: 150,
        name: 'paymentNum',
      },
      {
        width: 120,
        name: 'paymentTypeCodeMeaning',
      },
      {
        width: 120,
        name: 'erpPaymentNum',
      },
      {
        width: 120,
        name: 'companyName',
      },
      {
        name: 'ouName',
        width: 200,
      },
      {
        width: 120,
        name: 'supplierCompanyNum',
      },
      {
        width: 200,
        name: 'supplierCompanyName',
      },
      {
        name: 'invoiceTitle',
        width: 100,
      },
      {
        width: 80,
        name: 'paymentAmount',
        renderer: ({ text, record }) => {
          const { amountPrecision } = record.toData();

          return thousandBitSeparator(text, amountPrecision);
        },
      },
      {
        width: 80,
        name: 'currencyCode',
      },
      {
        width: 120,
        name: 'paymentDate',
      },
      {
        width: 120,
        name: 'amountPaid',
        renderer: ({ text, record }) => {
          const { amountPrecision } = record.toData();
          return thousandBitSeparator(text, amountPrecision);
        },
      },
      {
        width: 120,
        name: 'unpaidAmount',
        renderer: ({ text, record }) => {
          const { amountPrecision } = record.toData();
          return thousandBitSeparator(text, amountPrecision);
        },
      },
      {
        width: 100,
        name: 'createdByName',
      },
      {
        width: 180,
        name: 'creationDate',
      },
      {
        name: 'remark',
        width: 80,
      },
      {
        header: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        lock: 'right',
        name: 'taxInvoiceLineId',
        renderer: ({ record }) => (
          <a color="#29BECE" onClick={() => handleInvoiceDetail(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
  }, []);

  const handleError = (errorMessage) => {
    Modal.open({
      drawer: false,
      key: 'errorMessage',
      destroyOnClose: true,
      closable: true,
      title: intl.get('sfin.paymentSyncErp.view.message.title.errorMessage').d('错误信息'),
      children: <div>{errorMessage}</div>,
      footer: null,
    });
  };

  const actionHistory = {
    data, // 传入的数据,打开操作记录的行
    visible,
    hideModal: () => hideModal(),
  };

  // const handleSync = () => {
  //   //
  // };

  const hideModal = (type, flag) => {
    setVisible(flag);
  };

  const handleInvoiceDetail = (record) => {
    setVisible(true);
    setData(record.toData());
  };

  const handleSync = useCallback(
    throttle(async () => {
      const list = tableDS.selected.map((item) => item.toData());
      const res = await paymentSyncErp(list);
      if (res) {
        notification.success();
        tableDS.query();
      }
    }, 1000),
    [tableDS, paymentSyncErp]
  );

  const Btns = observer(({ ds }) => {
    const isDisabled = ds.selected.length === 0;
    return (
      <>
        <Button icon="sync" color="primary" disabled={isDisabled} onClick={handleSync}>
          {intl.get('sfin.paymentSyncErp.common.sync').d('同步')}
        </Button>
      </>
    );
  });

  return (
    <>
      <Header title={intl.get(`sfin.paymentSyncErp.common.paymentSyncErp`).d('同步付款申请')}>
        <Btns ds={tableDS} />
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SFIN.PAYMENT_SYNC_ERP.LIST',
            filterCode: 'SFIN.PAYMENT_SYNC_ERP.FILTER_FORM',
          },
          <Table columns={columns} dataSet={tableDS} queryFieldsLimit={3} />
        )}

        {visible && <ActionHistory {...actionHistory} />}
        <ModalContainer location={location} />
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['sfin.paymentSyncErp', 'hzero.common', 'sfin.common', 'entity.supplier'],
  }),
  withCustomize({
    unitCode: ['SFIN.PAYMENT_SYNC_ERP.FILTER_FORM', 'SFIN.PAYMENT_SYNC_ERP.LIST'],
  })
)(PaymentSyncErp);
