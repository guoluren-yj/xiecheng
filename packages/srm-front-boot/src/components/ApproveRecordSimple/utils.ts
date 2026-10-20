import intl from 'utils/intl';

export function getApproveActionStyle(action?: string): {
  text: string,
  color: string,
} {
  let text: string = intl.get('hwfp.common.view.title.pending').d('待审批');
  let color: string = '134, 141, 156';
  if (action) {
    switch (action.toLowerCase()) {
      case 'start':
      case 'startevent':
        color = '59, 179, 70';
        text = intl.get('hzero.common.text.startEvent').d('开始');
        break;
      case 'end':
      case 'endevent':
        text = intl.get('hzero.common.text.endEvent').d('结束');
        break;
      case 'approved':
        color = '59, 179, 70';
        text = intl.get('hzero.common.status.agree').d('同意');
        break;
      case 'rejected':
        color = '237, 47, 0';
        text = intl.get('hzero.common.status.reject').d('拒绝');
        break;
      case 'addsign':
        text = intl.get('hzero.common.status.addSign').d('加签');
        break;
      case 'approveandaddsign':
        color = '59, 179, 70';
        text = intl.get('hzero.common.status.ApproveAndAddSign').d('同意并加签');
        break;
      case 'delegate':
        text = intl.get('hzero.common.status.delegate').d('转交');
        break;
      case 'jump':
        color = '237, 47, 0';
        text = intl.get('hzero.common.status.jump').d('驳回');
        break;
      case 'recall':
        text = intl.get('hzero.common.status.recall').d('撤回');
        break;
      case 'revoke':
        text = intl.get('hzero.common.status.revoke').d('撤销');
        break;
      case 'autodelegate':
        text = intl.get('hzero.common.status.autoDelegate').d('自动转交');
        break;
      case 'carboncopy':
        text = intl.get('hzero.common.status.carbonCopy').d('抄送');
        break;
      case 'autocarboncopy':
        text = intl.get('hzero.common.status.autocarboncopy').d('自动抄送');
        break;
      case 'specify':
        text = intl.get('hzero.common.status.specify').d('指定');
        break;
      default:
        break;
    }
  }
  return { text, color };
}