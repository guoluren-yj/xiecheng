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

const organizationId = getCurrentOrganizationId();
export default () => ({
  autoCreate: true,
  paging: false,
  autoQueryAfterSubmit: true,
  primaryKey: 'evalEventHeaderId',
  fields: [
    {
      name: 'evalEventNumber',
      disabled: true,
      label: intl.get('sslm.eventRecord.model.evalEventHeader.evalEventNumber').d('考评事件编号'),
    },
    {
      name: 'eventDesc',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventDesc').d('考评事件描述'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'eventStatus',
      lookupCode: 'SSLM.EVAL_EVENT_STATUS',
      defaultValue: 'NEW',
      disabled: true,
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventStatus').d('状态'),
    },
    {
      name: 'eventStatusMeaning',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventStatus').d('状态'),
    },
    {
      name: 'companyIdLov',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.companyId').d('公司'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.companyId').d('公司'),
    },
    {
      name: 'companyName',
      bind: 'companyIdLov.companyName',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.companyId').d('公司'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'ouId',
      type: 'object',
      lovCode: 'HPFM.OU',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.ouId').d('业务实体'),
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record?.get('companyId'),
        }),
      },
      transformResponse: (value, data) =>
        value
          ? {
              ouId: data.ouId,
              ouName: data.ouName,
            }
          : null,
      transformRequest: value => (value ? value.ouId : null),
    },
    {
      name: 'supplierTenantIdLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.INVESTIGATE_PARTNER',
      lovPara: {
        tenantId: organizationId,
      },
      cascadeMap: {
        companyId: 'companyId',
      },
      label: intl.get('sslm.eventRecord.model.evalEventHeader.supplierTenantId').d('供应商'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierTenantIdLov.partnerCompanyId',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.supplierCompanyId').d('供应商公司id'),
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierTenantIdLov.companyName',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.supplierTenantId').d('供应商'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierTenantIdLov.supplierTenantId',
    },
    {
      name: 'createUserName',
      disabled: true,
      label: intl.get('sslm.eventRecord.model.evalEventHeader.createUserName').d('创建人'),
    },
    {
      name: 'eventType',
      lookupCode: 'SSLM.EVAL_EVENT_TYPE',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventType').d('事件类型'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'eventTypeMeaning',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventType').d('事件类型'),
    },
    {
      name: 'eventDate',
      type: 'dateTime',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.eventDate').d('事件发生时间'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.creationDate').d('创建时间'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.eventRecord.model.evalEventHeader.remark').d('说明'),
      dynamicProps: {
        required: ({ record }) => ['NEW', 'REJECTED'].includes(record?.get('eventStatus')),
      },
    },
    {
      name: 'tenantId',
      defaultValue: organizationId,
    },
    {
      name: 'attachmentUuid',
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { evalEventHeaderId, customizeUnitCode } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-header/${evalEventHeaderId}/getSingle`,
        method: 'GET',
        data: {},
        params: {
          customizeUnitCode,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-header/batchDel`,
        method: 'DELETE',
        data: data.map(item => item.evalEventHeaderId),
        params,
      };
    },
    create: ({ data, params }) => {
      const [Data = {}] = data;
      const { evalEventLines = [], evalEventHeaderId } = Data;
      Data.evalEventLines = evalEventLines.map(item => ({
        ...item,
        evalEventHeaderId,
      }));
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-header/save`,
        method: 'POST',
        data: Data,
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE,SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER',
        },
      };
    },
    update: ({ data, params }) => {
      const [Data = {}] = data;
      const { evalEventLines = [], evalEventHeaderId } = Data;
      Data.evalEventLines = evalEventLines.map(item => ({
        ...item,
        evalEventHeaderId,
      }));
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-header/save`,
        method: 'POST',
        data: Data,
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE,SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER',
        },
      };
    },
  },
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'companyIdLov': {
          record.set('supplierTenantIdLov', null);
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});
