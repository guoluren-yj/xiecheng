import React, { useContext, useMemo, memo, useCallback } from 'react';
import { Modal, Button, useModal } from 'choerodon-ui/pro';
import { ColumnAlign } from 'choerodon-ui/dataset/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import type { Operate } from '../../utils/type';
import { useModalOpen } from '../../../../hooks';
import { actionFlagger } from '../../utils/utils';
import commonStyles from '../../../../common.less';
import { fetchPayDocDetail } from '../../utils/api';
import PaymentWorkbenchCreate from '../../Detail/Create';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { formatColumnCommand } from '../../../../components/ColumnBtnGroup';
import { ActiveKey, GridCustCodeMap, FilterCustCodeMap } from '../../utils/type';
import OperationRecord from '../../Detail/components/OperationRecord';

interface ListTableProps {
  activeKey: ActiveKey,
};

const linkActionMap: Record<string, Operate> = {
  [ActiveKey.WholeAll]: 'all',
  [ActiveKey.WholeEdit]: 'edit',
  [ActiveKey.WholeApprove]: 'all',
  [ActiveKey.WholeConfirm]: 'confirm',
  [ActiveKey.WholeReverse]: 'reverse',
};

const ListTable = memo((props: ListTableProps) => {
  const { activeKey } = props;
  const {
    dsMap,
    permissionMap,
    handleToDetail,
    customizeTable,
    fetchTabKeysCount,
  } = useContext(Store);
  const modalOpen = useModalOpen(useModal());
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  const fetchTotalCount = useCallback(() => {
    fetchTabKeysCount([activeKey]);
  }, [activeKey, fetchTabKeysCount]);

  const handleEdit = useCallback(async (payHeaderId) => {
    const res = getResponse(await fetchPayDocDetail(payHeaderId));
    if (!res) return;
    const { step } = res;
    if (!step || step === 'END') {
      handleToDetail(payHeaderId, 'edit');
    } else {
      Modal.open({
        drawer: true,
        closable: true,
        title: intl.get('hzero.common.button.create').d('新建'),
        className: commonStyles['sbsm-large-modal'],
        bodyStyle: { padding: '0 0 0 20px' },
        children: <PaymentWorkbenchCreate payHeaderId={payHeaderId} okCallback={() => currentListDs.query()} />,
        footer: null,
      });
    }
  }, [currentListDs, handleToDetail]);

  const handleApprove = useCallback((record) => {
    currentListDs.getState('workflowCaller').goApprove({
      record,
      onSuccess: () => {
        currentListDs.query(undefined, undefined, false);
        fetchTotalCount();
      },
    });
  }, [currentListDs, fetchTotalCount]);

  const handleRevokeApproval = useCallback(async (record) => {
    Modal.confirm({
      title: intl.get('sbsm.common.view.message.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
      onOk: async () => {
        const res = await currentListDs.getState('workflowCaller').goRevoke(record);
        if (!res) return;
        currentListDs.query(undefined, undefined, false);
        fetchTotalCount();
      },
    });
  }, [currentListDs, fetchTotalCount]);

  const handleOpenOperationRecord = useCallback((record) => {
    const payHeaderId = record.get('payHeaderId');
    modalOpen({
      size: 'medium',
      eidtFlag: false,
      title: intl.get('hzero.common.button.operationRecord').d('操作记录'),
      children: <OperationRecord payHeaderId={payHeaderId} />,
    });
  }, [modalOpen]);

  const getOperationCommand = useCallback(({ record, dataSet }) => {
    const { payHeaderId } = record?.get(['payHeaderId']) || {};
    const [
      editBtn,
      approveBtn,
      revokeApprovalBtn,
      confirmBtn,
      reverseBtn,
    ] = actionFlagger({
      record,
      action: ['edit', 'approve', 'revokeApproval', 'confirm', 'reverse'],
      permissionMap,
      workflowCaller: dataSet.getState('workflowCaller'),
    });
    const btns = [
      {
        name: 'update',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(payHeaderId),
        showFlag: activeKey === ActiveKey.WholeAll && editBtn,
        wait: 1000,
      },
      {
        name: 'approve',
        text: intl.get('sbsm.common.button.approve').d('审核'),
        onClick: () => handleApprove(record),
        showFlag: [ActiveKey.WholeAll, ActiveKey.WholeApprove].includes(activeKey) && approveBtn,
      },
      {
        name: 'revokeApproval',
        text: intl.get('sbsm.common.button.revokeApproval').d('撤销审批'),
        onClick: () => handleRevokeApproval(record),
        showFlag: [ActiveKey.WholeAll, ActiveKey.WholeApprove].includes(activeKey) && revokeApprovalBtn,
      },
      {
        name: 'payConfirm',
        text: intl.get('sbsm.common.button.paymentConfirm').d('支付确认'),
        onClick: () => handleToDetail(payHeaderId, 'confirm'),
        showFlag: activeKey === ActiveKey.WholeAll && confirmBtn,
      },
      {
        name: 'reverse',
        text: intl.get('hzero.common.button.reverse').d('冲销'),
        onClick: () => handleToDetail(payHeaderId, 'reverse'),
        showFlag: activeKey === ActiveKey.WholeAll && reverseBtn,
      },
      {
        name: 'operationRecord',
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        onClick: () => handleOpenOperationRecord(record),
        showFlag: permissionMap.get('operationRecord'),
      },
    ];
    return formatColumnCommand({ buttons: btns });
  }, [
    activeKey,
    handleEdit,
    permissionMap,
    handleApprove,
    handleToDetail,
    handleRevokeApproval,
    handleOpenOperationRecord,
  ]);

  const columns = useMemo(() => {
    return [
      { name: 'payStatus', width: 150, renderer: statusTagRender },
      [ActiveKey.WholeAll, ActiveKey.WholeApprove].includes(activeKey) && {
        name: 'operation',
        width: 160,
        align: ColumnAlign.left,
        command: getOperationCommand,
        title: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'payNum',
        width: 200,
        renderer: ({ value, record }) => {
          const payHeaderId = record?.get('payHeaderId');
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => activeKey === ActiveKey.WholeEdit ? handleEdit(payHeaderId) : handleToDetail(payHeaderId, linkActionMap[activeKey])}
            >
              {value}
            </Button>
          );
        },
      },
      { name: 'companyNum', width: 180 },
      { name: 'companyName', width: 250 },
      { name: 'ouName', width: 180 },
      { name: 'displaySupplierNum', width: 180 },
      { name: 'displaySupplierName', width: 250 },
      { name: 'supplierSiteName', width: 100 },
      { name: 'currencyCode', width: 100 },
      { name: 'payTypeName', width: 150 },
      { name: 'payFormMeaning', width: 150 },
      { name: 'payAmount', width: 120 },
      { name: 'remark', width: 150 },
      { name: 'creationDate', width: 200 },
      { name: 'createdByName', width: 150 },
      (activeKey !== ActiveKey.WholeEdit && { name: 'approveBatchNum', width: 150 }) as any,
      activeKey === ActiveKey.WholeApprove && {
        name: 'miniApproveProcess',
        header: intl.get('hzero.common.button.approve.process').d('审批进度'),
        width: 200,
        renderer: ({ dataSet, record }) => {
          const payStatus = record?.get('payStatus');
          return ['SUBMITTED', 'REVERSING'].includes(payStatus)
            ? dataSet?.getState('workflowCaller')?.renderProcess(record)
            : null;
        },
      },
    ];
  }, [
    activeKey,
    handleEdit,
    handleToDetail,
    getOperationCommand,
  ]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCodeMap[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={currentListDs}
          columns={columns}
          searchCode={FilterCustCodeMap[activeKey]}
          style={{ maxHeight: 'calc(100% - 20px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="payNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.paymentWorkbench.view.placeholder.enterPayDocNumToQuery')
                    .d('请输入支付单编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
});

export default ListTable;
