import React, { useContext } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { openApproveModal } from '_components/ApproveModal';
import queryString from 'querystring';

import { Content, Header } from 'components/Page';
import { Spin, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import {
  save,
  submit,
  editingSave,
  editingSubmit,
  wholeVoid,
  batchWholeDelete,
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
    headerDs,
    listDs,
    handleGetInfo,
    budgetHeaderId,
    commonUpdate,
    history,
    back,
    isArchived,
    canResetAcionsFlag,
    budgetHeaderStatus,
    budgetTemplateCode,
  } = useContext(Store);
  const params = queryString.parse(location.search.substr(1)) || {};
  const { sourceLine } = params;
  // 保存
  const handleSave = async () => {
    const dataInfo = await handleGetInfo();

    if (dataInfo) {
      const request = ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(budgetHeaderStatus)
        ? editingSave
        : save;
      return new Promise(resolve => {
        request({
          ...dataInfo,
        })
          .then(res => {
            if (getResponse(res)) {
              if (!budgetHeaderId) {
                if (res?.frontWarnMsg) {
                  notification.warning({ message: res?.frontWarnMsg })
                } else {
                  notification.success();
                }
                history.push(
                  `/sbud/budget/detail?budgetHeaderId=${res.budgetHeaderId}&budgetTemplateCode=${res.budgetTemplateCode}&sourceLine=${sourceLine}`
                );
                // commonUpdate();
              } else {
                if (res?.frontWarnMsg) {
                  notification.warning({ message: res?.frontWarnMsg })
                } else {
                  notification.success();
                }
                commonUpdate();
              }
            }
          })
          .finally(() => {
            resolve();
          });
      });
    }
  };

  // 提交
  const handleSubmit = async () => {
    if (listDs?.length === 0) {
      notification.warning({
        message: intl.get(`${commonPrompt}.mustHaveLine`).d('当前预算未维护行信息'),
      });
    } else {
      if (budgetHeaderStatus === 'APPROVED' && !(header.dirty || listDs.dirty)) {
        notification.error({
          message: intl.get(`${commonPrompt}.dontSubmitAgain`).d('信息没有更改，不可以再提交'),
        });
        return;
      }

      const dataInfo = await handleGetInfo();

      const request = ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(budgetHeaderStatus)
        ? editingSubmit
        : submit;

      if (dataInfo) {
        return new Promise(resolve => {
          request({
            ...dataInfo,
          })
            .then(res => {
              if (getResponse(res)) {
                if (res?.frontWarnMsg) {
                  notification.warning({ message: res?.frontWarnMsg })
                } else {
                  notification.success();
                }
                history.push(`/sbud/budget/list`);
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    }
  };

  const handleDelete = () => {
    const data = headerDs.toData();
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: (
        <div>
          {intl
            .get(`${commonPrompt}.budgetDeleteTip`, { budgetNum: header?.get('budgetNum') })
            .d(`确认要删除预算单${header?.get('budgetNum')}`)}
        </div>
      ),
    }).then(button => {
      if (button === 'ok') {
        return new Promise(resolve => {
          batchWholeDelete(data)
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
        {(!isArchived || canResetAcionsFlag) && !['ABOLISHED', 'APPROVING', 'EDIT_APPROVING'].includes(budgetHeaderStatus) && (
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
            <Button
              icon="save"
              funcType="flat"
              type="c7n-pro"
              onClick={handleSave}
            // permissionList={[
            //   {
            //     code: 'srm.budget.manager.budget.button.submit',
            //     type: 'button',
            //   },
            // ]}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </>
        )}
        {(!isArchived || canResetAcionsFlag) &&
          ['NEW', 'REJECT'].includes(budgetHeaderStatus) &&
          header?.get('budgetHeaderId') && (
            <Button
              icon="delete"
              funcType="flat"
              type="c7n-pro"
              onClick={() => handleDelete()}
              permissionList={[
                {
                  code: 'srm.budget.manager.budget.button.delete',
                  type: 'button',
                },
              ]}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
        {(!isArchived || canResetAcionsFlag) && ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(budgetHeaderStatus) && (
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
        {approvaFlags && approvaFlag && (
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
        {operationFlags && operationFlag?.REVOKE && (
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
        {budgetHeaderId && (
          <Button icon="assignment" funcType="flat" type="c7n-pro" onClick={handleActHistory}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        )}
      </>
    );
  };

  return (
    <Header
      backPath={
        back === 'read'
          ? `/sbud/budget/read?budgetHeaderId=${budgetHeaderId}&budgetTemplateCode=${budgetTemplateCode}&status=edit`
          : '/sbud/budget/list'
      }
      title={
        budgetHeaderId
          ? intl.get(`${commonPrompt}.editBudgetDetail`).d('编辑预算详情')
          : intl.get(`${commonPrompt}.addBudgetDetail`).d('新建预算详情')
      }
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
