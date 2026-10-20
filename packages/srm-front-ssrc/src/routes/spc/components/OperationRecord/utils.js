import intl from 'utils/intl';

const approvedList = [
  'Approved',
  'APPROVE',
  'APPROVED',
  'RELEASE_APPROVED',
  'CHECK_APPROVED',
  'APPROVE_SUCCESS',
  'EXT_APPROVE_SUCCESS',
];
const rejectionList = [
  'Rejected',
  'REJECT',
  'REJECTED',
  'RELEASE_REFUSED',
  'CHECK_REFUSED',
  'APPROVE_REJECTED',
  'EXT_APPROVE_REJECT',
];

// 设置字体颜色
const getComputedColor = (action) => {
  switch (action) {
    case 'Approved':
    case 'APPROVE':
    case 'APPROVED':
    case 'RELEASE_APPROVED':
    case 'CHECK_APPROVED':
    case 'APPROVE_SUCCESS':
    case 'EXT_APPROVE_SUCCESS':
      return '#47B881';
    case 'Rejected':
    case 'REJECT':
    case 'REJECTED':
    case 'RELEASE_REFUSED':
    case 'CHECK_REFUSED':
    case 'APPROVE_REJECTED':
    case 'EXT_APPROVE_REJECT':
      return '#F56349';
    default:
      return '#E5E5E5';
  }
};

// 获取图标类型
const getOperationIcon = (type) => {
  switch (type) {
    case 'NEW':
      return 'add';
    case 'Approved':
    case 'APPROVE':
    case 'APPROVED':
    case 'RELEASE_APPROVED':
    case 'CHECK_APPROVED':
    case 'APPROVE_SUCCESS':
    case 'EXT_APPROVE_SUCCESS':
      return 'authorize';
    case 'Rejected':
    case 'REJECT':
    case 'REJECTED':
    case 'RELEASE_REFUSED':
    case 'CHECK_REFUSED':
    case 'APPROVE_REJECTED':
    case 'EXT_APPROVE_REJECT':
      return 'authorize';
    case 'REVOCATION':
      return 'reply';
    case 'UPDATE':
      return 'mode_edit';
    default:
      return 'check';
  }
};

// 获取操作描述
const getOperationDesc = (
  record,
  initTitle,
  {
    realName = 'realName',
    loginName = 'loginName',
    actionName = 'actionName',
    actionCode = 'actionCode',
  } = {}
) => {
  const realNameDesc =
    record[realName] && record[loginName]
      ? `${record[realName]}（${record[loginName]}）`
      : record[realName] || record[loginName];
  const title =
    initTitle || intl.get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustment').d('调价单');
  const operationDescMap = {
    NEW: [realNameDesc, intl.get('ssrc.common.view.message.createAction').d('新建了'), title],
    APPROVAL: [realNameDesc, intl.get('ssrc.common.view.message.releaseAction').d('发布了'), title],
    APPROVED: [intl.get(`ssrc.common.status.approved`).d('工作流审批通过')],
    REJECTED: [intl.get(`ssrc.common.status.rejected`).d('工作流审批拒绝')],
    REVOCATION: [
      realNameDesc,
      intl.get('ssrc.common.view.message.revokeAction').d('撤回了'),
      title,
    ],
    EXT_APPROVE_SUCCESS: [intl.get(`ssrc.common.status.extApproveSuccess`).d('外部审批通过')],
  };
  const defaultDesc = [realNameDesc, record[actionName], title];
  return operationDescMap[record[actionCode]] || defaultDesc;
};

export { getComputedColor, getOperationIcon, getOperationDesc, rejectionList, approvedList };
