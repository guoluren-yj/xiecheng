/**
 * 供应商黑名单关系排查 租户级
 * @Author: zepeng.huang@going-link.com
 * @Date: 2022-12-01
 * @Copyright: Copyright (c) 2022, Zhenyun
 */

import intl from 'utils/intl';
// import { SRM_DATA_SDAT } from '@/utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// const tenantId = getCurrentOrganizationId();

const getBlackListDs = () => ({
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('hzero.common.view.serialNumber').d('序号'),
      name: 'number',
      type: 'number',
    },
    {
      label: intl.get('sdat.blacklistRelationship.view.header.enterpriseName').d('黑名单企业'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.blacklistRelationship.view.header.relationLevel').d('关系层级'),
      name: 'level',
      type: 'number',
    },
    {
      label: intl.get('sdat.blacklistRelationship.view.header.relationPath').d('关系路径'),
      name: 'relationPath',
      type: 'string',
    },
  ],
});

export { getBlackListDs };
