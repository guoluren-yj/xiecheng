/*
 * @Date: 2023-04-06 10:21:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray, isObject } from 'lodash';
import { bucketDirectory } from '@/routes/utils/utils';

const tenantId = getCurrentOrganizationId();

export const getBasicDS = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'changeReqNumber',
      label: intl.get('sslm.supplierInform.model.supplierInform.applicationNum').d('申请单号'),
      // computedProps 使个性化配置不生效
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'createUserRealName',
      label: intl.get('sslm.supplierInform.model.supplierInform.creator').d('创建人'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'reqStatus',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_REQ_STATUS',
      label: intl.get('sslm.supplierInform.model.supplierInform.applicationState').d('申请状态'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'changeLevel',
      required: true,
      lookupCode: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      label: intl.get('sslm.supplierInform.model.supplierInform.latitudeChange').d('变更维度'),
      dynamicProps: {
        disabled: ({ record }) => record.get('changeReqId'),
      },
    },
    {
      name: 'companyName',
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      label: intl.get(`sslm.common.view.company.name`).d('公司'),
      dynamicProps: {
        required: ({ record }) => record.get('changeLevel') === 'COMPANY',
        disabled: ({ record }) =>
          record.get('changeReqId') || record.get('changeLevel') !== 'COMPANY',
        lovPara: ({ record }) => ({
          tenantId,
          supplierCompanyId: record.get('supplierCompanyId'),
        }),
      },
      transformRequest: value => value && value.companyName,
      transformResponse: (value, data) => {
        const { companyId, companyNum, companyName } = data;
        return value ? { companyId, companyNum, companyName } : null;
      },
    },
    {
      name: 'companyId',
      bind: 'companyName.companyId',
    },
    {
      name: 'companyNum',
      bind: 'companyName.companyNum',
    },
    {
      name: 'supplierLov',
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'SSLM.TENANT_SUPPLIER_CATE',
      textField: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.supplierCompany').d('供应商'),
      dynamicProps: {
        disabled: ({ record }) => record.get('changeReqId'),
        lovPara: ({ record }) => ({
          tenantId,
          srmFlag: 1,
          asyncCountFlag: 'Y',
          companyId: record.get('companyId'),
        }),
      },
      transformResponse: (value, data) => {
        const {
          supplierTenantId,
          supplierCompanyId,
          supplierCompanyNum,
          supplierCompanyName,
        } = data;
        return value
          ? { supplierTenantId, supplierCompanyId, supplierCompanyNum, supplierCompanyName }
          : null;
      },
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'purchaseAgentId',
      type: 'object',
      multiple: true,
      lovCode: 'HPFM.PURCHASE_AGENT_ID',
      lovPara: { tenantId },
      label: intl.get('sslm.supplierInform.model.otherInform.purchaseAgent').d('采购员'),
      transformRequest: value => {
        if (value) {
          const purchaseAgentIds = value.map(n => n.purchaseAgentId);
          return purchaseAgentIds.join(',');
        } else {
          return null;
        }
      },
      transformResponse: (value, data) => (value ? data.purchaseAgentIdMeaning : null),
    },
    {
      name: 'erpSupplierNum',
      disabled: true,
      label: intl.get('sslm.common.model.supplier.erpSupplierNum').d('ERP供应商编码'),
    },
    {
      name: 'erpSupplierName',
      disabled: true,
      label: intl.get('sslm.common.model.supplier.erpSupplierName').d('ERP供应商名称'),
    },
    {
      name: 'investigateTemplateId',
      type: 'object',
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      label: intl.get(`sslm.common.model.investigate.template`).d('调查表模板'),
      lovPara: {
        tenantId,
        enabledFlag: 1,
      },
      computedProps: {
        disabled: ({ record }) => record.get('changeReqId'),
      },
      transformRequest: value => value && value.investigateTemplateId,
      transformResponse: (value, data) => {
        const { investigateTemplateId, templateCode, templateName } = data;
        return value ? { investigateTemplateId, templateCode, templateName } : null;
      },
    },
    {
      name: 'templateCode',
      bind: 'investigateTemplateId.templateCode',
    },
    {
      name: 'templateName',
      bind: 'investigateTemplateId.templateName',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.supplierInfo,
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierInform.model.supplierInform.changeRemark').d('变更备注'),
    },
    {
      name: 'companyIds',
      type: 'object',
      lovCode: 'SSLM_SUPPLIER_CHANGE_EXTEND_COMPANY',
      multiple: true,
      label: intl.get('sslm.supplierInform.model.supplierInform.expandCompany').d('拓展公司'),
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('changeReqId') || record.get('changeLevel') !== 'COMPANY',
        lovPara: ({ record }) => ({
          tenantId,
          supplierCompanyId: record.get('supplierCompanyId'),
          companyIds: record.get('companyId'),
        }),
        help: ({ record }) =>
          record.get('changeReqId')
            ? ''
            : intl
                .get('sslm.supplierInform.model.supplierInform.title.expandCompanyInfo')
                .d('此次变更的内容将自动同步至选择的其他子公司'),
      },
      transformRequest: value =>
        isArray(value) ? value.map(i => i.companyId).join() : value.companyId,
      transformResponse: (value, data) => {
        const { companyNames = {} } = data;
        if (value && isObject(companyNames)) {
          const arr = [];
          for (const key in companyNames) {
            if (Object.hasOwnProperty.call(companyNames, key)) {
              const element = companyNames[key];
              arr.push({
                companyId: key,
                companyName: element,
              });
            }
          }
          return arr;
        }
        return null;
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'changeLevel':
          record.set({
            companyName: null,
          });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/supplier-change-reqs/firm-detail`,
      method: 'GET',
      params: {
        newPageQuery: 1,
        customizeUnitCode:
          'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC,SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.BASIC',
      },
    },
  },
});
