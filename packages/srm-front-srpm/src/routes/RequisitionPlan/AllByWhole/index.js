/* eslint-disable no-unused-expressions */
import React, { Fragment, memo } from 'react';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Icon, Tooltip } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import { Button as PermissionButton } from 'components/Permission';
import {
  getCurrentOrganizationId,
  // getCurrentTenant,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { copy } from '@/services/RequisitionPlanServices';
import { colorRender, revokeWorkFlow } from '../util';

const organizationId = getCurrentOrganizationId();

const Index = ({ customizeTable, lineDs, dispatch, handleJumpDetail, queryCount, location }) => {
  const [init, setInit] = React.useState(false);
  const handleCopy = (record) => {
    return new Promise((resolve) => {
      const dataSelectd = record.toData();
      copy(dataSelectd)
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            // handleJumpDetail({ rpHeaderId: res.rpHeaderId, isCopy: 1 });
            dispatch(
              routerRedux.push({
                pathname: `/srpm/requisition-plan/edit/${res.rpHeaderId}`,
              })
            );
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const toEditPage = (record) => {
    const rpHeaderId = record.get('rpHeaderId');

    const type = record.get('rpSourcePlatform') === 'EXTERNAL_SYSTEM' ? 'erp-edit' : 'edit';

    dispatch(
      routerRedux.push({
        pathname: `/srpm/requisition-plan/${type}/${rpHeaderId}`,
      })
    );
  };

  const renderAction = ({ record }) => {
    const { rpSourcePlatform, rpStatus, workflowBusinessKey, approvalMethod } =
      record.get(['rpSourcePlatform', 'rpStatus', 'approvalMethod', 'workflowBusinessKey']) || {};
    const approvaFlags = lineDs.getState('approvaFlags');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};

    const operationFlags = lineDs.getState('operationFlags') || {};
    const { REVOKE } = operationFlags?.[workflowBusinessKey] || {};
    const actions = {
      copy: (
        <PermissionButton
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => handleCopy(record)}
          permissionList={[
            {
              code: `hzero.srm.requirement.requisition.plan.rp-platform.button.copy`,
              type: 'button',
            },
          ]}
        >
          {intl.get('hzero.common.button.copy').d('复制')}
        </PermissionButton>
      ),

      edit: (
        <Button
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => {
            toEditPage(record);
          }}
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
      ),
      approveWorkFlow: (
        <PermissionButton
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => handleWorkFlowApprove({ record })}
          permissionList={[
            {
              code: `hzero.srm.requirement.requisition.plan.rp-platform.button.approve`,
              type: 'button',
            },
          ]}
        >
          {intl.get('hzero.common.button.approval').d('审批')}
        </PermissionButton>
      ),
      revokeWorkFlowBtn: (
        <PermissionButton
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => handleRevoke({ record })}
          permissionList={[
            {
              code: `hzero.srm.requirement.requisition.plan.rp-platform.button.revokeApproval`,
              type: 'button',
            },
          ]}
        >
          {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
        </PermissionButton>
      ),
    };

    const wholeOpt = {
      status: ['approved'],
      overlay: [],
    };

    if (rpSourcePlatform === 'REQUEST_PLAN') {
      wholeOpt.overlay.push('copy');
    }

    if (['NEW', 'REJECTED'].includes(rpStatus)) {
      wholeOpt.overlay.push('edit');
    }

    if (workflowBusinessKey && approvalMethod === 'WORKFLOW' && taskId && processInstanceId) {
      wholeOpt.overlay.push('approveWorkFlow');
    }
    if (workflowBusinessKey && approvalMethod === 'WORKFLOW' && REVOKE) {
      wholeOpt.overlay.push('revokeWorkFlowBtn');
    }

    const moreAction = wholeOpt.overlay.map((ele, index) => {
      if (index + 1 === wholeOpt.overlay?.length && ele) {
        return <span>{actions[ele]}</span>;
      } else {
        return <span style={{ marginRight: '16px' }}>{actions[ele]}</span>;
      }
    });

    return moreAction;
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
    );
  };

  const handleRevoke = async ({ record }) => {
    const res = await revokeWorkFlow(record.get('workflowBusinessKey'));
    if (res) {
      lineDs.query();
    }
  };

  const handleWorkFlowApprove = async ({ record }) => {
    const approvaFlags = lineDs.getState('approvaFlags') || {};
    const workflowBusinessKey = record.get('workflowBusinessKey') || '';
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        lineDs.query();
      },
    });
  };

  const lineColumns = [
    {
      name: 'rpStatus',
      width: 120,
      renderer: ({ value, record }) => colorRender(value, record.get('rpStatusMeaning')),
    },
    {
      name: 'cancelStatusCode',
      width: 100,
      renderer: ({ value, text }) => colorRender(value, text),
    },
    {
      name: 'operator',
      width: 120,
      renderer: ({ record }) => renderAction({ record }),
    },
    {
      name: 'workFlowApproveProcess',
      width: 150,
      renderer: viewDetail,
      tooltip: 'none',
    },
    {
      name: 'displayRpNum',
      width: 150,
      renderer: ({ value, record }) => (
        <div className="row-agent-column">
          <a onClick={() => handleJumpDetail(record)} style={{ paddingRight: '8px' }}>
            {value}
          </a>

          {record.get('urgentFlag') === 1 ? (
            <Tooltip title={intl.get(`srpm.common.model.common.urgent`).d('需求计划加急')}>
              <Icon
                type="priority"
                style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
              />
            </Tooltip>
          ) : null}
        </div>
      ),
    },
    // {
    //   name: 'templateCode',
    //   width: 150,
    //   tooltip: 'overflow',
    // },
    // {
    //   name: 'templateName',
    //   width: 150,
    //   tooltip: 'overflow',
    // },
    // {
    //   name: 'templateType',
    //   width: 150,
    //   tooltip: 'overflow',
    // },
    {
      name: 'companyName',
      width: 250,
      tooltip: 'overflow',
    },
    {
      name: 'ouName',
      width: 250,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseOrgName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'originalCurrency',
      width: 100,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseAgentName',
      width: 180,
      tooltip: 'overflow',
    },
    {
      name: 'createdByName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },
  ];

  const handleQuery = ({ params = {} }) => {
    const { state: { _back } = {} } = location;
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.set({
      ...params,
      ...clearParams,
    });
    lineDs?.setQueryParameter('advancedData', params);
    if (_back === -1 && !init) {
      lineDs?.query(lineDs.currentPage);
    } else {
      lineDs?.query();
    }
    setInit(true);
    queryCount();
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.reset();
  };
  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 253px)' }}>
        {customizeTable(
          {
            code: 'SRPM.RP_PLATFORM.ALL.LIST',
          },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode="SRPM.RP_PLATFORM.ALL_SEARCHBAR"
            dataSet={lineDs}
            columns={lineColumns}
            data={[]}
            cacheState
            searchBarConfig={{
              fieldProps: {
                companyId: { lovPara: { tenantId: organizationId } },
                ouId: { lovPara: { tenantId: organizationId } },
              },
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderNums"
                    callbackFuc={queryCount}
                    dataSet={lineDs}
                    placeholder={intl
                      .get('srpm.common.modal.enterPrNumSearch')
                      .d('请输入需求计划单号查询')}
                  />
                ),
              },
              onQuery: handleQuery,
              onClear: resetQueryDs,
              onReset: resetQueryDs,
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default memo(
  withCustomize({
    unitCode: ['SRPM.RP_PLATFORM.ALL.LIST'],
  })(Index)
);
