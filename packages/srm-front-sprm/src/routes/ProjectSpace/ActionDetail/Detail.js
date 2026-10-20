import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Modal } from 'choerodon-ui/pro';

import { Header } from 'components/Page';
import intl from 'utils/intl';

import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';

import { openApproveModal } from '_components/ApproveModal';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'utils/notification';
import {
  submitAction,
  deleteProPurInfo,
  invalidProPurInfo,
} from '@/services/projectSpaceService.js';
import BaseInfo from './../ReadDetail/BaseInfo.js';
import TaskTable from './../ReadDetail/TaskInfo.js';
import PurList from './../ReadDetail/PurList.js';
import SupplierInfo from './../ReadDetail/SupplierInfo.js';
import SubmitForm from './submitForm';
import ReqBase from './ReqBase';
import { revokeWorkFlow } from '@/routes/utils';
import { Store } from '../commonDetail/sotreProvider';
import Operation from '../commonDetail/OperationHistory';
import './../ReadDetail/index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.project.model.common';

const Detail = () => {
  const {
    customizeBtnGroup,
    customizeTabPane,
    headerDs,
    detailReqDs,
    source,
    pubPathFlag,
    history,
  } = useContext(Store);
  const { current } = headerDs;
  const [updateLoading, setLoading] = useState(false);

  const titleKey = () => {
    const reqType = detailReqDs.current?.get('reqType');
    const titleName = {
      SUSPEND: intl.get('sprm.project.title.suspendReq').d('项目控制申请单-中止'),
      REBOOT: intl.get('sprm.project.title.rebootReq').d('项目控制申请单-重启'),
      CONFIRM: intl.get('sprm.project.title.confirmReq').d('项目控制申请单-确认完成'),
    };
    return source === 'actionDetail'
      ? titleName[reqType]
      : intl.get('sprm.project.model.viewProjectReq').d('查看项目控制申请单');
  };

  const handleRevoke = async () => {
    const res = await revokeWorkFlow(detailReqDs?.current?.get('workflowBusinessKey'));
    if (res && history) {
      history.push({
        pathname: `/sprm/project-workspace/list`,
      });
    }
  };

  const handleWorkFlowApprove = async () => {
    const approvaFlags = detailReqDs?.getState('approvaFlags');
    const workflowBusinessKey = detailReqDs?.current?.get('workflowBusinessKey');
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
      children: (
        <Operation id={detailReqDs.current?.get('projectReqHeaderId')} type="projectReqId" field='projectReqHeaderId' />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleDelete = () => {
    setLoading(true);
    Modal.confirm({
      bodyStyle: { padding: '20px' },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <p>
          {intl.get('sprm.common.view.message.deleteProjectChange').d('是否确认删除项目控制单?')}
        </p>
      ),
      onOk: async () => {
        const data = detailReqDs?.current?.toJSONData();
        const res = getResponse(await deleteProPurInfo(data));
        if (res) {
          notification.success();
          setLoading(false);
          history.push({
            pathname: `/sprm/project-workspace/list`,
          });
        } else {
          setLoading(false);
        }
      },
      onCancel: () => {
        setLoading(false);
      },
    });
  };

  const handleInvalid = () => {
    setLoading(true);
    return new Promise(async (reslove) => {
      const data = detailReqDs?.current?.toJSONData();
      const res = getResponse(await invalidProPurInfo(data));
      if (res) {
        notification.success();
        setLoading(false);
        history.push({
          pathname: `/sprm/project-workspace/list`,
        });
      } else {
        setLoading(false);
        reslove();
      }
    });
  };

  const handleSubmit = () => {
    const modaltitle = titleKey();
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      title: modaltitle,
      children: <SubmitForm dataSet={detailReqDs} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: async () => {
        const validateFlag = await detailReqDs.validate();
        if (validateFlag) {
          const [data] = detailReqDs.toJSONData();
          const res = getResponse(await submitAction({ ...data }));
          if (res) {
            notification.success();
            history.push({
              pathname: `/sprm/project-workspace/list`,
            });
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn} {cancelBtn}
        </div>
      ),
    });
  };
  const HeaderBtn = observer(() => {
    const operationFlags = detailReqDs?.getState('operationFlags') || {};
    const approvaFlags = detailReqDs?.getState('approvaFlags') || {};
    const workflowBusinessKey = detailReqDs?.current?.get('workflowBusinessKey');
    const pubBts = [
      {
        name: 'operation',
        btnComp: Button,
        btnProps: {
          icon: 'assignment',
          type: 'c7n-pro',
          hidden: !detailReqDs?.current?.get('projectReqHeaderId'),
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
        name: 'submit',
        btnComp: Button,
        btnProps: {
          icon: 'done',
          wait: 300,
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          hidden:
            !current?.get('projectReqHeaderId') ||
            !current?.get('changingFlag') ||
            source === 'detailQuery' ||
            !pubPathFlag,
          onClick: handleSubmit,
          permissionList: [
            {
              code:
                current?.get('reqType') === 'REBOOT'
                  ? `srm.bg.management.project.button.restart`
                  : 'srm.bg.management.project.button.suspend',
              type: 'button',
            },
          ],
        },
        child: intl.get(`hzero.common.button.submit`).d('提交'),
      },
      {
        name: 'delete',
        btnComp: Button,
        btnProps: {
          icon: 'delete',
          wait: 300,
          type: 'c7n-pro',
          funcType: 'flat',
          hidden:
            !current?.get('projectReqHeaderId') ||
            current?.get('reqStatus') === 'APPROVAL_REJECTED' ||
            !current?.get('changingFlag') ||
            source === 'detailQuery' ||
            !pubPathFlag,
          loading: updateLoading,
          onClick: handleDelete,
          permissionList: [
            {
              code:
                current?.get('reqType') === 'REBOOT'
                  ? `srm.bg.management.project.button.restart`
                  : 'srm.bg.management.project.button.suspend',
              type: 'button',
            },
          ],
        },
        child: intl.get(`hzero.common.button.delete`).d('删除'),
      },
      {
        name: 'invalid',
        btnComp: Button,
        btnProps: {
          icon: 'delete',
          wait: 300,
          type: 'c7n-pro',
          funcType: 'flat',
          hidden:
            current?.get('reqStatus') !== 'APPROVAL_REJECTED' ||
            !current?.get('changingFlag') ||
            source === 'detailQuery' ||
            !pubPathFlag,
          loading: updateLoading,
          onClick: handleInvalid,
          permissionList: [
            {
              code:
                current?.get('reqType') === 'REBOOT'
                  ? `srm.bg.management.project.button.restart`
                  : 'srm.bg.management.project.button.suspend',
              type: 'button',
            },
          ],
        },
        child: intl.get(`hzero.common.button.invalid`).d('作废'),
      },
      {
        name: 'approveWorkFlow',
        btnComp: Button,
        btnProps: {
          icon: 'authorize',
          type: 'c7n-pro',
          hidden:
            !detailReqDs.current?.get('projectReqHeaderId') ||
            !workflowBusinessKey ||
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
            !detailReqDs.current?.get('projectReqHeaderId') ||
            !workflowBusinessKey ||
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
      <Header title={titleKey()} backPath={pubPathFlag ? '/sprm/project-workspace/list' : null}>
        <HeaderBtn />
      </Header>

      <div className="sprm-project-detail">
        {customizeTabPane(
          {
            code: 'SIEC.PROJECT_OTHER_TYPE.TABS',
          },
          <Tabs tabPosition="left" className="tab-padding">
            <TabPane
              tab={intl.get('sprm.purchaseRequest.title.reqBaseInfo').d('申请单基本信息')}
              key="reqBase"
              hidden={source === 'actionDetail' && pubPathFlag}
            >
              <ReqBase />
            </TabPane>
            <TabPane
              tab={intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
              key="baseInfo"
            >
              <BaseInfo
                baseCode="SIEC.PROJECT_OTHER_TYPE.BASE"
                attachCode="SIEC.PROJECT_OTHER_TYPE.ATTACHMENT"
              />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrompt}.taskCost`).d('任务成本')} key="taskCost">
              <TaskTable
                taskCode="SIEC.PROJECT_OTHER_TYPE.COST_LIST"
                searchCode="SIEC.PROJECT_OTHER_TYPE.TASK_FILTER"
                purListKey={{
                  tabCode: 'SIEC.PROJECT_OTHER_TYPE.PUR_LIST',
                  searchCode: 'SIEC.PROJECT_OTHER_TYPE.PURLIST_FILTER',
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.purPartsList`).d('采购件清单')}
              key="purPartsList"
            >
              <PurList
                tabCode="SIEC.PROJECT_OTHER_TYPE.PUR_LIST"
                searchCode="SIEC.PROJECT_OTHER_TYPE.PURLIST_FILTER"
              />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrompt}.supplier`).d('供应商')} key="supplier">
              <SupplierInfo code="SIEC.PROJECT_OTHER_TYPE.SUPPLIER" />
            </TabPane>
          </Tabs>
        )}
      </div>
    </Fragment>
  );
};

export default observer(Detail);
