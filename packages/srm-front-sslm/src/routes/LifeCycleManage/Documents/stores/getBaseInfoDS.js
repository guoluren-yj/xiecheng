/*
 * @Date: 2022-12-09 13:59:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { hanldeC7nMultipleLovMeaning } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

export const getBaseInfoDS = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'documentNumber',
      disabled: true,
      label: intl.get('sslm.common.model.applicationNumber').d('申请单号'),
    },
    {
      name: 'realName',
      disabled: true,
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'createUserDepartmentId',
      type: 'object',
      lovCode: 'SPRM.USER_DEPARTMENT',
      lovPara: { tenantId },
      label: intl.get('sslm.common.view.creator.unitName').d('创建人部门'),
      transformRequest: value => {
        return value && value.unitId;
      },
      transformResponse: (value, object) =>
        value
          ? {
              unitId: object.createUserDepartmentId,
              unitName: object.createUserDepartment,
            }
          : null,
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
    {
      name: 'documentType',
      disabled: true,
      lookupCode: 'SSLM.LIFE_CYCLE_CHANGE_DOCUMENT_TYPE',
      label: intl.get('sslm.common.view.document.type').d('单据类型'),
    },
    {
      name: 'documentFrom',
      disabled: true,
      defaultValue: 'MANUALLY',
      lookupCode: 'SSLM.LIFE_CYCLE_CHANGE_DOCUMENT_FROM',
      label: intl.get('sslm.common.view.document.source').d('单据来源'),
    },
    {
      name: 'processStatus',
      disabled: true,
      lookupCode: 'SSLM.LIFE_CYCLE_REQ_STATUS',
      label: intl.get('sslm.common.view.document.status').d('单据状态'),
    },
    {
      name: 'supplierCompanyId',
      type: 'object',
      lovCode: 'SSLM.SUPPLIERS',
      lovPara: { tenantId },
      textField: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.supplierCompany').d('供应商'),
      dynamicProps: {
        required: ({ record }) => !record.get('requisitionId'),
      },
      transformRequest: value => value && value.supplierCompanyId,
      transformResponse: (value, object) =>
        value
          ? {
              dimensionCode: object.dimensionCode,
              supplierCompanyId: object.supplierCompanyId,
              supplierCompanyName: object.supplierCompanyName,
              supplierTenantId: object.supplierTenantId,
            }
          : null,
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyId.supplierTenantId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyId.supplierCompanyName',
    },
    {
      name: 'fromStageId',
      disabled: true,
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
      label: intl.get('sslm.common.view.sourceStage').d('起始阶段'),
    },
    {
      name: 'toStageId',
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
      label: intl.get('sslm.common.view.targetStage').d('目标阶段'),
      dynamicProps: {
        required: ({ record }) => !record.get('requisitionId'),
      },
    },
    {
      name: 'dimensionCode',
      disabled: true,
      bind: 'supplierCompanyId.dimensionCode',
      lookupCode: 'SSLM.LIFE_CYCLE_DIMENSION',
      label: intl.get('sslm.supplierLifeManage.model.supplier.dimension').d('管控维度'),
    },
    {
      name: 'companyId',
      type: 'object',
      lovCode: 'HPFM.PURCHASE_COMPANY',
      label: intl.get('sslm.common.view.company.name').d('公司'),
      transformRequest: value => value && value.companyId,
      transformResponse: (value, data) =>
        value && data.dimensionCode === 'COMPANY'
          ? {
              companyId: data.companyId,
              companyName: data.companyName,
            }
          : null,
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId,
          supplierCompanyId: record.get('supplierCompanyId')?.supplierCompanyId,
        }),
        disabled: ({ record }) => record.get('dimensionCode') !== 'COMPANY',
        required: ({ record }) => record.get('dimensionCode') === 'COMPANY',
      },
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
      name: 'remark',
      label: intl.get('sslm.common.model.instructions').d('说明'),
    },
    // 状态信息
    {
      name: 'blacklistFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.common.model.blacklist').d('黑名单'),
    },
    {
      name: 'blacklistDateType',
      label: intl.get('sslm.common.model.timeLimit').d('期限'),
      lookupCode: 'SSLM.LIFE_CYCLE_NEW_BLACK_LIST_DATE_TYPE',
      dynamicProps: {
        disabled: ({ record }) => !record.get('blacklistFlag'),
        required: ({ record }) => record.get('blacklistFlag'),
      },
    },
    {
      name: 'blacklistStartDate',
      type: 'date',
      max: 'blacklistEndDate',
      label: intl.get('sslm.common.model.dateFrom').d('有效期从'),
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        disabled: ({ record }) => record.get('blacklistDateType') !== 'CUSTOM_TIME',
        required: ({ record }) => record.get('blacklistDateType') === 'CUSTOM_TIME',
      },
    },
    {
      name: 'blacklistEndDate',
      type: 'date',
      min: 'blacklistStartDate',
      label: intl.get('sslm.common.model.dateTo').d('有效期至'),
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        disabled: ({ record }) => record.get('blacklistDateType') !== 'CUSTOM_TIME',
        required: ({ record }) => record.get('blacklistDateType') === 'CUSTOM_TIME',
      },
    },
    {
      name: 'tempFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.common.stage.temporary').d('临时'),
    },
    {
      name: 'tempEndDate',
      type: 'date',
      min: moment(),
      label: intl.get('sslm.common.model.dateTo').d('有效期至'),
      dynamicProps: {
        required: ({ record }) => record.get('tempFlag'),
        disabled: ({ record }) => !record.get('tempFlag'),
      },
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    // 其他信息
    {
      name: 'purchaseAgentId',
      type: 'object',
      multiple: true,
      lovCode: 'HPFM.PURCHASE_AGENT_ID',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.buyer').d('采购员'),
      transformRequest: value =>
        value && isArray(value) && value.map(n => n.purchaseAgentId).join(','),
      transformResponse: (_, object) =>
        object && hanldeC7nMultipleLovMeaning(object.purchaseAgentIdMeaning),
    },
    {
      name: 'termId',
      type: 'object',
      lovCode: 'SSLM.PAYMENT.TERM',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.paymentTerms').d('付款条款'),
      transformRequest: value => value && value.termId,
      transformResponse: (value, object) =>
        value
          ? {
              termId: object.termId,
              termName: object.termIdMeaning,
            }
          : null,
    },
    {
      name: 'typeCode',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE_CODE',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.paymentWay').d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, object) =>
        value
          ? {
              typeCode: object.typeCode,
              typeName: object.typeCodeMeaning,
            }
          : null,
    },
    // 附件信息
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('hzero.common.upload.modal.attachment').d('附件'),
    },
  ],
  events: {
    update: ({ name, record, value, oldValue }) => {
      switch (name) {
        case 'supplierCompanyId':
          record.set('companyId', null);
          record.set('fromStageId', null);
          break;
        case 'companyId':
          record.set('fromStageId', null);
          break;
        case 'blacklistDateType': // 期限
          if (value && value === 'CUSTOM_TIME') {
            record.set('blacklistStartDate', new Date());
          } else {
            record.set({
              blacklistStartDate: null,
              blacklistEndDate: null,
            });
          }
          break;
        case 'blacklistFlag': // 黑名单
          if (value) {
            record.set({
              tempFlag: null,
            });
          }
          if (value !== oldValue) {
            record.set({
              blacklistDateType: null,
              blacklistStartDate: null,
              blacklistEndDate: null,
            });
          }
          break;
        case 'tempFlag':
          if (value) {
            record.set({
              blacklistFlag: null,
            });
          }
          record.set({
            tempEndDate: null,
          });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { queryParmas: { requisitionId, ...others } = {} } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-reqss/${requisitionId}`,
        method: 'GET',
        params: {},
        data: others,
      };
    },
  },
});
