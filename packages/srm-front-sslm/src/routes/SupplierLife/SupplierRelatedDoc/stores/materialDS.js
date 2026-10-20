/*
 * @Date: 2021-12-01 11:41:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

const materialDS = () => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'authReqStatusCodeMeaning',
    },
    {
      label: intl.get('sslm.material.model.material.num').d('物料认证单号'),
      name: 'reqHeaderNum',
    },
    {
      label: intl.get('sslm.material.model.material.currentStage').d('当前阶段'),
      name: 'nodeCodeMeaning',
    },
    {
      label: intl.get('sslm.material.model.material.category').d('采购品类'),
      name: 'categoryName',
    },
    {
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
      name: 'companyName',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params = {}, ...other } = data;
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/req_headder_recognition`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

const materialColumns = ({ jumpMaterial, isPub }) => [
  {
    name: 'authReqStatusCodeMeaning',
    renderer: renderStatus,
  },
  {
    name: 'reqHeaderNum',
    renderer: ({ value, record }) =>
      isPub ? value : <a onClick={() => jumpMaterial(record)}>{value}</a>,
  },
  {
    name: 'nodeCodeMeaning',
  },
  {
    name: 'categoryName',
  },
  {
    name: 'companyName',
  },
];

export { materialDS, materialColumns };
