import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SCUX_2 } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const prefix = 'spfm.dashboard';
const dateTimeData = (isPurchaser = true) => ({
  autoCreate: true,
  fields: [
    {
      name: 'scheduleName',
      type: 'string',
      label: intl.get(`${prefix}.view.model.scheduleName`).d('日常/会议主题'),
      required: true,
    },
    {
      name: 'aiweiScheduleReception',
      label: intl.get(`${prefix}.view.model.aiweiScheduleReception`).d('接待人员'),
      type: 'object',
      lovCode: 'SCUX.AIWEI_SUB_ACCOUNT',
      required: isPurchaser,
      multiple: true,
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'companyIdLov',
      type: 'object',
      label: isPurchaser
        ? intl.get(`${prefix}.view.model.companyId`).d('公司')
        : intl.get(`${prefix}.view.model.companySupplier`).d('供应商'),
      lovCode: isPurchaser ? 'SPFM.USER_AUTHORITY_COMPANY' : 'SCUX.AIWEI.USER_AUTH.COMPANY',
      lovPara: { tenantId: organizationId },
      required: isPurchaser,
      ignore: 'always',
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyIdLov.companyName',
    },
    {
      name: 'companyNum',
      bind: 'companyIdLov.companyNum',
    },
    {
      name: 'supplierTenantIdLov',
      type: 'object',
      label: intl.get(`${prefix}.view.model.date1`).d('供应商公司'),
      lovCode: 'SSLM.TENANT_SUPPLIER_CATE',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierTenantIdLov.supplierTenantId',
    },
    {
      name: 'supplierName',
      bind: 'supplierTenantIdLov.supplierName',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierTenantIdLov.supplierCompanyNum',
    },
    {
      name: 'suitableSupplier',
      type: 'string',
      label: intl.get(`${prefix}.view.model.suitableSupplier`).d('不协同供应商'),
    },
    {
      name: 'conferenceRoom',
      type: 'string',
      label: intl.get(`${prefix}.view.model.conferenceRoom`).d('会议室'),
      required: isPurchaser,
    },
    {
      name: 'startTime',
      type: 'dateTime',
      label: intl.get(`${prefix}.view.model.startTime`).d('开始'),
      required: true,
      max: 'endTime',
    },
    {
      name: 'endTime',
      type: 'dateTime',
      label: intl.get(`${prefix}.view.model.endTime`).d('结束'),
      required: true,
      min: 'startTime',
    },
    {
      name: 'remind',
      type: 'string',
      label: intl.get(`${prefix}.view.model.remind`).d('提醒'),
      lookupCode: 'SCUX.AIWEI_REMIND',
      required: true,
    },
    {
      name: 'aiweiScheduleVisit',
      label: isPurchaser
        ? intl.get(`${prefix}.view.model.aiweiScheduleVisit`).d('来访人员')
        : intl.get(`${prefix}.view.model.aiweiScheduleArrive`).d('到访人员'),
    },
  ],
});

const aiweiSchedulePersons = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'receptionistName',
      type: 'string',
      label: intl.get(`${prefix}.view.model.receptionistName`).d('姓名'),
    },
    {
      name: 'positionName',
      type: 'string',
      label: intl.get(`${prefix}.view.model.position`).d('职位'),
    },
    {
      name: 'mailbox',
      type: 'email',
      label: intl.get(`${prefix}.view.model.mailbox`).d('邮箱'),
    },
  ],
});

const calendarData = () => ({
  fields: [],
  transport: {
    read: () => {
      return {
        url: `${SRM_SCUX_2}/v1/${organizationId}/aiwei-schedule-heards/card`,
        method: 'GET',
      };
    },
  },
});

const posonInfoData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'reception',
      type: 'string',
      label: intl.get(`${prefix}.view.model.reception`).d('接待人员'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${prefix}.view.model.companyName`).d('公司'),
    },
    {
      name: 'visit',
      type: 'string',
      label: intl.get(`${prefix}.view.model.visit`).d('来访人员'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get(`${prefix}.view.model.supplierName`).d('供应商公司'),
    },
    {
      name: 'conferenceRoom',
      type: 'string',
      label: intl.get(`${prefix}.view.model.conferenceRoom`).d('会议室'),
    },
    {
      name: 'reason',
      type: 'string',
      label: intl.get(`${prefix}.view.model.reason`).d('拒绝理由'),
    },
    {
      name: 'reason',
      type: 'string',
      label: intl.get(`${prefix}.view.model.reason`).d('拒绝理由'),
      required: true,
    },
  ],

  transport: {
    read: (values) => {
      const {
        data: { scheduleHeardId },
      } = values;
      return {
        url: `${SRM_SCUX_2}/v1/${organizationId}/aiwei-schedule-heards/${scheduleHeardId}`,
        method: 'GET',
      };
    },
  },
});

export { dateTimeData, aiweiSchedulePersons, calendarData, posonInfoData };
