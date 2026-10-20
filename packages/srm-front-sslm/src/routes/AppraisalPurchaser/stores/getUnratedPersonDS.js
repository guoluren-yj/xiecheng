/*
 * @Date: 2023-11-07 14:45:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 未评分人ds
export const getUnratedPersonDs = ({ evalHeaderId }) => ({
  autoQuery: true,
  pageSize: 20,
  dataToJSON: 'selected',
  primaryKey: 'respUserId',
  fields: [
    {
      name: 'loginName',
      label: intl.get('sslm.supplierDocManage.model.docManage.scoreUser').d('评分用户'),
    },
    {
      name: 'userName',
      label: intl.get('sslm.supplierDocManage.model.docManage.userName').d('评分人描述'),
    },
    {
      name: 'userDepartment',
      label: intl.get('sslm.supplierDocManage.model.docManage.department').d('部门'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/${evalHeaderId}/un-complete`,
      method: 'POST',
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/batch-urge`,
        method: 'POST',
        data: {
          evalHeaderIds: [evalHeaderId],
          respUserIds: data.map(item => item.respUserId),
        },
      };
    },
  },
});

// 未评分人columns
export const getUnratedPersonColumns = [
  {
    name: 'loginName',
  },
  {
    name: 'userName',
  },
  {
    name: 'userDepartment',
  },
];
