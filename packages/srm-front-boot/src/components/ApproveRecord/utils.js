import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export function approveNameRenderTemp(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
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
      default:
        break;
    }
  }
  return { actionText, actionColor };
}

export async function getAttachmentCountService(params) {
  return request(`/hfle/v1/${tenantId}/files/count-batch`, {
    method: 'POST',
    body: params,
  });
}
