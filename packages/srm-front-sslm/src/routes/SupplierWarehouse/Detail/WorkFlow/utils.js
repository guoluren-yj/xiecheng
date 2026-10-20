import styles from '@/routes/index.less';
import { Tag } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// 绿色状态集合
const greenStatus = [
  'FEEDBACK_BAK',
  'SCORED',
  'COMPLETED',
  'CONFIRMED',
  'APPROVED',
  'EFFECTED',
  'TERMINATION_CONFIRM',
  'HAVE_ALTERATION',
  'ARCHIVE',
  'APPROVE',
  'SYSTEM_COMPLETE',
  'MANUAL_COMPLETE',
  'FINAL_COLLECTED',
  'FEEDBACK',
  'UN_SOURCE',
  'OPENED',
  'POSTQUAL_CUTOFF',
  'FINISHED',
  'PUBLISHED',
  'VALIDATED',
  'REVIEWED',
  'REGISTERED',
  'PASS',
  'CERTIFICATED',
  'RELEASED',
  'COMPLETE',
  // 调查表模板生效状态为1
  1,
  '1',
  'EVALUATED',
  'AUTHENTICATION_APPROVED',
  'EARLY_TERMINATION',
  'FINAL_AUTHENTICATION_COMPLETE',
  'SUBMITTED',
  'SUPPLIER_REJECTED',
  'SUPPLEMENT_COMPLETE',
  'REISSUED',
  'CREATE',
];

// 红色状态集合
const redStatus = [
  'BACK',
  'REJECTED',
  'REJECT',
  'SYSTEM_FAIL',
  'RETURNED',
  'RELEASE_REJECT',
  'CONFIRM_REJECT',
  'BACK_SCORE',
  'RELEASE_REJECTED',
  'LACK_QUOTED',
  'CHECK_REJECTED',
  'PAUSED',
  'ICA_REJECTED',
  'PCA_REJECTED',
  'CANCEL FINISH APPROVAL REJECT',
  'PUBULISH APPROVAE REJECT',
  'FAIL',
  'WFL_REJECT',
  'REG_REJECT',
  'AUTHENTICATION_REJECTED',
  'BACK',
];

// 灰色状态集合
const grayStatus = [
  'EXPIRED',
  'DELETED',
  'TERMINATION',
  'CANCELLATION',
  'CANCEL',
  'DISCARDED',
  'CLOSED',
  'CANCELED',
  'CANCELLED',
  'ABANDON',
  'RETAIN',
  'UNCERTIFIED',
  'UNREGISTERED',
  'UNSTART', // 未开始
  'UN_START',
  'REGISTER',
  'DISABLED',
  'OBSOLETED',
  'UNCHANGED',
  'DELETE',
];

// 获取状态字体、背景颜色
export function getStatusClassName(status) {
  const className = greenStatus.includes(status)
    ? styles['success-color'] // 绿色
    : redStatus.includes(status)
    ? styles['error-color'] // 红色
    : grayStatus.includes(status)
    ? styles['gray-color'] // 灰色
    : styles['warning-color']; // 橙色
  return className;
}

// 获取Tag组件color
export function getTagColor(status) {
  const color = greenStatus.includes(status)
    ? 'green' // 绿色
    : redStatus.includes(status)
    ? 'red' // 红色
    : grayStatus.includes(status)
    ? 'gray'
    : 'yellow';
  return color;
}
export function renderStatus(value) {
  let status = value;
  if (!['CREATE', 'UPDATE', 'DELETE'].includes(value)) {
    // eslint-disable-next-line no-unused-expressions, no-const-assign
    status = 'UNCHANGED';
  }
  const description =
    value === 'CREATE'
      ? intl.get('sslm.common.conent.create').d('新建')
      : value === 'UPDATE'
      ? intl.get('sslm.common.conent.update').d('更新')
      : value === 'DELETE'
      ? intl.get('sslm.common.conent.delete').d('删除')
      : intl.get('sslm.common.conent.unchange').d('未变更');
  const color = getTagColor(status);
  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <Tag color={color} style={{ border: 'none' }}>
      {description}
      {/* eslint-disable-next-line react/react-in-jsx-scope */}
      <Icon
        style={{
          fontSize: 14,
          cursor: 'pointer',
          position: 'relative',
          margin: '-3px 0px 0 4px',
        }}
      />
    </Tag>
  );
}
