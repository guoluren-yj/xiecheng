/*
 * @Date: 2025-01-21 17:44:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';
import OtherInfo from '../OtherInfo';
import InvitationInfo from '../InvitationInfo';

// 信息补录
export const getSupplementList = () => [
  {
    key: 'invitInfo',
    title: intl.get('sslm.supplierEntryDetail.view.entry.invitationInfo').d('邀请信息'),
    component: InvitationInfo,
    componentProps: {
      isEdit: true,
      type: 'APPROVAL_SUPPLEMENT',
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_SUPPLEMENT.INVIT_INFO',
    },
  },
  {
    key: 'otherInfo',
    title: intl.get('sslm.supplierEntryDetail.view.entry.otherInfo').d('其它信息'),
    component: OtherInfo,
    componentProps: {
      isEdit: true,
      type: 'APPROVAL_SUPPLEMENT',
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_SUPPLEMENT.OTHER_INFO',
    },
  },
];
