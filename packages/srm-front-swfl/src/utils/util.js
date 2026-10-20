import React from 'react';
import { Tag } from 'hzero-ui';
import { Tag as C7NTag, Icon } from 'choerodon-ui';
import { isNil } from 'lodash';
import { Button } from 'choerodon-ui/pro';
import { stringify } from 'querystring';

import { ReactComponent as NotFoundSvg } from '@/assets/not_found_process.svg';
import { ReactComponent as NotAccessSvg } from '@/assets/no_access.svg';

import { Content } from 'components/Page';
import { getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import { getDvaApp } from 'utils/iocUtils';
import { closeTab, getActiveTabKey } from 'utils/menuTab';

import NotFound from '@/components/NotFound';
import { TASK_MENU_TYPE } from './constant';

export function processStatusRender(processStatus, currentStatus, recordData) {
  const showIcon = !!(
    recordData &&
    recordData.processExceptionInformation &&
    recordData.processExceptionInformation.messageHead
  );
  if (!currentStatus || currentStatus.toUpperCase() === 'APPROVAL') {
    // return <Tag color="geekblue">{processStatus.APPROVAL || ''}</Tag>;
    return (
      <Tag style={{ color: '#fca400', backgroundColor: '#fef4e2' }}>
        {processStatus.APPROVAL || ''}
      </Tag>
    );
  }
  switch (currentStatus.toUpperCase()) {
    case 'APPROVED':
      // return <Tag color="green" >{processStatus.APPROVED || ''}</Tag>;
      return (
        <Tag style={{ color: '#47b883', backgroundColor: '#ebf7f1' }}>
          {processStatus.APPROVED || ''}
        </Tag>
      );
    case 'REJECTED':
      // return <Tag color="red">{processStatus.REJECTED || ''}</Tag>;
      return (
        <Tag style={{ color: '#f56649', backgroundColor: '#ffeeeb' }}>
          {processStatus.REJECTED || ''}
        </Tag>
      );
    case 'STOP':
      // return <Tag>{processStatus.STOP || ''}</Tag>;
      return (
        <Tag style={{ color: '#595959', backgroundColor: '#f0f0f0' }}>
          {processStatus.STOP || ''}
        </Tag>
      );
    case 'REVOKE':
      // return <Tag color="magenta">{processStatus.REVOKE || ''}</Tag>;
      return (
        <Tag style={{ color: '#f56649', backgroundColor: '#ffeeeb' }}>
          {processStatus.REVOKE || ''}
        </Tag>
      );
    case 'SUSPENDED':
      // return <Tag color="orange">{processStatus.SUSPENDED || ''}</Tag>;
      return (
        <Tag style={{ color: '#f56649', backgroundColor: '#ffeeeb' }}>
          {processStatus.SUSPENDED || ''}
          {showIcon && (
            <Icon
              type="error"
              style={{
                fontSize: '18px',
                marginLeft: '4px',
                lineHeight: '20px',
                height: '22px',
              }}
            />
          )}
        </Tag>
      );
    default:
      // return <Tag color="geekblue">{processStatus.APPROVAL || ''}</Tag>;
      return (
        <Tag style={{ color: '#333', backgroundColor: '#ddd', fontWeight: 400 }}>
          {processStatus[currentStatus] || ''}
        </Tag>
      );
  }
}

export function approveNameRenderTemp(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startdelegateevent':
        actionColor = 'pink';
        actionText = intl.get('hzero.common.text.startDelegete').d('申请人转交');
        break;
      case 'startevent':
        actionColor = '#2C3E50';
        actionText = intl.get('hzero.common.text.startEvent').d('开始');
        break;
      case 'endevent':
        actionText = intl.get('hzero.common.text.endEvent').d('结束');
        break;
      case 'approved':
        actionColor = '#87d068';
        actionText = intl.get('hzero.common.status.agree').d('同意');
        break;
      case 'rejected':
        actionColor = '#f50';
        actionText = intl.get('hzero.common.status.reject').d('拒绝');
        break;
      case 'addsign':
        actionColor = 'cyan';
        actionText = intl.get('hzero.common.status.addSign').d('加签');
        break;
      case 'approveandaddsign':
        actionColor = 'green';
        actionText = intl.get('hzero.common.status.ApproveAndAddSign').d('同意并加签');
        break;
      case 'delegate':
        actionColor = '#108ee9';
        actionText = intl.get('hzero.common.status.delegate').d('转交');
        break;
      case 'jump':
        actionColor = 'red';
        actionText = intl.get('hzero.common.status.jump').d('驳回');
        break;
      case 'recall':
        actionColor = 'orange';
        actionText = intl.get('hzero.common.status.recall').d('撤回');
        break;
      case 'revoke':
        actionColor = 'gold';
        actionText = intl.get('hzero.common.status.revoke').d('撤销');
        break;
      case 'autodelegate':
        actionColor = '#2db7f5';
        actionText = intl.get('hzero.common.status.autoDelegate').d('自动转交');
        break;
      case 'carboncopy':
        actionColor = 'purple';
        actionText = intl.get('hzero.common.status.carbonCopy').d('抄送');
        break;
      case 'autocarboncopy':
        actionColor = 'purple';
        actionText = intl.get('hzero.common.status.autocarboncopy').d('自动抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('hzero.common.status.specify').d('指定');
        break;
      case 'stop':
        actionText = intl.get('hzero.common.status.stop').d('终止');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}

export function approveNameRender(action) {
  const { actionText, actionColor } = approveNameRenderTemp(action);
  return actionText ? <Tag color={actionColor}>{actionText}</Tag> : null;
}

export function menuLeaf() {
  const state = getDvaApp()._store.getState();
  const { global: { menuLeafNode = [] } = {} } = state;
  return menuLeafNode;
}

export function getDetailDispatchRouter(originTaskMenu) {
  if (originTaskMenu) {
    return {
      approvalMenu: originTaskMenu === TASK_MENU_TYPE.APPROVAL_WORKBENCH,
      taskMenu: originTaskMenu === TASK_MENU_TYPE.TASK_LIST,
    };
  }
  const menuLeafNode = menuLeaf();
  let approvalMenu = false;
  let taskMenu = false;
  menuLeafNode.forEach((item) => {
    if (item.path === '/hwfp/approval') {
      approvalMenu = true;
    }
    if (item.path === '/hwfp/task') {
      taskMenu = true;
    }
  });
  return { approvalMenu, taskMenu };
}

export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

// 含有离职标识的string转化为带有tag的dom
export function ResignedDisplay({ value = '' }) {
  try {
    const messageArr = value.split('[employeeResign]');
    const { length } = messageArr;
    if (length < 2) {
      return value;
    }
    const result = [];
    messageArr.forEach((item, index) => {
      result.push(item);
      if (index < length - 1) {
        result.push(<QuitTag />);
      }
    });
    return <>{result.map((item) => item)}</>;
  } catch (e) {
    return value;
  }
}

// 离职tag
export function QuitTag() {
  return (
    <Tag
      color="#E5E7EC"
      style={{
        lineHeight: '18px',
        height: '18px',
        border: 'none',
        padding: '0 4px',
        cursor: 'default',
        margin: 0,
        transform: 'scale(0.84)',
        color: '#4e5769',
      }}
    >
      {intl.get('hzero.common.organization.model.position.leave').d('离职')}
    </Tag>
  );
}

export function getCheckDelegateMessage(delegateCode) {
  const { additionInfo } = getCurrentUser() || {};
  const { employeeCode } = additionInfo || {};
  if (!isNil(employeeCode) && `${delegateCode}` === `${employeeCode}`) {
    return intl.get('hwfp.common.validate.message.cannotDelegateSelf').d('不能转交给自己');
  }
  return undefined;
}

export const ERROR_CODE = {
  PROCESSED: 'hwfp.error.task.not_found',
  NO_APPROVE_PERMISSION: 'hwfp.error.need_assignee_or_admin',
  NO_MENU_PERMISSION: 'no_menu_permisison',
};

export const errorProcessRender = ({
  processInstanceId,
  errorCode,
  callback,
  showExtra = true,
  taskMenu: originTaskMenu,
  processRemote,
  linkToApproved,
}) => {
  const activeTabKey = getActiveTabKey();
  const isRoleWorkbench = activeTabKey === '/swbh/role-workbench';
  const { approvalMenu, taskMenu } = getDetailDispatchRouter(originTaskMenu);
  const handleClick = async (backToWorkbench) => {
    closeTab(activeTabKey, undefined, false);
    let flag = true;
    if (processRemote) {
      flag = await processRemote.process('SWFL_APPROVAL_WORKBENCH_ERROR_PROCESS_BUTTON', true, {});
    }
    if (!flag) {
      return;
    }
    if (backToWorkbench) {
      callback({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/workplace`,
      });
    } else if (approvalMenu) {
      callback({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/hwfp/approval/list`,
      });
    } else if (taskMenu) {
      callback({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/hwfp/task/list`,
        search: stringify({ from: 'TaskNew' }),
      });
    } else {
      callback({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/workplace`,
      });
    }
  };
  if (ERROR_CODE.PROCESSED === errorCode) {
    if (linkToApproved) {
      const menuPath = approvalMenu
        ? `/hwfp/approval/involved-task/detail/${processInstanceId}`
        : `/hwfp/involved-task/detail/${processInstanceId}`;
      if (callback) {
        closeTab(activeTabKey, undefined, false);
        callback(menuPath);
      }
      return null;
    }
    return (
      <Content>
        <NotFound
          img={<NotFoundSvg />}
          title={intl.get('hwfp.common.view.message.processProcessed').d('当前待办已处理完成')}
          subTitle={intl
            .get('hwfp.common.view.message.processProcessedHelp')
            .d('请返回审批列表查询最新待办事项')}
          extra={
            showExtra ? (
              <Button color="primary" onClick={() => handleClick()}>
                {intl.get('hwfp.common.view.message.backToApproveWorkbench').d('返回审批列表')}
              </Button>
            ) : null
          }
        />
      </Content>
    );
  } else {
    return (
      <Content>
        <NotFound
          img={<NotAccessSvg />}
          title={
            errorCode === ERROR_CODE.NO_APPROVE_PERMISSION
              ? intl.get('hwfp.common.view.message.noAccess').d('页面不可访问')
              : intl.get('hwfp.common.view.message.unableProcess').d('待办无法处理')
          }
          subTitle={
            errorCode === ERROR_CODE.NO_APPROVE_PERMISSION
              ? intl
                  .get('hwfp.common.view.message.noAccessHelp')
                  .d('当前账户无权限访问该页面，点击返回工作台页面')
              : intl
                  .get('hwfp.common.view.message.unableProcessHelp')
                  .d(
                    '当前角色下账户无审批工作台/我的待办事项功能菜单权限，无法处理待办，请联系管理员分配相关权限'
                  )
          }
          extra={
            showExtra ? (
              <Button color="primary" onClick={() => handleClick(true)}>
                {intl.get('hwfp.common.view.message.backToWorkbench').d('返回工作台')}
              </Button>
            ) : null
          }
        />
      </Content>
    );
  }
};

export function renderDelegateStatus({ value, text }) {
  switch (value) {
    case 'EXPIRED':
      return (
        <C7NTag color="gray" border={false}>
          {text}
        </C7NTag>
      );
    case 'NOT_YET_EFFECTIVE':
      return (
        <C7NTag color="yellow" border={false}>
          {text}
        </C7NTag>
      );
    case 'IN_EFFECT':
      return (
        <C7NTag color="green" border={false}>
          {text}
        </C7NTag>
      );
    case 'NOT_CONIFG':
      return (
        <C7NTag color="gray" border={false}>
          {text}
        </C7NTag>
      );
    default:
      return null;
  }
}
