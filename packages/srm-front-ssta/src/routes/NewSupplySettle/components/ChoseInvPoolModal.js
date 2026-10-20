/*
 * @Description: 采购方结算单-选择发票池
 * @Date: 2022-02-05 00:11:06
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useCallback, useContext, useEffect } from 'react';
import { useDataSet, useModal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { useModalOpen } from '../hooks';
import { Store } from '../Detail/StoreProvider';
import InvoicePoolDetailModal from './InvoicePoolDetailModal';
import { choseInvoicePoolDS } from '@/stores/NewSupplySettleDS';

export default observer((props) => {
  const { modal, onSuccess } = props;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const { settleHeaderDs, settleHeaderId, customizeTable, taxInvoiceDs, remoteProps } = useContext(
    Store
  );
  const { settleNum, companyId, supplierId, supplierCompanyId } =
    settleHeaderDs.current?.get(['settleNum', 'companyId', 'supplierId', 'supplierCompanyId']) ||
    {};

  const supplierCompanyIdParams = useMemo(() => {
    return remoteProps
      ? remoteProps.process(
          'SSTA_SUPPLYSETTLE_DETAIL_CHOSINVPOOL_SUPPLIERCOMPANYID',
          {},
          { settleHeaderDs }
        )
      : {};
  }, [settleHeaderDs, remoteProps]);

  const tableDs = useDataSet(
    () =>
      choseInvoicePoolDS({
        settleHeaderId,
        settleNum,
        belongCompanyId: companyId,
        belongSupplierId: supplierId,
        belongSupplierCompanyId: supplierCompanyId,
        ...supplierCompanyIdParams,
      }),
    [settleHeaderId, settleNum, companyId, supplierId, supplierCompanyId, supplierCompanyIdParams]
  );
  const { selected } = tableDs;
  useEffect(() => {
    modal.update({
      okProps: { disabled: isEmpty(selected) },
      footer: (okBtn, cancelBtn) => {
        return remoteProps
          ? remoteProps.process(
              'SSTA_SUPPLYSETTLE_DETAIL_CHOSINVPOOL_FOOTER_BTNS',
              [okBtn, cancelBtn],
              {
                settleHeaderDs,
                okBtn,
                cancelBtn,
                tableDs,
                taxInvoiceDs,
                modal,
              }
            )
          : [okBtn, cancelBtn];
      },
    });
  }, [modal, selected, settleHeaderDs, remoteProps, tableDs, taxInvoiceDs]);
  useEffect(() => {
    modal.handleOk(async () => {
      const res = await tableDs.submit();
      if (!res) return false;
      onSuccess(res.content[0]);
    });
  }, [modal, tableDs, onSuccess]);

  const handleViewInvoiceDetail = useCallback(
    (invoiceHeaderId) => {
      modalOpen({
        size: 'large',
        editFlag: false,
        bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
        title: intl.get('ssta.supplySettle.view.message.invoicepoolDeatail').d('发票详情'),
        children: <InvoicePoolDetailModal invoiceHeaderId={invoiceHeaderId} />,
      });
    },
    [modalOpen]
  );

  const columns = useMemo(
    () => [
      {
        name: 'invoiceTypeMeaning',
        width: 180,
      },
      {
        name: 'invoiceCode',
        width: 200,
      },
      {
        name: 'invoiceNum',
        width: 200,
      },
      {
        name: 'invoicingDate',
        width: 120,
      },
      {
        name: 'netAmount',
        width: 150,
      },
      {
        name: 'taxAmount',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        width: 250,
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => {
          const invoiceHeaderId = record.get('invoiceHeaderId');
          if (invoiceHeaderId) {
            return (
              <a onClick={() => handleViewInvoiceDetail(invoiceHeaderId)}>
                {intl.get('ssta.invoiceSheet.view.button.detailview').d('查看详情')}
              </a>
            );
          }
        },
      },
    ],
    [handleViewInvoiceDetail]
  );

  return customizeTable(
    {
      code: 'SSTA.SUPPLY_SETTLE_DETAIL.INV_TAX_POOL_GRID',
    },
    <SearchBarTable
      dataSet={tableDs}
      columns={columns}
      searchCode="SSTA.SUPPLY_SETTLE_DETAIL.INV_TAX_POOL"
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      searchBarConfig={{
        expandable: false,
        closeFilterSelector: true,
      }}
    />
  );
});
