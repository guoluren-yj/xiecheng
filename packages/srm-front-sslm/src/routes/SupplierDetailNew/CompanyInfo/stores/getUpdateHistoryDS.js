/*
 * @Date: 2023-08-25 16:50:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getUpdateHistoryDS = ({ purchaserId, supplierId }) => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('sslm.historyVersion.model.historyVersion.versionHistoryId').d('历史版本'),
      name: 'versionNumber',
    },
    {
      label: intl.get('sslm.historyVersion.model.historyVersion.createUserName').d('申请人'),
      name: 'createUserName',
    },
    {
      label: intl.get('sslm.historyVersion.model.historyVersion.updateDate').d('更新时间'),
      name: 'updateDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sslm.historyVersion.model.historyVersion.typeMeaning').d('更新来源'),
      name: 'typeMeaning',
    },
    {
      label: intl.get('sslm.historyVersion.model.historyVersion.receiptNumber').d('单据编号'),
      name: 'documentCode',
    },
    {
      label: intl.get('sslm.historyVersion.view.message.operateHistory').d('操作记录'),
      name: 'operated',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/version-history`,
      method: 'GET',
      data: { purchaserId, supplierId },
    },
  },
});
