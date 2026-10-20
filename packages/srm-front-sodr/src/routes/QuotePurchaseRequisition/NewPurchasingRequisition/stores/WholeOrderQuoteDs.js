import { SRM_SPUC, SRM_SPRM } from '_utils/config';
import intl from 'utils/intl';
import { getValueField } from '../utils';

export default ({ tenantId, organizationId }) => {
  return {
    primaryKey: 'prHeaderId',
    selection: 'single',
    dataToJSON: 'selected',
    transport: {
      read: ({ params, data }) => ({
        url: `${SRM_SPRM}/v1/${tenantId}/po-refer-pr/pr-header`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SODR.PURCHASE_REQUISITION_LIST.ALL,SODR.PURCHASE_REQUISITION_LIST.FILTER_ALL',
        },
        data: null,
      }),
      submit: ({ data }) => ({
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/header`,
        method: 'POST',
        params: {
          prHeaderId: data[0].prHeaderId,
        },
      }),
    },
    queryFields: [
      {
        name: 'prNum',
        format: 'uppercase',
        label: intl.get(`sodr.common.model.common.displayPrNum`).d('采购申请编号'),
      },
      { name: 'title', label: intl.get(`sodr.common.model.common.title`).d('标题') },
      {
        name: 'requestDateFrom',
        type: 'date',
        max: 'requestDateTo',
        label: intl.get(`sodr.common.model.common.requestDateFrom`).d('申请日期从'),
      },
      {
        name: 'ouId',
        type: 'object',
        label: intl.get(`entity.business.tag`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        lovPara: {
          organizationId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'ouId')];
        },
      },
      {
        name: 'purchaseOrgId',
        type: 'object',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
        textField: 'organizationName',
        lovPara: {
          organizationId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'purchaseOrgId')];
        },
      },
      {
        name: 'requestDateTo',
        type: 'date',
        min: 'requestDateFrom',
        label: intl.get(`sodr.common.model.common.requestDateTo`).d('申请日期至'),
      },
      {
        name: 'companyId',
        type: 'object',
        label: intl.get(`entity.company.tag`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        lovPara: {
          organizationId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'companyId')];
        },
      },
      {
        name: 'purchaseAgentId',
        type: 'object',
        label: intl.get(`entity.purchaser.tag`).d('采购员'),
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        lovPara: {
          organizationId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'purchaseAgentId')];
        },
      },
      {
        name: 'requestedBy',
        type: 'object',
        label: intl.get(`entity.applier.tag`).d('申请人'),
        lovCode: 'SPUC.APPLY.USER',
        textField: 'realName',
        lovPara: {
          organizationId: tenantId,
        },
        transformRequest(value, record) {
          return value && value[getValueField(record, 'requestedBy')];
        },
      },
      {
        name: 'sourceCode',
        label: intl.get(`sodr.common.model.common.sourceCodeFrom`).d('单据来源'),
        lookupCode: 'SPRM.SRC_PLATFORM',
      },
      {
        name: 'urgentFlag',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
        lookupCode: 'HPFM.FLAG',
      },
    ],
    fields: [
      { name: 'prNum', label: intl.get(`sodr.common.model.common.displayPrNum`).d('采购申请编号') },
      { name: 'title', label: intl.get(`sodr.common.model.common.title`).d('标题') },
      {
        name: 'requestDate',
        type: 'date',
        label: intl.get(`sodr.common.model.common.requestDate`).d('申请日期'),
      },
      { name: 'companyName', label: intl.get(`entity.company.tag`).d('公司') },
      { name: 'ouName', label: intl.get(`entity.business.tag`).d('业务实体') },
      {
        name: 'organizationName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'purchaseAgentName',
        label: intl.get(`sodr.common.model.common.purchaser`).d('采购员'),
      },
      { name: 'requestedName', label: intl.get(`sodr.common.model.common.requestBy`).d('申请人') },
      {
        name: 'prSourcePlatformMeaning',
        label: intl.get(`sodr.common.model.common.prSourcePlatformMeaning`).d('单据来源'),
      },
      {
        name: 'ecSupplierCompanyName',
        label: intl.get('sodr.common.model.common.proposalSupplierName').d('建议供应商'),
      },
      {
        name: 'urgentFlag',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
      },
      {
        name: 'urgentDate',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentDate`).d('加急时间'),
      },
    ],
  };
};
