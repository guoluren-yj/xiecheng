/*
 * @Date: 2024-07-02 10:33:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getRelevantRecordsDs = ({ supplierId } = {}) => ({
  selection: false,
  pageSize: 20,
  autoQuery: true,
  queryParameter: { supplierId },
  fields: [
    {
      name: 'extOperateMeaning',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'extSourceMeaning',
      label: intl.get('sslm.common.model.field.operationSource').d('操作来源'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.common.model.common.operator').d('操作人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.common.operationTime').d('操作时间'),
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.workbench.model.workbench.platformSupplierNum').d('平台供应商编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.workbench.model.workbench.platformSupplierName').d('平台供应商名称'),
    },
    {
      name: 'extLllustrate',
      label: intl.get('sslm.common.model.instructions').d('说明'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/partners/ext-link`,
      method: 'GET',
    },
  },
});

export const getRelevantRecordsColumns = [
  {
    name: 'extOperateMeaning',
    width: 120,
  },
  {
    name: 'extSourceMeaning',
    width: 120,
  },
  {
    name: 'createUserName',
    width: 120,
  },
  {
    name: 'creationDate',
    width: 150,
  },
  {
    name: 'companyNum',
    width: 120,
  },
  {
    name: 'companyName',
  },
  {
    name: 'extLllustrate',
    width: 200,
  },
];
