import React from 'react';
// import { Tag } from 'hzero-ui';

import intl from 'utils/intl';

export function approveNameRenderTemp(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startevent':
        actionColor = '#000000';
        actionText = intl.get('hwfp.common.status.start').d('开始');
        break;
      case 'endevent':
        actionColor = '#000000';
        actionText = intl.get('hwfp.common.status.end').d('结束');
        break;
      case 'approved':
        actionColor = '#000000';
        actionText = intl.get('ssta.costSheet.model.costSheet.approved').d('审批通过');
        break;
      case 'rejected':
        actionColor = '#F56349';
        actionText = intl.get('ssta.costSheet.model.costSheet.reject').d('审批拒绝');
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
      case 'autocarboncopy':
        actionColor = '#000000';
        actionText = intl.get('hzero.common.status.autoCarbonCopy').d('自动抄送');
        break;
      case 'carboncopy':
        actionColor = '#000000';
        actionText = intl.get('hzero.common.status.carbonCopy').d('抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('hzero.common.status.specify').d('指定');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}
/**
 * Timeline.Item的color不满足样式
 * @param {*} action
 * @returns
 */
export function approveNameRenderColor(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startevent':
        actionColor = '#000000';
        actionText = intl.get('hwfp.common.status.start').d('开始');
        break;
      case 'endevent':
        actionText = intl.get('hwfp.common.status.end').d('结束');
        break;
      case 'approved':
        actionColor = '#00bf96';
        actionText = intl.get('ssta.costSheet.model.costSheet.approved').d('审批通过');
        break;
      case 'rejected':
        actionColor = '#F56349';
        actionText = intl.get('ssta.costSheet.model.costSheet.reject').d('审批拒绝');
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
      case 'autocarboncopy':
        actionColor = '#E5E5E5';
        actionText = intl.get('hzero.common.status.autoCarbonCopy').d('自动抄送');
        break;
      case 'carboncopy':
        actionColor = '#E5E5E5';
        actionText = intl.get('hzero.common.status.carbonCopy').d('抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('hzero.common.status.specify').d('指定');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}
export function approveNameRender(action) {
  const { actionText, actionColor } = approveNameRenderTemp(action);
  return actionText ? <span style={{ color: actionColor }}>{actionText}</span> : null;
}
