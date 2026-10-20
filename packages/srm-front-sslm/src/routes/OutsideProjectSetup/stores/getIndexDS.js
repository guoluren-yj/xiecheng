/*
 * @Date: 2025-08-15 10:05:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export const organizationId = getCurrentOrganizationId();

export const indexDS = () => ({
  pageSize: 20,
  primaryKey: 'extSourceReqId',
  fields: [
    {
      name: 'reqStatus',
      label: intl.get('hzero.common.common.status').d('状态'),
    },
    {
      name: 'operator',
      label: intl.get('hzero.common.title.operator').d('操作'),
    },
    {
      name: 'reqNumber',
      label: intl.get('sslm.outsideProjectSetup.modal.reqNumber').d('编号'),
    },
    {
      name: 'reqTitle',
      label: intl.get('hzero.common.button.title').d('标题'),
    },
    {
      name: 'responseStatus',
      label: intl.get('sslm.outsideProjectSetup.modal.responseStatus').d('响应情况'),
    },
    {
      name: 'releaseDate',
      label: intl.get('sslm.outsideProjectSetup.modal.releaseDate').d('寻源发布日期'),
    },
    {
      name: 'endDate',
      label: intl.get('sslm.outsideProjectSetup.modal.endDate').d('响应截止日期'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
    },
    {
      name: 'realName',
      label: intl.get(`hzero.common.date.realName`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs`,
      method: 'GET',
    },
  },
});
