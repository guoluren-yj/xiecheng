import React, { Fragment, useMemo, useCallback } from 'react';
import { Table, Form, Output, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import LogisticModal from './LogisticModal';

export default function InvoiceInfoModal(props) {
  const { ecInvoiceFormDs, ecInvoiceLineDs, history, detailDS } = props;
  const columns = useMemo(
    () => [
      {
        width: 120,
        name: 'invoiceLineNum',
        renderer: ({ dataSet, record }) => {
          const preInx = dataSet.pageSize * (dataSet.currentPage - 1);
          return preInx + (record.index + 1);
        },
      },
      {
        width: 180,
        name: 'invoiceCode',
      },
      {
        width: 180,
        name: 'invoiceNumber',
      },
      {
        width: 180,
        name: 'invoicingDate',
      },
      {
        width: 120,
        name: 'taxAmount',
      },
      {
        width: 120,
        name: 'netAmount',
      },
      {
        width: 120,
        name: 'taxIncludedAmount',
      },
      {
        width: 120,
        name: 'invoiceSpeciesMeaning',
      },
      {
        name: 'invoiceUrl',
        renderer: ({ value }) => (value ? <a onClick={() => history.push(value)}>{value}</a> : '-'),
      },
    ],
    []
  );

  const openLogisticsModal = useCallback(() => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      closable: true,
      style: { width: 742 },
      title: intl.get(`ssta.purchaseSettlePool.view.title.invoiceLogisticsView`).d('查看物流信息'),
      children: <LogisticModal detailDS={detailDS} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [detailDS]);
  return (
    <Fragment>
      <Form columns={4} dataSet={ecInvoiceFormDs} labelAlign="left" labelWidth={65}>
        <Output name="companyName" />
        <Output name="supplierCompanyName" />
        <Output name="settleHeaderNum" />
        <Output
          renderer={() => (
            <a onClick={openLogisticsModal}>
              {intl
                .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.viewInvoiceLogistics`)
                .d('发票物流查看')}
            </a>
          )}
        />
      </Form>
      <Table columns={columns} dataSet={ecInvoiceLineDs} />
    </Fragment>
  );
}
