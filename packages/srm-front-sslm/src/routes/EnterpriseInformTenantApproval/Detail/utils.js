/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

// 明细头标题
export const getHeaderTitle = status => {
  switch (status) {
    case 'approval':
      return intl.get('sslm.enterpriseInform.view.title.approvalApplication').d('企业信息变更审批');
    case 'confirm':
      return intl.get('sslm.enterpriseInform.view.title.confirmApplication').d('企业信息变更确认');
    default:
      return intl.get('sslm.enterpriseInform.view.title.approvalApplication').d('企业信息变更审批');
  }
};

// 权限集
export const getBtnsPermissions = (isAllPlatform = false) => [
  {
    name: 'approval',
    code: isAllPlatform
      ? 'srm.partner.my-partner.firm-info-change-confirm-new.button.platform.detail.approval'
      : 'srm.partner.my-partner.firm-info-change-confirm-new.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: isAllPlatform
      ? 'srm.partner.my-partner.firm-info-change-confirm-new.button.platform.detail.repeal-approval'
      : 'srm.partner.my-partner.firm-info-change-confirm-new.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
];
