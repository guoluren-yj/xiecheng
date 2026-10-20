/**
 * investigateDS - 调查表DS
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const investigateDS = () => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'investgNumber',
      label: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
    },
    {
      name: 'investgNumberRe',
      label: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
    },
    {
      name: 'processStatus',
      label: intl.get(`sslm.common.model.investigate.status`).d('调查表状态'),
    },
    {
      name: 'partnerCompanyNum',
      label: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
    },
    {
      name: 'supplierZhOrEnCompanyNum',
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
    },
    {
      name: 'companyNum',
      label: intl.get(`sslm.common.view.company.code`).d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
    },
    {
      name: 'investigateType',
      label: intl.get(`sslm.common.model.investigate.type`).d('调查表类型'),
    },
    {
      name: 'investigateLevel',
      label: intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度'),
    },
    {
      name: 'templateName',
      label: intl.get(`sslm.common.model.investigate.template.name`).d('调查表模板名称'),
    },
    {
      name: 'createUserName',
      label: intl.get(`sslm.common.view.creator.name`).d('创建人'),
    },
    {
      name: 'releaseDate',
      type: 'date',
      label: intl.get(`hzero.common.date.release`).d('发布日期'),
    },
    {
      name: 'createDate',
      type: 'dateTime',
      label: intl.get(`sslm.common.view.creation.time`).d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params = {}, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate/sending`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

// 调查表Columns
const investigateColumns = ({ jumpInvestigate }) => [
  {
    name: 'processStatus',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'investgNumber',
    width: 140,
    renderer: ({ value, record }) => {
      const { investgHeaderId, investigateTemplateId } = record.get([
        'investgHeaderId',
        'investigateTemplateId',
      ]);
      return (
        <a onClick={() => jumpInvestigate({ investgHeaderId, investigateTemplateId })}>{value}</a>
      );
    },
  },
  {
    name: 'investgNumberRe',
    width: 140,
    renderer: ({ record }) => {
      const { investgHeaderId, investigateTemplateId, investgNumber } = record.get([
        'investgHeaderId',
        'investigateTemplateId',
        'investgNumber',
      ]);
      return (
        <a
          onClick={() =>
            jumpInvestigate({ investgHeaderId, investigateTemplateId, openTabFlag: true })
          }
        >
          {investgNumber}
        </a>
      );
    },
  },
  {
    name: 'partnerCompanyNum',
    width: 120,
  },
  {
    name: 'supplierZhOrEnCompanyNum',
    width: 200,
  },
  {
    name: 'companyNum',
    width: 120,
  },
  {
    name: 'companyName',
    width: 200,
  },
  {
    name: 'investigateType',
    width: 100,
    renderer: ({ record }) => record.get('investigateTypeMeaning'),
  },
  {
    name: 'investigateLevel',
    width: 130,
    renderer: ({ record }) => record.get('investigateLevelMeaning'),
  },
  {
    name: 'templateName',
    width: 150,
  },
  {
    name: 'createUserName',
    width: 100,
  },
  {
    name: 'releaseDate',
    width: 150,
  },
  {
    name: 'createDate',
    width: 150,
  },
];

export { investigateDS, investigateColumns };
