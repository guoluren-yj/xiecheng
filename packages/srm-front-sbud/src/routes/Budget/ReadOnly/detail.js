import React, { useContext } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { openApproveModal } from '_components/ApproveModal';
import { Content, Header } from 'components/Page';
import { Spin, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import {
  // submit,
  // editingSubmit,
  wholeVoid,
} from '@/services/budgetService';
import BaseInfo from './baseInfo';
import LineInfo from './lineInfo';
import OperationRecord from '../components/OperationHistory';
import { revokeWorkFlow } from '@/routes/utils';
import { Store } from '../stores/storeProvider';
import styles from '../index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const HeaderButtons = observer(() => {
  const {
    header,
    listDs,
    headerDs,
    // handleGetInfo,
    // status,
    history,
    budgetTemplateCode,
    budgetHeaderId,
    pubPathFlag,
    isArchived,
    canResetAcionsFlag,
    budgetHeaderStatus,
  } = useContext(Store);

  // 提交
  // const handleSubmit = async () => {
  //   if (listDs?.length === 0) {
  //     notification.warning({
  //       message: intl.get(`${commonPrompt}.mustHaveLine`).d('当前预算未维护行信息'),
  //     });
  //   } else {
  //     if (budgetHeaderStatus === 'APPROVED' && !(header.dirty || listDs.dirty)) {
  //       notification.error({
  //         message: intl.get(`${commonPrompt}.dontSubmitAgain`).d('信息没有更改，不可以再提交'),
  //       });
  //       return;
  //     }

  //     const dataInfo = await handleGetInfo();

  //     const request = ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(budgetHeaderStatus)
  //       ? editingSubmit
  //       : submit;

  //     if (dataInfo) {
  //       return new Promise((resolve) => {
  //         request({
  //           ...dataInfo,
  //         })
  //           .then((res) => {
  //             if (getResponse(res)) {
  //               notification.success();
  //               history.push(`/sbud/budget/list`);
  //             }
  //           })
  //           .finally(() => {
  //             resolve();
  //           });
  //       });
  //     }
  //   }
  // };

  // 整单作废
  const handleWholeVoid = async () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl
            .get(`${commonPrompt}.wholeBudgetVoidTip`, { budgetNum: header?.get('budgetNum') })
            .d(`确认要作废预算单${header?.get('budgetNum')}`)}
        </div>
      ),
    }).then(button => {
      if (button === 'ok') {
        return new Promise(resolve => {
          wholeVoid([
            {
              ...header.toData(),
              budgetLineList: listDs.toData(),
            },
          ])
            .then(res => {
              if (getResponse(res)) {
                notification.success();
                history.push(`/sbud/budget/list`);
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    });
  };

  // 跳转到编辑
  const hanleToEdit = () => {
    history.push(
      `/sbud/budget/detail?budgetHeaderId=${budgetHeaderId}&budgetTemplateCode=${budgetTemplateCode}&back=read`
    );
  };

  // 操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationRecord budgetHeaderId={budgetHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  const headerBtn = () => {
    const approvaFlags = headerDs?.getState('approvaFlags');
    const operationFlags = headerDs?.getState('operationFlags');
    const workFlowBusinessKey = header?.get('businessKey');
    const approvaFlag = approvaFlags?.[workFlowBusinessKey];
    const operationFlag = operationFlags?.[workFlowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    return (
      <>
        {/* {!['ABOLISHED', 'APPROVING', 'EDIT_APPROVING'].includes(budgetHeaderStatus) && (
          <>
            <Button
              color="primary"
              icon="done"
              type="c7n-pro"
              funcType="raised"
              onClick={handleSubmit}
              permissionList={[
                {
                  code: 'srm.budget.manager.budget.button.submit',
                  type: 'button',
                },
              ]}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          </>
        )} */}
        {!pubPathFlag &&
          (!isArchived || canResetAcionsFlag) &&
          ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(budgetHeaderStatus) && (
            <Button
              icon="cancel"
              funcType="flat"
              type="c7n-pro"
              onClick={handleWholeVoid}
              permissionList={[
                {
                  code: 'srm.budget.manager.budget.button.whole-abolished',
                  type: 'button',
                },
              ]}
            >
              {intl.get(`${commonPrompt}.budgetWholeVoid`).d('整单作废')}
            </Button>
          )}

        {!pubPathFlag &&
          (!isArchived || canResetAcionsFlag) &&
          !['APPROVING', 'EDIT_APPROVING', 'ABOLISHED'].includes(budgetHeaderStatus) &&
          (
            <Button
              icon="mode_edit"
              funcType="flat"
              type="c7n-pro"
              onClick={hanleToEdit}
              permissionList={[
                {
                  code: 'srm.budget.manager.budget.button.ajust',
                  type: 'button',
                  meaning: '调整',
                },
              ]}
            >
              {intl.get(`${commonPrompt}.adjustment`).d('调整')}
            </Button>
          )}

        {!pubPathFlag && approvaFlags && approvaFlag && (
          <Button
            wait={500}
            type="c7n-pro"
            funcType="flat"
            onClick={() => {
              openApproveModal({
                modalProps: {
                  closable: true,
                },
                taskId,
                processInstanceId,
                onSuccess: () => {
                  if (history) {
                    history.push(`/sbud/budget/list`);
                  }
                },
              });
            }}
          >
            {intl.get('hzero.common.button.approval').d('审批')}
          </Button>
        )}
        {!pubPathFlag && operationFlags && operationFlag?.REVOKE && (
          <Button
            wait={500}
            type="c7n-pro"
            funcType="flat"
            onClick={async () => {
              const res = await revokeWorkFlow(workFlowBusinessKey);
              if (res && history) {
                history.push(`/sbud/budget/list`);
              }
            }}
          >
            {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
          </Button>
        )}

        <Button icon="assignment" funcType="flat" type="c7n-pro" onClick={handleActHistory}>
          {intl.get(`hzero.common.button.operating`).d('操作记录')}
        </Button>
      </>
    );
  };

  return (
    <Header
      backPath={pubPathFlag ? null : '/sbud/budget/list'}
      title={intl.get(`${commonPrompt}.budgetDetail`).d('预算详情')}
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = function Detail() {
  const { headerDs, listDs, pubPathFlag } = useContext(Store);

  return (
    <>
      <HeaderButtons />

      <div
        className={classnames(
          styles['new-detail-content'],
          pubPathFlag ? '' : styles['overflow-detail-content']
        )}
      >
        <Spin spinning={headerDs.status !== 'ready' || listDs.status !== 'ready'}>
          <Content>
            <h3 className="content-title">{intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}</h3>
            <BaseInfo />
          </Content>

          <Content>
            <h3 className="content-title">
              {intl.get(`${commonPrompt}.budgetDetailInfo`).d('预算明细')}
            </h3>
            <LineInfo />
          </Content>
        </Spin>
      </div>
    </>
  );
};

export default observer(Detail);
