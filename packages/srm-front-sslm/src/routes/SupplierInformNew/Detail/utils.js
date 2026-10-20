/*
 * @Date: 2024-07-02 14:04:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
// 供应商信息隐藏平台页签
export const PLATFORM_TABS = {
  PLATFORM_CONTACTS: 'spfmCompanyContacts',
};

// 头按钮权限集
export const btnsPermissions = [
  {
    name: 'supplierInfo',
    code: 'srm.partner.my-partner.supplier-inform-change-new.button.360Info',
    meaning: '供应商360信息',
  },
  {
    name: 'approval',
    code: 'srm.partner.my-partner.supplier-inform-change-new.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.my-partner.supplier-inform-change-new.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
  {
    name: 'detailPrint',
    code: 'srm.partner.my-partner.supplier-inform-change-new.button.req-detail-print',
    meaning: '变更单打印',
  },
  {
    name: 'surveyPrint',
    code: 'srm.partner.my-partner.supplier-inform-change-new.button.link-investigate-print',
    meaning: '关联调查表打印',
  },
];
