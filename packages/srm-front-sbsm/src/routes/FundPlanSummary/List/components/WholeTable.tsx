import React, { useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Button, Modal } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import type { Operate } from '../../utils/type';
import { actionFlagger } from '../../utils/utils';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { formatColumnCommand } from '../../../../components/Renderer';
import { ActiveKey, ListGridCode, ListFilterCode } from '../../utils/type';

interface WholeTableProps {
  activeKey: ActiveKey,
};

const linkActionMap: Record<string, Operate> = {
  [ActiveKey.WholeAll]: 'all',
  [ActiveKey.WholePending]: 'edit',
  [ActiveKey.WholeApprove]: 'all',
};

const WholeTable = (props: WholeTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleToDetail, fetchTabKeysCount, permissionMap } = useContext(Store);
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  const fetchTotalCount = useCallback(() => {
    fetchTabKeysCount([activeKey]);
  }, [activeKey, fetchTabKeysCount]);

  const handleApprove = useCallback((record) => {
    tableDs.getState('workflowCaller').goApprove({
      record,
      onSuccess: () => {
        tableDs.query();
        fetchTotalCount();
      },
    });
  }, [tableDs, fetchTotalCount]);

  const handleRevokeApproval = useCallback(async (record) => {
    Modal.confirm({
      title: intl.get('sbsm.common.view.message.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
      onOk: async () => {
        const res = await tableDs.getState('workflowCaller').goRevoke(record);
        if (!res) return;
        tableDs.query();
        fetchTotalCount();
      },
    });
  }, [tableDs, fetchTotalCount]);

  const operationCommand = useCallback(({ record, dataSet }) => {
    const { balHeaderId } = record?.get(['balHeaderId']) || {};
    const [editBtn, approveBtn, revokeApprovalBtn, cancelBtn] = actionFlagger({
      record,
      action: ['edit', 'approve', 'revokeApproval', 'cancel'],
      workflowCaller: dataSet.getState('workflowCaller'),
      permissionMap,
    });
    const btns = [
      {
        name: 'update',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleToDetail(balHeaderId, 'edit'),
        showFlag: ActiveKey.WholeAll === activeKey && editBtn,
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
        name: 'cancel',
        text: intl.get('hzero.common.button.cancel').d('取消'),
        onClick: () => handleToDetail(balHeaderId, 'cancel'),
        showFlag: ActiveKey.WholeAll === activeKey && cancelBtn,
      },
    ];
    return formatColumnCommand({ buttons: btns });
  }, [
    activeKey,
    handleApprove,
    handleToDetail,
    handleRevokeApproval,
    permissionMap,
  ]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'balStatus', width: 150, renderer: statusTagRender },
      ([ActiveKey.WholeAll, ActiveKey.WholeApprove].includes(activeKey) && {
        name: 'operation',
        width: 160,
        align: 'left',
        command: operationCommand,
      }) as ColumnProps,
      {
        name: 'balNum',
        width: 160,
        renderer: ({ value, record }) => {
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleToDetail(record?.get('balHeaderId'), linkActionMap[activeKey])}
            >
              {value}
            </Button>
          );
        },
      },
      { name: 'companyName', width: 160 },
      { name: 'balPayAmount', width: 120 },
      { name: 'balApplyAmount', width: 120 },
      { name: 'prepViewTypeMeaning', width: 120 },
      { name: 'createdByName', width: 120 },
      { name: 'creationDate', width: 150 },
      (activeKey === ActiveKey.WholeApprove && {
        name: 'miniApproveProcess',
        header: intl.get('hzero.common.button.approve.process').d('审批进度'),
        width: 200,
        renderer: ({ dataSet, record }) => {
          const balStatus = record?.get('balStatus');
          return ['SUBMIT_APPROVING', 'CANCEL_APPROVING'].includes(balStatus)
            ? dataSet?.getState('workflowCaller')?.renderProcess(record)
            : null;
        },
      }) as ColumnProps,
    ];
  }, [activeKey, handleToDetail, operationCommand]);

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        { code: ListGridCode[activeKey] },
        <SearchBarTable
          virtual
          virtualCell
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={ListFilterCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="balNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterBalNumsQuery')
                    .d('请输入资金计划汇总单号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(WholeTable);
