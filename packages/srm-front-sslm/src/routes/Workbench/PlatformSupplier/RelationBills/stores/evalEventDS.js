/*
 * @Date: 2023-03-09 11:41:51
 * @Author: ZLH <longhui.zou@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { renderStatus } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

const evalEventDS = params => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'eventStatus',
      lookupCode: 'SSLM.EVAL_EVENT_STATUS',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventStatus').d('状态'),
    },
    {
      name: 'evalEventNumber',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.evalEventNumber').d('考评事件编号'),
    },
    {
      name: 'evalEventNumberRe',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.evalEventNumber').d('考评事件编号'),
    },
    {
      name: 'eventDesc',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventDesc').d('考评事件描述'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.companyId').d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.supplierTenantId').d('供应商'),
    },
    {
      name: 'eventType',
      lookupCode: 'SSLM.EVAL_EVENT_TYPE',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventTypeMeaning').d('事件类型'),
    },
    {
      name: 'eventDate',
      type: 'dateTime',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventDate').d('事件发生时间'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.creationDate').d('创建时间'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.createUserName').d('创建人'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-event-header`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVAL_EVENT,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALEVENT_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

const evalEventColumns = ({ jumpEvalEvent }) => [
  {
    name: 'eventStatus',
    width: 100,
    renderer: renderStatus,
  },
  {
    name: 'evalEventNumber',
    width: 130,
    renderer: ({ value, record }) => <a onClick={() => jumpEvalEvent(record)}>{value}</a>,
  },
  {
    name: 'evalEventNumberRe',
    width: 130,
    renderer: ({ record }) => (
      <a onClick={() => jumpEvalEvent(record, true)}>{record.get('evalEventNumber')}</a>
    ),
  },
  {
    name: 'eventDesc',
    width: 130,
  },
  {
    name: 'companyName',
    width: 130,
  },
  {
    name: 'supplierCompanyName',
    width: 130,
  },
  {
    name: 'eventType',
    width: 130,
  },
  {
    name: 'eventDate',
    width: 160,
  },
  {
    name: 'creationDate',
    width: 160,
  },
  {
    name: 'createUserName',
    width: 130,
  },
];

export { evalEventDS, evalEventColumns };
