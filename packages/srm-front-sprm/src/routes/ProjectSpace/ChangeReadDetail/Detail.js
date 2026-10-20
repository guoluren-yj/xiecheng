import React, { useContext, Fragment } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Header } from 'components/Page';
import { openApproveModal } from '_components/ApproveModal';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import BaseInfo from '../ReadDetail/BaseInfo.js';
import TaskTable from '../ReadDetail/TaskInfo.js';
import PurList from '../ReadDetail/PurList.js';
import ReqBase from './ReqBase';
import SupplierInfo from '../ReadDetail/SupplierInfo.js';
import Operation from '../commonDetail/OperationHistory/index.js';
import { Store } from '../commonDetail/sotreProvider';
import { revokeWorkFlow } from '@/routes/utils';
import './../EditDetail/index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.project.model.common';

const Detail = () => {
  const {
    projectReqHeaderId,
    customizeBtnGroup,
    customizeTabPane,
    pubPathFlag,
    detailReqDs,
    history,
  } = useContext(Store);
  const { current } = detailReqDs;

  const handleRevoke = async () => {
    const res = await revokeWorkFlow(current?.get('workflowBusinessKey'));
    if (res && history) {
      history.push({
        pathname: `/sprm/project-workspace/list`,
      });
    }
  };

  const handleWorkFlowApprove = async () => {
    const approvaFlags = detailReqDs?.getState('approvaFlags');
    const workflowBusinessKey = current?.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        history.push({
          pathname: `/sprm/project-workspace/list`,
        });
      },
    });
  };

  const handleOperate = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: <Operation id={projectReqHeaderId} type="projectReqId" field='projectReqHeaderId' />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };
  const HeaderBtn = observer(() => {
    const operationFlags = detailReqDs?.getState('operationFlags') || {};
    const approvaFlags = detailReqDs?.getState('approvaFlags') || {};
    const workflowBusinessKey = current?.get('workflowBusinessKey');
    const pubBts = [
      {
        name: 'operation',
        btnComp: Button,
        btnProps: {
          icon: 'assignment',
          type: 'c7n-pro',
          hidden: !projectReqHeaderId,
          wait: 300,
          funcType: 'flat',
          onClick: handleOperate,
        },
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ];
    const headerBtns = [
      ...pubBts,
      {
        name: 'approveWorkFlow',
        btnComp: Button,
        btnProps: {
          icon: 'authorize',
          type: 'c7n-pro',
          hidden:
            !projectReqHeaderId ||
            !current?.get('workflowBusinessKey') ||
            !approvaFlags[workflowBusinessKey]?.taskId,
          wait: 300,
          funcType: 'flat',
          onClick: handleWorkFlowApprove,
        },
        child: intl.get('hzero.common.button.approval').d('审批'),
      },
      {
        name: 'revokeWorkflow',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          hidden:
            !projectReqHeaderId ||
            !current?.get('workflowBusinessKey') ||
            !operationFlags[workflowBusinessKey]?.REVOKE,
          wait: 300,
          funcType: 'flat',
          onClick: handleRevoke,
        },
        child: intl.get(`hzero.common.button.revokeApproval`).d('撤销审批'),
      },
    ];
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SIEC.PROJECT_CHANGE.BTN',
            pro: true,
          },
          <DynamicButtons buttons={!pubPathFlag ? pubBts : headerBtns} />
        )}
      </>
    );
  });

  return (
    <Fragment>
      <Header
        title={intl.get('sprm.project.model.viewProjectReq').d('查看项目控制申请单')}
        backPath={!pubPathFlag ? null : '/sprm/project-workspace/list'}
      >
        <HeaderBtn />
      </Header>
      <div className="sprm-project-detail">
        {customizeTabPane(
          {
            code: 'SIEC.PROJECT_CHANGE.TABS',
          },
          <Tabs tabPosition="left" className="tab-padding">
            <TabPane
              tab={intl.get('sprm.purchaseRequest.title.reqBaseInfo').d('申请单基本信息')}
              key="reqBase"
            >
              <ReqBase />
            </TabPane>
            <TabPane
              tab={intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
              key="baseInfo"
              forceRender
            >
              <BaseInfo
                baseCode="SIEC.PROJECT_CHANGE.BASEINFO"
                attachCode="SIEC.PROJECT_CHANGE.ATTACH"
              />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrompt}.taskCost`).d('任务成本')} key="taskCost">
              <TaskTable
                taskCode="SIEC.PROJECT_CHANGE.TASK"
                purListKey={{
                  tabCode: 'SIEC.PROJECT_CHANGE.PUR_LIST',
                  searchCode: 'SIEC.PROJECT_CHANGE.PUR_FILTER',
                }}
                searchCode="SIEC.PROJECT_CHANGE.TASK_FILTER"
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.purPartsList`).d('采购件清单')}
              key="purPartsList"
            >
              <PurList
                tabCode="SIEC.PROJECT_CHANGE.PUR_LIST"
                searchCode="SIEC.PROJECT_CHANGE.PUR_FILTER"
              />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrompt}.supplier`).d('供应商')} key="supplier">
              <SupplierInfo code="SIEC.PROJECT_CHANGE.SUPPLIER" />
            </TabPane>
          </Tabs>
        )}
      </div>
    </Fragment>
  );
};

export default observer(Detail);
