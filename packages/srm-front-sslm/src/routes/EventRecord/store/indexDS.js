/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
export default () => ({
  autoQuery: true,
  primaryKey: 'evalEventHeaderId',
  cacheSelection: true,
  pageSize: 20,
  queryFields: [
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
      name: 'eventDesc',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventDesc').d('考评事件描述'),
    },
    {
      name: 'companyIdLov',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.companyId').d('公司'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.companyId').d('公司'),
    },
    {
      name: 'supplierTenantIdLov',
      type: 'object',
      ignore: 'always',
      lovPara: {
        tenantId: organizationId,
        asyncCountFlag: 'Y',
      },
      lovCode: 'SSLM.INVESTIGATE_PARTNER',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.supplierTenantId').d('供应商'),
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierTenantIdLov.partnerCompanyId',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.supplierTenantId').d('供应商'),
    },
    {
      name: 'eventType',
      lookupCode: 'SSLM.EVAL_EVENT_TYPE',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventType').d('事件类型'),
    },
    {
      name: 'createStartDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sslm.eventRecord.model.evalEventHeader.createStartDate').d('创建时间从'),
      dynamicProps: {
        max: ({ record }) => {
          if (record && record.get('createEndDate')) {
            return record.get('createEndDate');
          }
        },
      },
    },
    {
      name: 'createEndDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sslm.eventRecord.model.evalEventHeader.createEndDate').d('创建时间至'),
      dynamicProps: {
        min: ({ record }) => {
          if (record && record.get('createStartDate')) {
            return record.get('createStartDate');
          }
        },
      },
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.createUserName').d('创建人'),
    },
    {
      name: 'happenStartDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sslm.eventRecord.model.evalEventHeader.happenStartDate').d('事件发生日期从'),
      dynamicProps: {
        max: ({ record }) => {
          if (record && record.get('happenEndDate')) {
            return record.get('happenEndDate');
          }
        },
      },
    },
    {
      name: 'happenEndDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl
        .get('sslm.eventRecord.model.evalEventHeader.dateOfIncidentTo')
        .d('事件发生日期至'),
      dynamicProps: {
        min: ({ record }) => {
          if (record && record.get('happenStartDate')) {
            return record.get('happenStartDate');
          }
        },
      },
    },
  ],
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
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-header`,
        method: 'GET',
        params,
        data: {
          ...data,
          customizeUnitCode:
            'SSLM.EVALUATION_EVENT_RECORD.LIST.LIST_TABLE,SSLM.EVALUATION_EVENT_RECORD.LIST.SEARCH_BAR',
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-header/batchDel`,
        method: 'DELETE',
        params,
        data: data.map(item => item.evalEventHeaderId),
      };
    },
  },
});
