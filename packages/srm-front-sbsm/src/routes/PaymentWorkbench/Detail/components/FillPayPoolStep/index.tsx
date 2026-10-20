import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Table, Button, useModal } from 'choerodon-ui/pro';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { DataToJSON, FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';

import BatchEdit from './BatchEdit';
import { Store } from '../../stores';
import { useModalOpen } from '../../../../../hooks';
import { FillPayPoolGridCode } from '../../../utils/type';
import { statusTagRender } from '../../../../../components/StatusTag';
import { viewPaymentPoolDetail } from '../../../../PaymentPool/Detail';

export const getFillPoolAddFields = () => [
  {
    name: 'payTypeLov',
    label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.financeConfirmPayType').d('财务确认付款方式'),
    type: FieldType.object,
    lovCode: 'SMDM.PAYMENT_TYPE',
    ignore: FieldIgnore.always,
    required: true,
  },
  {
    name: 'payTypeId',
    bind: 'payTypeLov.typeId',
  },
  {
    name: 'payTypeName',
    bind: 'payTypeLov.typeName',
  },
  {
    name: 'payForm',
    label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.financeConfirmPayForm').d('财务确认付款形式'),
    lookupCode: 'SBSM.PAY_FORM',
    required: true,
  },
];

const onRecordUpdate = ({ name, value, record }) => {
  if (name === 'payTypeLov') record.set('payForm', value?.paymentForm);
};

const FillPayPoolStep = ((props) => {

  const { fillPoolDs } = props;
  const { remote, history, cuxProps, customizeTable } = useContext(Store);

  const modalOpen = useModalOpen(useModal());

  useEffect(() => {
    fillPoolDs.paging = false;
    fillPoolDs.dataToJSON = DataToJSON.all;
    fillPoolDs.addEventListener('update', onRecordUpdate);
    return () => {
      fillPoolDs.removeEventListener('update', onRecordUpdate);
    };
  }, [fillPoolDs]);

  const handleBatchEdit = useCallback(() => {
    modalOpen({
      size: 'small',
      editFlag: true,
      title: intl.get('sbsm.paymentWorkbench.view.button.batchEditPayType').d('批量修改付款方式'),
      children: <BatchEdit fillPoolDs={fillPoolDs} />,
    });
  }, [modalOpen, fillPoolDs]);

  const buttons = useMemo(() => [
    <Button icon="mode_edit" onClick={handleBatchEdit}>
      {intl.get('sbsm.paymentWorkbench.view.button.batchEditPayType').d('批量修改付款方式')}
    </Button>,
  ], [handleBatchEdit]);

  const columns: ColumnProps[] = useMemo(() => {
    const normalColumns = [
      {
        name: 'payNum',
        width: 200,
        renderer: ({ value, record }) => (
          <a onClick={() => viewPaymentPoolDetail({ history, payId: record?.get('payId') })}>
            {value}
          </a>
        ),
      },
      { name: 'documentAndLineNum', width: 200 },
      { name: 'companyName', width: 250 },
      { name: 'displaySupplierName', width: 250 },
      { name: 'currencyCode', width: 100 },
      { name: 'itemCode', width: 120 },
      { name: 'payAmount', width: 120 },
      { name: 'payStatus', width: 120, renderer: statusTagRender },
      { name: 'payOccupyAmount', width: 150 },
      { name: 'enablePayAmount', width: 150 },
      { name: 'paidAmount', width: 180 },
      { name: 'payingAmount', width: 200 },
      { name: 'exPaymentDate', width: 150 },
      { name: 'payTypeLov', width: 150, editor: true, lock: ColumnLock.right },
      { name: 'payForm', width: 150, editor: true, lock: ColumnLock.right },
    ];
    return remote
      ? remote.process('SBSM.PAYMENT_WORKBENCH_DETAIL_CUX.STEP_FILL_PAY_POOL_COLUMNS', normalColumns, {
        cuxProps,
      })
      : normalColumns;
  }, [
    remote,
    history,
    cuxProps,
  ]);

  return customizeTable(
    { code: FillPayPoolGridCode },
    <Table
      customizable
      columns={columns}
      dataSet={fillPoolDs}
      buttons={buttons}
      style={{ maxHeight: 'calc(100vh - 260px)' }}
    />
  );
});

export default FillPayPoolStep;
