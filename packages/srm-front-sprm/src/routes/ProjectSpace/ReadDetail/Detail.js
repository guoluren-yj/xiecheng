import React, { useContext, Fragment } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Modal } from 'choerodon-ui/pro';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';

import BaseInfo from './BaseInfo.js';
import TaskTable from './TaskInfo.js';
import PurList from './PurList.js';
import SupplierInfo from './SupplierInfo.js';
import LinkExcuteList from './LinkExcuteList.js';
import { revokeWorkFlow } from '@/routes/utils';
import Operation from './../commonDetail/OperationHistory';
import { Store } from '../commonDetail/sotreProvider';
import './index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.project.model.common';

const Detail = () => {
  const {
    projectId,
    customizeBtnGroup,
    customizeTabPane,
    pubPathFlag,
    headerDs,
    history,
  } = useContext(Store);
  const { current } = headerDs;
  // const [updateLoading, setLoading] = useState(false);

  const handleOperate = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: <Operation id={projectId} type="projectId" field="projectId" />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  const handleRevoke = async () => {
    const res = await revokeWorkFlow(current?.get('workflowBusinessKey'));
    if (res && history) {
      history.push({
        pathname: `/sprm/project-workspace/list`,
      });
    }
  };

  const handleWorkFlowApprove = async () => {
    const approvaFlags = headerDs?.getState('approvaFlags');
    const workflowBusinessKey = current?.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    console.log(workflowBusinessKey, approvaFlags);
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

  const HeaderBtn = observer(() => {
    const operationFlags = headerDs?.getState('operationFlags') || {};
    const approvaFlags = headerDs?.getState('approvaFlags') || {};
    const workflowBusinessKey = current?.get('workflowBusinessKey');
    const pubBts = [
      {
        name: 'operation',
        btnComp: Button,
        btnProps: {
          icon: 'assignment',
          type: 'c7n-pro',
          hidden: !projectId,
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
            !projectId ||
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
            !projectId ||
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
            code: 'SIEC.PROJECT_READ.BTN',
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
        title={intl.get('sprm.project.model.viewProject').d('查看项目')}
        backPath={pubPathFlag ? '/sprm/project-workspace/list' : null}
      >
        <HeaderBtn />
      </Header>

      <div className="sprm-project-detail">
        {customizeTabPane(
          {
            code: 'SIEC.PROJECT_READ.TABS',
          },
          <Tabs tabPosition="left" className="tab-padding">
            <TabPane
              tab={intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
              key="baseInfo"
              forceRender
            >
              <BaseInfo />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrompt}.taskCost`).d('任务成本')} key="taskCost">
              <TaskTable />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.purPartsList`).d('采购件清单')}
              key="purPartsList"
            >
              <PurList />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.linkExcuteList`).d('项目关联执行单据')}
              key="linkExcuteList"
              hidden={!pubPathFlag}
            >
              <LinkExcuteList />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrompt}.supplier`).d('供应商')} key="supplier">
              <SupplierInfo />
            </TabPane>
          </Tabs>
        )}
      </div>
    </Fragment>
  );
};

export default observer(Detail);
