/* eslint-disable react/react-in-jsx-scope */
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import styles from './index.less';

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

export function getRejectJumpTypeMessage(record) {
  const rejectJumpTypeMap = {
    'REFUSE_-1': intl
      .get('hwfp.common.view.rejectJumpType.refuse-1')
      .d('流程版本发生变更或发起的流程不一致，跳过已审批节点失败'),
    REFUSE_0: intl
      .get('hwfp.common.view.rejectJumpType.refuse0')
      .d('发起人再次提交的审批路径：从首个节点开始重新审批'),
    REFUSE_1: intl
      .get('hwfp.common.view.rejectJumpType.refuse2')
      .d('发起人再次提交的审批路径：跳过已审批节点直接到当前节点'),
    REFUSE_2: intl
      .get('hwfp.common.view.rejectJumpType.refuse2')
      .d('发起人再次提交的审批路径：跳过已审批节点直接到当前节点'),
    'REBUT_-1': intl
      .get('hwfp.common.view.rejectJumpType.rebut-1')
      .d('流程版本发生变更或发起的流程不一致，跳过已审批节点失败'),
    REBUT_0: intl
      .get('hwfp.common.view.rejectJumpType.rebut0')
      .d('驳回节点人员重审后的路径：从驳回节点后重新审批'),
    REBUT_1: intl
      .get('hwfp.common.view.rejectJumpType.rebut1')
      .d('驳回节点人员重审后的路径：跳过中间节点直接到当前节点'),
    REBUT_2: intl
      .get('hwfp.common.view.rejectJumpType.rebut2')
      .d('重审后的路径为跳过中间节点直接到当前节点'),
  };
  return record?.('rejectJumpType')
    ? rejectJumpTypeMap[`${record?.('rejectJumpType')}_${record?.get('rejectJumpFlag')}`]
    : undefined;
}

export function renderDelegateRecords(records) {
  const { length } = records;
  return records.map((record, index) => (
    <div>
      <div className={styles['delegate-record-title']}>
        {intl.get('hwfp.common.status.startDelegate').d('申请人转交')}
      </div>
      <div>
        <span className={styles['delegate-record-label']}>
          {intl.get('hwfp.common.model.apply.approver').d('审批人')}
        </span>
        <span className={styles['delegate-record-text']}>{record.assigneeName}</span>
      </div>
      <div>
        <span className={styles['delegate-record-label']}>
          {intl.get('hwfp.task.view.message.comment').d('审批意见')}
        </span>
        <span className={styles['delegate-record-text']}>{record.comment}</span>
      </div>
      <div>
        <span className={styles['delegate-record-label']}>
          {intl.get('hzero.common.view.message.cron.date').d('日期')}
        </span>
        <span className={styles['delegate-record-text']}>{record.endTime}</span>
      </div>
      {index < length - 1 && <div className={styles['delegate-record-line']} />}
    </div>
  ));
}
