/*
 * @Date: 2022-02-16 14:56:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Link } from 'dva/router';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { numberRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

// 协议列表DS
const agreementDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'pcStatusCodeMeaning',
      label: intl.get(`spcm.purchaseContractView.model.pcStatusCode`).d('状态'),
    },
    {
      name: 'pcNum',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      label: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
    },
    {
      name: 'companyName',
      label: intl.get(`spcm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.amount`).d('协议总额'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycles/agreement`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.AGREEMENT_LIST,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.AGREEMENT_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

// 协议Columns
const agreementColumns = ({ contractWorkspace } = {}) => [
  {
    name: 'pcStatusCodeMeaning',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'pcNum',
    width: 160,
    renderer: ({ value, record }) => {
      const { data: { pcHeaderId } = {} } = record;
      const oldRouter = `/spcm/purchase-contract-view/detail?pcHeaderId=${pcHeaderId}`;
      const newRouter = `/spcm/contract-workspace/view/${pcHeaderId}`;
      return <Link to={contractWorkspace ? newRouter : oldRouter}>{value}</Link>;
    },
  },
  {
    name: 'pcName',
    width: 150,
  },
  {
    name: 'supplierCompanyName',
    width: 150,
  },
  {
    name: 'companyName',
    width: 150,
  },
  {
    name: 'taxIncludeAmount',
    width: 90,
    renderer: ({ value }) => numberRender(value, 2),
  },
];
export { agreementDS, agreementColumns };
