import intl from 'utils/intl';

// 设置字体颜色
const getComputedColor = (action) => {
  switch (action) {
    case 'Approved':
    case 'APPROVE':
    case 'RELEASE_APPROVED':
    case 'CHECK_APPROVED':
    case 'APPROVE_SUCCESS':
    case 'EXT_APPROVE_SUCCESS':
      return '#47B881';
    case 'Rejected':
    case 'REJECT':
    case 'RELEASE_REFUSED':
    case 'CHECK_REFUSED':
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
    case 'RELEASE':
      return 'publish2';
    case 'APPROVE_SUCCESS':
    case 'APPROVE_REJECT':
    case 'EXT_APPROVE_SUCCESS':
      return 'authorize';
    case 'INVALID':
      return 'cancel_presentation';
    default:
      return 'check';
  }
};

// 获取操作描述
const getOperationDesc = (record, initTitle) => {
  const realNameDesc = `${record.realName}（${record.loginName}）`;
  const title = initTitle || `【${intl.get('ssrc.common.view.message.price').d('价格')}】`;
  const operationDescMap = {
    NEW: [realNameDesc, intl.get('ssrc.common.view.message.createAction').d('新建了'), title],
    RELEASE: [realNameDesc, intl.get('ssrc.common.view.message.releaseAction').d('发布了'), title],
    APPROVE_SUCCESS: [intl.get(`ssrc.common.status.approved`).d('工作流审批通过')],
    APPROVE_REJECT: [intl.get(`ssrc.common.status.rejected`).d('工作流审批拒绝')],
    INVALID: [
      realNameDesc,
      intl.get(`ssrc.common.view.message.will`).d('将'),
      title,
      intl.get(`ssrc.common.status.invalidate`).d('置为无效'),
    ],
    EXT_APPROVE_SUCCESS: [intl.get(`ssrc.common.status.extApproveSuccess`).d('外部审批通过')],
  };
  const defaultDesc = [
    realNameDesc,
    record.actionName,
    title,
  ];
  return operationDescMap[record.actionCode] || defaultDesc;
};

export { getComputedColor, getOperationIcon, getOperationDesc };
