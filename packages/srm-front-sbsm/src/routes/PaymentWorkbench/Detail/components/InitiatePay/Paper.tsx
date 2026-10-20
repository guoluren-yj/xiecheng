import React, { useCallback, useEffect, useMemo, Fragment, useContext } from 'react';
import { Table, DataSet, Select, Button, useModal } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import intl from 'utils/intl';

import BatchEdit from './BatchEdit';
import { Store } from '../../stores';
import MatchLineInfo from '../MatchLineInfo';
import { useModalOpen } from '../../../../../hooks';
import { paperListDS } from '../../stores/initiatePayDS';
import { InitiatePayCodeMap } from '../../../utils/type';


interface InitatePaperProps {
  modal?: any;
  okCallback: Function;
}

const InitatePaper = (props: InitatePaperProps) => {
  const modalOpen = useModalOpen(useModal());
  const { headerDs, customizeTable } = useContext(Store);
  const { modal, okCallback } = props;
  const offlineListDs = useMemo(() => new DataSet(paperListDS(headerDs)), [headerDs]);

  const handleViewDetail = useCallback((record) => {
    const statementLineId = record.get('statementLineId');
    modalOpen({
      size: 'large',
      title: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.statementAssociatedPaymentLine').d('流水行关联支付行'),
      children: <MatchLineInfo statementLineId={statementLineId} />,
    });
  }, [modalOpen]);

  const payStatusOptionsFilter = useCallback((record) => ['PAY_SUCCESS', 'PAY_CANCEL'].includes(record.get('value')), []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'payStatus', width: 150, editor: <Select optionsFilter={payStatusOptionsFilter} /> },
      { name: 'lineNum', width: 150 },
      { name: 'companyName', width: 200 },
      { name: 'displaySupplierName', width: 200 },
      { name: 'currencyCode', width: 120 },
      { name: 'payTypeName', width: 150 },
      { name: 'payFormMeaning', width: 150 },
      { name: 'paperAmount', width: 150 },
      {
        name: 'paymentLineDetail',
        width: 150,
        title: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.statementAssociatedPaymentLine').d('流水行关联支付行'),
        renderer: ({ record }) => (
          <a onClick={() => handleViewDetail(record)}>
            {intl.get('sbsm.common.view.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
  }, [handleViewDetail, payStatusOptionsFilter]);

  const handleOk = useCallback(async () => {
    const res = await offlineListDs.submit();
    if (!res) return false;
    if(okCallback) okCallback();
  }, [offlineListDs, okCallback]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
      modal.update({ okText: intl.get('sbsm.paymentWorkbench.view.button.confirmInitiatePay').d('确认发起支付') });
    }
  }, [modal, handleOk]);

  const handleBatchEdit = useCallback(() => {
    modalOpen({
      size: 'small',
      editFlag: true,
      title: intl.get('sbsm.common.view.button.batchEdit').d('批量编辑'),
      children: <BatchEdit topListDs={offlineListDs} custCodeName='PaperBatch' />,
    });
  }, [modalOpen, offlineListDs]);

  const buttons = useMemo(() => [
    <Button icon="mode_edit" onClick={handleBatchEdit}>
      {intl.get('sbsm.common.view.button.batchEdit').d('批量编辑')}
    </Button>,
  ], [handleBatchEdit]);

  return (
    <Fragment>
      {customizeTable({
        code: InitiatePayCodeMap.PaperGrid,
      }, (
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={offlineListDs}
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        />
      ))}
    </Fragment>
  );
};

export default InitatePaper;