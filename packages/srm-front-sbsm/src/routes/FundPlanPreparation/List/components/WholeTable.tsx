import React, { useContext, useMemo, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { statusTagRender } from '../../../../components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { WholeListCode, WholeSearchCode, ActiveKey } from '../../utils/type';
import { confirmDocNegAction } from '../../../../utils/utils';
import { formatColumnCommand } from '../../../../components/Renderer';
import { actionFlagger } from '../../utils/utils';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { deletePrep } from '../../utils/api';

interface WholeTableProps {
  activeKey: ActiveKey,
};

const WholeTable = (props: WholeTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleToDetail, getTotalCount, permissionMap } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  const handleApprove = useCallback((record) => {
    tableDs.getState('workflowCaller').goApprove({
      record,
      onSuccess: () => {
        notification.success({});
        tableDs.query();
        getTotalCount(activeKey);
      },
    });
  }, [tableDs, activeKey, getTotalCount]);

  const handleRevoke = useCallback(async(record) => {
    const confirmRes = await Modal.confirm({
      title: intl.get('sbsm.common.view.title.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
    });
    if (confirmRes !== 'ok') return false;
    const res = await tableDs.getState('workflowCaller').goRevoke(record);
    if (res) {
      notification.success({});
      tableDs.query();
      getTotalCount(activeKey);
    }
  }, [tableDs, activeKey, getTotalCount]);

  // 编辑取消(删除)
    const handleDelete = useCallback(async(record) => {
      const { prepNum } = record?.get(['prepNum']) || {};
      const confirmFlag = await confirmDocNegAction({ action: 'cancel', documentName: '', documentNum: prepNum });
      if (!confirmFlag) return;
      const res = getResponse(await deletePrep(record?.toData()));
      if (!res) return false;
      notification.success({});
      tableDs.query();
      getTotalCount(activeKey);
    }, [tableDs, activeKey, getTotalCount]);

  const operationCommand = useCallback(({ record, dataSet }) => {
    const { prepHeaderId, prepReportStatus } = record?.get(['prepHeaderId', 'prepReportStatus']) || {};
    const [editBtn, approveBtn, cancelBtn, revokeBtn] = actionFlagger({
      record,
      action: ['edit', 'approve', 'cancel', 'revoke'],
      workflowCaller: dataSet.getState('workflowCaller'),
      permissionMap,
    });
    const btns = [
      {
        name: 'update',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleToDetail(prepHeaderId, 'edit'),
        showFlag: ActiveKey.WholeAll === activeKey && editBtn,
        wait: 1000,
      },
      {
        name: 'approve',
        text: intl.get('sbsm.common.button.approve').d('审核'),
        onClick: () => handleApprove(record),
        showFlag: approveBtn,
      },
      {
        name: 'withdraw',
        text: intl.get('hzero.common.button.recall').d('撤回'),
        onClick: () => handleRevoke(record),
        showFlag: revokeBtn,
      },
      {
        name: 'cancel',
        text: intl.get('hzero.common.button.cancel').d('取消'),
        onClick: () => handleToDetail(prepHeaderId, 'cancel'),
        showFlag: ActiveKey.WholeAll === activeKey && cancelBtn,
      },
      {
        name: 'delete',
        text: intl.get('hzero.common.button.cancel').d('取消'),
        onClick: () => handleDelete(record),
        showFlag: ActiveKey.WholeAll === activeKey && ['ASYNC_CREATING'].includes(prepReportStatus),
      },
    ];
    return formatColumnCommand({ buttons: btns });
  }, [handleToDetail, handleApprove, activeKey, handleRevoke, permissionMap, handleDelete]);


  const columns: any = useMemo(() => {
    return [
      {
        name: 'prepReportStatus',
        width: 120,
        renderer: statusTagRender,
      },
      [ActiveKey.WholeAll, ActiveKey.WholeApprove].includes(activeKey) && {
        name: 'operate',
        width: 160,
        align: 'left',
        command: operationCommand,
      },
      {
        name: 'prepNum',
        width: 160,
        renderer: ({ value, record }) => {
          const type = activeKey === ActiveKey.WholePending ? 'edit' : (activeKey === ActiveKey.WholeApprove ? 'check' : 'view');
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleToDetail(record?.get('prepHeaderId'), type)}
            >
              {value}
            </Button>
          );
        },
      },
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'prepPayAmount',
        width: 120,
      },
      {
        name: 'prepApplyAmount',
        width: 140,
      },
      {
        name: 'prepViewType',
        width: 140,
      },
      [ActiveKey.WholeAll].includes(activeKey) && {
        name: 'prepReturnStatus',
        width: 140,
        renderer: statusTagRender,
      },
      {
        name: 'createdUserName',
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'currentApprover',
        renderer: ({ dataSet, record }) => {
          const prepReportStatus = record.get('prepReportStatus');
          return ['SUBMIT_APPROVING', 'CANCEL_APPROVING'].includes(prepReportStatus)
            ? dataSet.getState('workflowCaller')?.renderProcess(record)
            : null;
        },
      },
    ];
  }, [handleToDetail, operationCommand, activeKey]);

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        { code: WholeListCode[activeKey] },
        <SearchBarTable
          cacheState
          virtual
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={WholeSearchCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="prepNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterPrepNumQuery')
                    .d('请输入资金计划编制单号查询')}
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
